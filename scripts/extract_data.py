#!/usr/bin/env python3
import json
import os
import shutil
import subprocess
import argparse
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor, as_completed
import multiprocessing
import hashlib
import sys

def handle_repo(org_name, repo, workspace_dir):
    """Clone or update a single repository."""
    repo_path = Path(workspace_dir) / repo
    try:
        if not repo_path.exists():
            # Clone new repository
            subprocess.run(
                ['gh', 'repo', 'clone', f'{org_name}/{repo}', str(repo_path)],
                check=True,
                capture_output=True,
                text=True
            )
            print(f"Cloned {repo}")
        else:
            # Update existing repository
            subprocess.run(
                ['git', 'fetch', '--all'],
                check=True,
                cwd=str(repo_path),
                capture_output=True,
                text=True
            )
            subprocess.run(
                ['git', 'reset', '--hard', 'origin/main'],
                check=True,
                cwd=str(repo_path),
                capture_output=True,
                text=True
            )
            print(f"Updated {repo}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error processing {repo}: {e.stderr}")
        return False

def clone_repos(org_name, workspace_dir):
    """Clone all repositories from a GitHub organization using parallel processing."""
    # Create workspace directory if it doesn't exist
    Path(workspace_dir).mkdir(parents=True, exist_ok=True)

    # Get all repo names using GitHub API with pagination
    cmd = [
        'gh', 'api',
        '-H', 'Accept: application/vnd.github+json',
        '-H', 'X-GitHub-Api-Version: 2022-11-28',
        f'/orgs/{org_name}/repos',
        '--jq', '.[].name',
        '-X', 'GET',
        '--paginate'
    ]

    try:
        repos = subprocess.check_output(cmd).decode().strip().split('\n')
    except subprocess.CalledProcessError as e:
        print(f"Error fetching repositories: {e}")
        return

    # Filter out excluded repos
    filtered_repos = [
        repo for repo in repos
        if '.' not in repo
    ]

    print(f"Found {len(filtered_repos)} repositories to process")

    # Determine optimal number of workers based on CPU cores
    num_workers = min(32, multiprocessing.cpu_count() * 2)  # Cap at 32 workers

    # Process repositories in parallel
    successful = 0
    failed = 0

    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        # Submit all tasks
        future_to_repo = {
            executor.submit(handle_repo, org_name, repo, workspace_dir): repo
            for repo in filtered_repos
        }

        # Process completed tasks
        for future in as_completed(future_to_repo):
            repo = future_to_repo[future]
            try:
                if future.result():
                    successful += 1
                else:
                    failed += 1
            except Exception as e:
                print(f"Error processing {repo}: {str(e)}")
                failed += 1

    print(f"\nProcessing completed:")
    print(f"Successfully processed: {successful}")
    print(f"Failed: {failed}")
    if failed > 0:
        print("Check the error messages above for details about failed repositories.")

def parse_signalset(file_path, make, model):
    """Parse a signalset JSON file and extract parameter information."""
    with open(file_path) as f:
        data = json.load(f)

    parameters = []
    for cmd in data.get('commands', []):
        hdr = cmd.get('hdr', '')

        # Extract debug flag from command
        debug_flag = cmd.get('dbg', False)

        for pid, value in cmd.get('cmd', {}).items():
            for signal in cmd.get('signals', []):
                fmt = signal.get('fmt', {})
                scaling = ''

                # Generate scaling equation
                if 'map' in fmt:
                    scaling = f"Mapped values: {fmt['map']}"
                else:
                    components = []
                    if 'mul' in fmt:
                        components.append(f"*{fmt['mul']}")
                    if 'div' in fmt:
                        components.append(f"/{fmt['div']}")
                    if 'add' in fmt:
                        components.append(f"+{fmt['add']}")

                    scaling = f"raw{' '.join(components)}"

                    # Add clamping if min/max are specified
                    if 'min' in fmt or 'max' in fmt:
                        clamping = []
                        if 'min' in fmt:
                            clamping.append(str(fmt['min']))
                        if 'max' in fmt:
                            clamping.append(str(fmt['max']))
                        scaling += f" clamped to [{', '.join(clamping)}]"

                # Extract bit information
                bit_offset = fmt.get('bix', 0)  # bit index/offset
                bit_length = fmt.get('len', 8)  # bit length, default to 8 if not specified

                parameters.append({
                    'hdr': hdr,
                    'pid': pid,
                    'cmd': cmd.get('cmd', {}),
                    'id': signal.get('id', ''),
                    'name': signal.get('name', ''),
                    'unit': fmt.get('unit', ''),
                    'suggestedMetric': signal.get('suggestedMetric', ''),
                    'scaling': scaling,
                    'path': signal.get('path', ''),
                    'make': make,
                    'model': model,
                    'bitOffset': bit_offset,
                    'bitLength': bit_length,
                    'debug': debug_flag
                })

    return parameters

def calculate_hash(data):
    """Calculate a hash from the sorted and normalized data for easy comparison."""
    # Sort the data deterministically
    data_copy = sorted(data, key=lambda x: (x['make'], x['model'], x['hdr'], x['id']))
    # Convert to a string and hash
    data_str = json.dumps(data_copy, sort_keys=True)
    return hashlib.sha256(data_str.encode()).hexdigest()

def extract_data(workspace_dir, output_dir, force=False):
    """Extract matrix data from all repositories."""
    matrix_data = []
    temp_output_path = Path(output_dir) / 'matrix_data_temp.json'
    final_output_path = Path(output_dir) / 'matrix_data.json'

    # Process each repository
    for repo_dir in Path(workspace_dir).iterdir():
        if not repo_dir.is_dir():
            continue

        signalset_path = repo_dir / 'signalsets' / 'v3' / 'default.json'
        if not signalset_path.exists():
            print(f"No signalset found for {repo_dir.name}, skipping...")
            continue

        # Extract make and model from repo name
        make, model = repo_dir.name.split('-', 1) if '-' in repo_dir.name else (repo_dir.name, '')

        print(f"Processing {make} {model}...")
        parameters = parse_signalset(signalset_path, make, model)
        matrix_data.extend(parameters)

    # Create output directory
    os.makedirs(output_dir, exist_ok=True)

    # Check if we need to update the file
    current_hash = calculate_hash(matrix_data)

    # Write to temporary file first
    with open(temp_output_path, 'w') as f:
        json.dump(matrix_data, f, indent=2, sort_keys=True)

    # Run the validation and normalization process
    print("Running validation and normalization...")
    validate_script = Path(__file__).parent / 'validate_json.py'

    if not validate_script.exists():
        print(f"Warning: validate_json.py not found at {validate_script}, skipping validation")
        shutil.move(temp_output_path, final_output_path)
    else:
        try:
            # Use the validation script for consistent outputs
            subprocess.run([
                sys.executable,
                str(validate_script),
                '--input', str(temp_output_path),
                '--output', str(final_output_path)
            ], check=True)

            # Clean up temp file
            os.remove(temp_output_path)
        except subprocess.CalledProcessError as e:
            print(f"Error validating JSON: {e}")
            # Fall back to raw output if validation fails
            shutil.move(temp_output_path, final_output_path)

    print(f"Saved matrix data to {final_output_path} ({len(matrix_data)} parameters total)")

    # Compare with previous version if it exists
    if final_output_path.exists() and not force:
        with open(final_output_path) as f:
            old_data = json.load(f)
        old_hash = calculate_hash(old_data)

        if old_hash == current_hash:
            print("No changes detected in the data.")
        else:
            print("Changes detected in the matrix data.")

    return matrix_data

def main():
    parser = argparse.ArgumentParser(description='Extract OBD parameter data for the OBDb Explorer')
    parser.add_argument('--org', default='OBDb', help='GitHub organization name')
    parser.add_argument('--workspace', default='workspace', help='Workspace directory for cloning repos')
    parser.add_argument('--output', default='public/data', help='Output directory for JSON data')
    parser.add_argument('--fetch', action='store_true', help='Fetch/update repositories before extraction')
    parser.add_argument('--force', action='store_true', help='Force update even if no changes detected')
    args = parser.parse_args()

    # Only clone/update repositories if --fetch is specified
    if args.fetch:
        print("Fetching repositories...")
        clone_repos(args.org, args.workspace)
    elif not Path(args.workspace).exists():
        print(f"Error: Workspace directory '{args.workspace}' does not exist. Use --fetch to clone repositories.")
        return

    # Extract data from the repositories
    print("Extracting data from repositories...")
    extract_data(args.workspace, args.output, args.force)

    print(f"Data extraction complete. The JSON file is ready for use in the React application.")

if __name__ == '__main__':
    main()

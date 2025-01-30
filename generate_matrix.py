#!/usr/bin/env python3
import json
import os
import shutil
import subprocess
from pathlib import Path
import argparse
from html_generator import generate_html

def clone_repos(org_name, workspace_dir):
    """Clone all repositories from a GitHub organization."""
    # Create workspace directory if it doesn't exist
    Path(workspace_dir).mkdir(parents=True, exist_ok=True)
    
    # Get list of repositories using GitHub API
    cmd = f'gh repo list {org_name} --json name -q ".[].name"'
    repos = subprocess.check_output(cmd, shell=True).decode().strip().split('\n')
    
    for repo in repos:
        repo_path = Path(workspace_dir) / repo
        if not repo_path.exists():
            subprocess.run(['gh', 'repo', 'clone', f'{org_name}/{repo}', str(repo_path)], check=True)

def parse_signalset(file_path):
    """Parse a signalset JSON file and extract parameter information."""
    with open(file_path) as f:
        data = json.load(f)
    
    parameters = []
    for cmd in data.get('commands', []):
        hdr = cmd.get('hdr', '')
        for pid in cmd.get('cmd', {}):
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
                    if 'min' in fmt:
                        components.append(f"+{fmt['min']}")
                    if components:
                        scaling = f"raw{' '.join(components)}"
                
                parameters.append({
                    'hdr': hdr,
                    'pid': pid,
                    'id': signal.get('id', ''),
                    'name': signal.get('name', ''),
                    'unit': fmt.get('unit', ''),
                    'suggestedMetric': signal.get('suggestedMetric', ''),
                    'scaling': scaling,
                    'path': signal.get('path', '')
                })
    
    return parameters

def generate_matrix_data(workspace_dir):
    """Generate matrix data from all repositories."""
    matrix_data = []
    
    for repo_dir in Path(workspace_dir).iterdir():
        if not repo_dir.is_dir():
            continue
        
        signalset_path = repo_dir / 'signalsets' / 'v3' / 'default.json'
        if not signalset_path.exists():
            continue
        
        # Extract make and model from repo name
        make, model = repo_dir.name.split('-', 1) if '-' in repo_dir.name else (repo_dir.name, '')
        
        parameters = parse_signalset(signalset_path)
        for param in parameters:
            param['make'] = make
            param['model'] = model
        
        matrix_data.extend(parameters)
    
    return matrix_data

def main():
    parser = argparse.ArgumentParser(description='Generate OBD parameter matrix website')
    parser.add_argument('--org', default='OBDb', help='GitHub organization name')
    parser.add_argument('--workspace', default='workspace', help='Workspace directory for cloning repos')
    parser.add_argument('--output', default='site', help='Output directory for generated website')
    args = parser.parse_args()
    
    # Clone repositories
    clone_repos(args.org, args.workspace)
    
    # Generate matrix data
    matrix_data = generate_matrix_data(args.workspace)
    
    # Generate HTML visualization using the imported module
    generate_html(matrix_data, args.output)
    
    print(f"Website generated in {args.output} directory")

if __name__ == '__main__':
    main()

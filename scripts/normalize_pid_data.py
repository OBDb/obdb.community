#!/usr/bin/env python3
"""
Script to normalize PID support data from CSV files into standardized JSON format
for the OBDb Explorer project.

This script processes CSV files containing information about which service 01 PIDs
are supported by different model years and ECUs.

Usage:
    python normalize_pid_data.py --input exportconfirmedservice01pidsbymodelyear.csv --output pid_support.json
"""

import argparse
import csv
import json
import os
import re
from pathlib import Path
import logging

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Regular expression to match the model year pattern in CSV
MODEL_YEAR_PATTERN = re.compile(r'^(\d{4})::(.+)$')

# Regular expression to match ECU header and PID format
ECU_PID_PATTERN = re.compile(r'^([\dA-Fa-f]{3,4})(?:\.([\dA-Fa-f]{3,4}))?\.(?:01)?([01][\dA-Fa-f]+)$')

def parse_csv(file_path):
    """Parse the PID support CSV file."""
    logger.info(f"Parsing CSV file: {file_path}")

    # Data structure to store normalized data
    pid_data = {
    }

    try:
        with open(file_path, 'r', encoding='utf-8') as csvfile:
            reader = csv.reader(csvfile)
            # Skip header row
            next(reader, None)

            for row in reader:
                if not row or len(row) < 2:
                    continue

                commands = row[0]

                # Process model years from the text
                year_match = MODEL_YEAR_PATTERN.match(commands)
                if year_match:
                    model_year = year_match.group(1)
                    pid_list_text = year_match.group(2)

                    # Parse the PIDs
                    pids = [pid.strip() for pid in pid_list_text.split(',') if pid.strip()]

                    # Initialize model year if not exists
                    if model_year not in pid_data:
                        pid_data[model_year] = {
                        }

                    # Simple PIDs (without ECU header specified)
                    for pid in pids:
                        # Check if this is a complex PID format (with ECU header)
                        ecu_match = ECU_PID_PATTERN.match(pid)

                        if ecu_match:
                            # Extract ECU header and PID
                            ecu_header = ecu_match.group(1).upper()
                            # Skip receive filter (group 2) as mentioned
                            pid_value = ecu_match.group(3).upper()

                            # Initialize ECU if not exists
                            if ecu_header not in pid_data[model_year]:
                                pid_data[model_year][ecu_header] = []

                            if len(pid_value) == 4:
                                pid_value = pid_value[2:]

                            # Add PID to ECU's supported list
                            if pid_value not in pid_data[model_year][ecu_header]:
                                pid_data[model_year][ecu_header].append(pid_value)
                        else:
                            # For PIDs without ECU header, we'll use the default ECU
                            if "7E0" not in pid_data[model_year]:
                                pid_data[model_year]["7E0"] = []

                            # Add PID to default ECU's supported list
                            if pid not in pid_data[model_year]["7E0"]:
                                pid_data[model_year]["7E0"].append(pid)

        # Sort PIDs in each ECU for better readability
        for model_year in pid_data:
            for ecu in pid_data[model_year]:
                pid_data[model_year][ecu].sort()

        return pid_data

    except Exception as e:
        logger.error(f"Error parsing CSV file: {e}")
        raise

def write_json(data, output_path):
    """Write the normalized data to a JSON file."""
    logger.info(f"Writing JSON data to: {output_path}")

    try:
        # Create directory if it doesn't exist
        if os.path.dirname(output_path):
            os.makedirs(os.path.dirname(output_path), exist_ok=True)

        with open(output_path, 'w', encoding='utf-8') as f:
            # Use custom JSON encoder to format arrays on single lines
            class CompactJSONEncoder(json.JSONEncoder):
                def encode(self, obj):
                    if isinstance(obj, list) and all(isinstance(x, str) for x in obj):
                        # For arrays of strings (PID arrays), keep them on one line
                        parts = [self.encode(item) for item in obj]
                        return "[" + ", ".join(parts) + "]"
                    return super().encode(obj)

            json_str = json.dumps(data, cls=CompactJSONEncoder, indent=2, sort_keys=True)
            # Further compact ECU command arrays by regex replacing multi-line arrays
            import re
            json_str = re.sub(r'\[\n\s+("[0-9A-F]{2}",?\s*)+\n\s+\]', lambda m: m.group(0).replace('\n', ' ').replace('  ', ''), json_str)
            f.write(json_str)

        logger.info(f"Successfully wrote JSON data to: {output_path}")

    except Exception as e:
        logger.error(f"Error writing JSON file: {e}")
        raise

def main():
    """Main function to run the script."""
    parser = argparse.ArgumentParser(description='Normalize PID support data from CSV to JSON')
    parser.add_argument('--input', required=True, help='Input CSV file path')
    parser.add_argument('--output', required=True, help='Output JSON file path')

    args = parser.parse_args()

    try:
        # Parse CSV and get normalized data
        pid_data = parse_csv(args.input)

        # Write to JSON file
        write_json(pid_data, args.output)

        logger.info("PID data normalization completed successfully.")

    except Exception as e:
        logger.error(f"Error processing file: {e}")
        return 1

    return 0

if __name__ == "__main__":
    exit(main())

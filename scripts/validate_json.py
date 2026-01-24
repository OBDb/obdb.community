#!/usr/bin/env python3
import json
import os
import sys
import argparse
import jsonschema
from pathlib import Path
from datetime import datetime

def deep_sort_dict(obj):
    """
    Recursively sort dictionary keys and lists for consistent output.
    This ensures the JSON output is deterministic across different runs.
    """
    if isinstance(obj, dict):
        return {k: deep_sort_dict(obj[k]) for k in sorted(obj.keys())}
    elif isinstance(obj, list):
        if len(obj) > 0 and isinstance(obj[0], dict):
            # For a list of dictionaries, sort by their serialized string
            # representation to ensure consistent ordering
            return sorted([deep_sort_dict(i) for i in obj],
                          key=lambda x: json.dumps(x, sort_keys=True))
        else:
            # For other lists, just sort the elements if they're sortable
            try:
                return sorted(obj)
            except TypeError:
                # If elements aren't comparable, just sort each element recursively
                return [deep_sort_dict(i) for i in obj]
    else:
        return obj

def load_schema(schema_path):
    """Load and parse the JSON schema"""
    with open(schema_path, 'r') as f:
        return json.load(f)

def validate_and_normalize_json(input_path, output_path, schema_path=None):
    """
    Validate the JSON against schema, sort it for consistent output,
    and write it to the output file.
    """
    # Load the input JSON
    with open(input_path, 'r') as f:
        data = json.load(f)

    # Validate against schema if provided
    if schema_path:
        schema = load_schema(schema_path)
        try:
            jsonschema.validate(instance=data, schema=schema)
            print(f"✅ JSON is valid according to schema")
        except jsonschema.exceptions.ValidationError as e:
            print(f"❌ JSON validation error: {e}")
            return False

    # Sort the data for consistent output
    sorted_data = deep_sort_dict(data)

    # Ensure the output directory exists
    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    # Add metadata as a comment at the top of the file
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # Write the sorted data (minified for serving)
    with open(output_path, 'w') as f:
        json.dump(sorted_data, f, separators=(',', ':'))

    print(f"✅ Normalized JSON written to {output_path}")
    return True

def main():
    parser = argparse.ArgumentParser(description="Validate and normalize JSON data for consistent output")
    parser.add_argument('--input', required=True, help='Input JSON file path')
    parser.add_argument('--output', required=True, help='Output normalized JSON file path')
    parser.add_argument('--schema', help='JSON schema file path for validation')
    args = parser.parse_args()

    # If schema not provided, use the default schema in the same directory
    if not args.schema:
        default_schema = Path(__file__).parent / 'matrix_data_schema.json'
        if default_schema.exists():
            args.schema = str(default_schema)
            print(f"Using default schema: {default_schema}")

    success = validate_and_normalize_json(args.input, args.output, args.schema)
    if not success:
        sys.exit(1)

if __name__ == '__main__':
    main()

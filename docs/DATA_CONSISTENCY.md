# Data Consistency Guidelines

This document outlines the processes and tools we use to ensure data consistency in the OBDb Explorer application, particularly for the `matrix_data.json` file that's generated from multiple repositories.

## Why Data Consistency Matters

The `matrix_data.json` file is automatically generated from the signalset definition files across various vehicle repositories. It's important that this file maintains a consistent structure and formatting for several reasons:

1. **Predictable Git Diffs**: Consistent ordering and formatting ensures that when the data changes, only the actual data changes are reflected in git diffs, not formatting or order changes.
2. **Reliable Builds**: Consistent data structure means the application can reliably parse and use the data without unexpected errors.
3. **Testing**: With consistent outputs, it's easier to test and validate changes to the data extraction process.

## Tools for Ensuring Consistency

### 1. JSON Schema Validation

We use a JSON schema (`scripts/matrix_data_schema.json`) to validate the structure of the generated data. This ensures that:

- All required fields are present
- Field types are correct
- No unexpected fields are added

### 2. Data Normalization

The `scripts/validate_json.py` script normalizes the JSON data to ensure consistent output:

- Objects and arrays are sorted in a deterministic way
- Consistent indentation and formatting
- Metadata comments are added to indicate when the file was generated

### 3. Hash Verification

A SHA-256 hash is calculated for the data to quickly verify if there are any actual changes in content between two versions of the file. This helps to:

- Skip unnecessary updates when content hasn't changed
- Verify consistent structure in CI/CD pipelines

## Continuous Integration Checks

A GitHub workflow (`verify-json.yml`) automatically checks for data consistency on pull requests that modify the data-related files. This ensures that any changes to the data extraction or validation processes still produce consistently formatted output.

## How to Use the Tools

### Validating JSON Data

```bash
python scripts/validate_json.py --input path/to/input.json --output path/to/output.json
```

### Including Schema Validation

```bash
python scripts/validate_json.py --input path/to/input.json --output path/to/output.json --schema path/to/schema.json
```

### Extracting Data with Validation

The data extraction script (`extract_data.py`) automatically integrates with the validation process:

```bash
python scripts/extract_data.py --fetch --workspace workspace --output public/data
```

The script includes several useful features:

- `--fetch`: Clones/updates repositories before extraction
- `--force`: Forces update even if content hasn't changed
- Automatic validation and normalization of the output JSON
- Hash-based change detection to avoid unnecessary updates

## Troubleshooting Inconsistencies

If the GitHub workflow fails due to inconsistent JSON formatting:

1. Run the validation script locally on the problematic file:
   ```bash
   python scripts/validate_json.py --input public/data/matrix_data.json --output public/data/matrix_data.json
   ```

2. Commit and push the normalized version:
   ```bash
   git add public/data/matrix_data.json
   git commit -m "Normalize matrix data format"
   git push
   ```

## Implementation Details

### Sorting Logic

To ensure consistent output regardless of input order:

1. Objects are sorted by keys alphabetically
2. Arrays of objects are sorted by their serialized string representation
3. Other arrays are sorted by values when possible

### Metadata

Each generated file includes metadata as comments at the top:
- Generation timestamp
- Warning that the file is automatically generated

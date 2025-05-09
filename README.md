# OBDb Explorer

A React application for exploring and visualizing OBD parameter data from the OBDb GitHub organization repositories.

## Overview

OBDb Explorer is a web application that provides an improved interface for exploring the OBD parameter definitions across different vehicle repositories. Unlike the original 2D matrix visualization, this application offers a more user-friendly and efficient way to:

- Browse vehicles by make and model
- Search and filter OBD parameters
- Explore commands and their vehicle support
- View parameter details organized by vehicle, ECU, or suggested metric

## Features

- **Vehicle Browser**: Browse all available vehicles by make and model
- **Parameters Database**: Search and filter parameters by name, ID, or suggested metric
- **Commands Explorer**: View all OBD commands and which vehicles support each command
- **Vehicle Detail View**: Explore all parameters available for a specific vehicle, organized by ECU or metric
- **Responsive Design**: Works well on desktop and mobile devices
- **Fast and Efficient**: Quick filtering and searching capabilities without performance issues
- **Data Consistency**: Ensures consistent data formatting and validation ([Learn more](docs/DATA_CONSISTENCY.md))

## Project Structure

```
obdb-explorer/
├── public/
│   ├── index.html
│   └── data/
│       └── matrix_data.json    # Generated data file
├── src/
│   ├── components/             # Reusable UI components
│   │   ├── Navbar.js
│   │   └── Footer.js
│   ├── pages/                  # Page components
│   │   ├── Home.js
│   │   ├── Vehicles.js
│   │   ├── Parameters.js
│   │   ├── Commands.js
│   │   └── VehicleDetail.js
│   ├── services/               # Data services
│   │   └── dataService.js
│   ├── App.js                  # Main application component
│   └── index.js                # Entry point
└── scripts/
    ├── extract_data.py         # Data extraction script
    ├── validate_json.py        # JSON validation script
    └── matrix_data_schema.json # Schema for data validation
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Python 3.6+ (for data extraction)
- GitHub CLI (`gh`) installed and authenticated for repository access

### Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/yourusername/obdb-explorer.git
   cd obdb-explorer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Extract data from OBDb repositories:
   ```bash
   # Create the data directory
   mkdir -p public/data

   # Run the extraction script (fetch repositories first)
   python scripts/extract_data.py --fetch --workspace workspace --output public/data
   ```

   Or, if you already have the repositories cloned:
   ```bash
   python scripts/extract_data.py --workspace workspace --output public/data
   ```

4. Start the development server:
   ```bash
   npm start
   ```

The application will be available at http://localhost:3000.

### Building for Production

To build the application for production:

```bash
npm run build
```

The build files will be available in the `build/` directory and can be deployed to any static hosting service.

## Data Extraction and Validation

### Script Options

```
usage: extract_data.py [-h] [--org ORG] [--workspace WORKSPACE] [--output OUTPUT] [--fetch] [--force]

Extract OBD parameter data for the OBDb Explorer

optional arguments:
  -h, --help            show this help message and exit
  --org ORG             GitHub organization name (default: OBDb)
  --workspace WORKSPACE Workspace directory for cloning repos (default: workspace)
  --output OUTPUT       Output directory for JSON data (default: public/data)
  --fetch               Fetch/update repositories before extraction
  --force               Force update even if no changes detected
```

### JSON Validation

To validate and normalize existing JSON data:

```
usage: validate_json.py [-h] --input INPUT --output OUTPUT [--schema SCHEMA]

Validate and normalize JSON data for consistent output

optional arguments:
  -h, --help       show this help message and exit
  --input INPUT    Input JSON file path
  --output OUTPUT  Output normalized JSON file path
  --schema SCHEMA  JSON schema file path for validation
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
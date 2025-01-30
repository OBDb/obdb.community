# html_generator.py

import json
from pathlib import Path

def generate_html(matrix_data, output_dir):
    """Generate interactive HTML visualization of OBD parameter matrix.
    
    Args:
        matrix_data (list): List of dictionaries containing parameter data
        output_dir (str/Path): Directory to output the generated files
    """
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Convert matrix data to JSON for JavaScript
    with open(output_dir / 'matrix_data.js', 'w') as f:
        f.write('const matrixData = ')
        json.dump(matrix_data, f, indent=2)
        f.write(';')

    # Create index.html
    html_content = '''
<!DOCTYPE html>
<html>
<head>
    <title>OBD Parameter Matrix</title>
    <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@5.5.0/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/tabulator-tables@5.5.0/dist/js/tabulator.min.js"></script>
    <script src="matrix_data.js"></script>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 20px; 
            max-width: 1400px;
            margin: 0 auto;
            padding: 20px;
        }
        #filters { 
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
            flex-wrap: wrap;
        }
        #filters input {
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        #filters button {
            padding: 8px 16px;
            background-color: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 4px;
            cursor: pointer;
        }
        #filters button:hover {
            background-color: #e0e0e0;
        }
        .tabulator { 
            margin-top: 20px; 
        }
        .parameter-cell { 
            cursor: help; 
        }
        .tabulator-row.tabulator-group {
            background-color: #f8f9fa;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>OBD Parameter Matrix</h1>
    
    <div id="filters">
        <input type="text" id="makeFilter" placeholder="Filter by make...">
        <input type="text" id="modelFilter" placeholder="Filter by model...">
        <input type="text" id="unitFilter" placeholder="Filter by unit...">
        <input type="text" id="metricFilter" placeholder="Filter by suggested metric...">
        <input type="text" id="pathFilter" placeholder="Filter by path...">
        <button onclick="resetFilters()">Reset Filters</button>
    </div>
    
    <div id="matrix"></div>

    <script>
        const table = new Tabulator("#matrix", {
            data: matrixData,
            layout: "fitDataTable",
            groupBy: ["make", "model"],
            columns: [
                {title: "Make", field: "make", visible: false},
                {title: "Model", field: "model", visible: false},
                {title: "Header", field: "hdr", headerFilter: true},
                {title: "PID", field: "pid", headerFilter: true},
                {title: "Parameter ID", field: "id", headerFilter: true},
                {title: "Name", field: "name", headerFilter: true},
                {title: "Unit", field: "unit", headerFilter: true},
                {title: "Suggested Metric", field: "suggestedMetric", headerFilter: true},
                {title: "Path", field: "path", headerFilter: true}
            ],
            tooltips: true,
            tooltipsHeader: true,
            rowTooltip: function(row) {
                return "Scaling: " + row.getData().scaling;
            },
            initialSort: [
                {column: "hdr", dir: "asc"},
                {column: "pid", dir: "asc"}
            ]
        });

        // Filter functions
        const filters = ["make", "model", "unit", "metric", "path"];
        filters.forEach(filter => {
            document.getElementById(filter + "Filter").addEventListener("input", function(e) {
                table.setFilter(filter === "metric" ? "suggestedMetric" : filter, "like", e.target.value);
            });
        });

        function resetFilters() {
            filters.forEach(filter => {
                document.getElementById(filter + "Filter").value = "";
            });
            table.clearFilter();
        }
    </script>
</body>
</html>
    '''
    
    with open(output_dir / 'index.html', 'w') as f:
        f.write(html_content)

# html_generator.py

import json
from pathlib import Path
from collections import defaultdict

def transform_matrix_data(matrix_data):
    """Transform data into a format suitable for horizontal ECU+PID layout."""
    # First, collect all unique ECU+Parameter combinations
    ecu_param_combos = set()
    vehicles = set()
    for entry in matrix_data:
        # Create full parameter ID from cmd dictionary
        param_id = ''.join(f"{k}{v}" for k, v in entry['cmd'].items())
        ecu_param_combos.add((entry['hdr'], param_id))
        vehicles.add((entry['make'], entry['model']))
    
    # Sort ECU+Parameter combinations
    ecu_param_combos = sorted(ecu_param_combos)
    vehicles = sorted(vehicles)
    
    # Create lookup for easy access
    data_lookup = defaultdict(dict)
    for entry in matrix_data:
        vehicle_key = (entry['make'], entry['model'])
        param_id = ''.join(f"{k}{v}" for k, v in entry['cmd'].items())
        ecu_param_key = (entry['hdr'], param_id)
        if ecu_param_key not in data_lookup[vehicle_key]:
            data_lookup[vehicle_key][ecu_param_key] = []
        data_lookup[vehicle_key][ecu_param_key].append({
            'id': entry['id'],
            'name': entry['name'],
            'unit': entry['unit'],
            'suggestedMetric': entry['suggestedMetric'],
            'scaling': entry['scaling'],
            'path': entry['path']
        })
    
            # Transform into row-based format
    transformed_data = []
    for make, model in vehicles:
        row = {
            'make': make,
            'model': model
        }
        for hdr, param_id in ecu_param_combos:
            key = f"{hdr}_{param_id}"
            signals = data_lookup[(make, model)].get((hdr, param_id), [])
            row[key] = signals
        transformed_data.append(row)
    
    return transformed_data, ecu_param_combos

def generate_html(matrix_data, output_dir):
    """Generate interactive HTML visualization of OBD parameter matrix."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Transform data for horizontal layout
    transformed_data, ecu_pid_combos = transform_matrix_data(matrix_data)
    
    # Convert matrix data to JSON for JavaScript
    with open(output_dir / 'matrix_data.js', 'w') as f:
        f.write('const matrixData = ')
        json.dump(transformed_data, f, indent=2)
        f.write(';\n')
        f.write('const ecuPidCombos = ')
        json.dump(list(ecu_pid_combos), f, indent=2)
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
        .tabulator .tabulator-header {
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .tabulator {
            max-width: 100%;
            overflow-x: auto;
        }
        .tabulator-tableholder {
            overflow-x: auto;
            min-width: 100%;
        }
        .tabulator-col.column-hidden,
        .tabulator-cell.column-hidden {
            width: 0 !important;
            min-width: 0 !important;
            max-width: 0 !important;
            padding: 0 !important;
            border: none !important;
            pointer-events: none;
            opacity: 0;
            transition: all 0.3s ease;
        }
        .tabulator-col:not(.column-hidden),
        .tabulator-cell:not(.column-hidden) {
            transition: all 0.3s ease;
        }
        .tabulator-col-group {
            background-color: #e9ecef;
            font-weight: bold;
        }
        .tabulator-col-resize-handle {
            width: 8px;
            margin-left: -4px;
        }
        .tabulator-col.column-hidden,
        .tabulator-cell.column-hidden {
            width: 0 !important;
            min-width: 0 !important;
            max-width: 0 !important;
            padding: 0 !important;
            border: none !important;
            pointer-events: none;
            opacity: 0;
            transition: all 0.3s ease;
        }
        .tabulator-col:not(.column-hidden),
        .tabulator-cell:not(.column-hidden) {
            transition: all 0.3s ease;
        }
        .tabulator-row.tabulator-group {
            background-color: #f8f9fa !important;
            border-bottom: 2px solid #ddd;
            cursor: pointer;
        }
        .tabulator-row.tabulator-group:hover {
            background-color: #f0f0f0 !important;
        }
        .signal-cell {
            white-space: pre-wrap;
            font-size: 0.9em;
        }
        .signal-cell .signal-item {
            padding: 2px 0;
            border-bottom: 1px solid #eee;
        }
        .signal-cell .signal-item:last-child {
            border-bottom: none;
        }
        .tooltip {
            position: absolute;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 4px;
            padding: 8px;
            font-size: 0.9em;
            z-index: 1000;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            max-width: 300px;
        }
    </style>
</head>
<body>
    <h1>OBD Parameter Matrix</h1>
    
                <div id="filters">
        <input type="text" id="makeFilter" placeholder="Filter by make...">
        <input type="text" id="modelFilter" placeholder="Filter by model...">
        <input type="text" id="parameterFilter" placeholder="Filter by parameter ID...">
        <input type="text" id="metricFilter" placeholder="Filter by suggested metric...">
        <button onclick="resetFilters()">Reset Filters</button>
    </div>
    
    <div id="matrix"></div>

    <script>
        // Function to format signal cell content
        function formatSignalCell(cell) {
            const signals = cell.getValue() || [];
            const row = cell.getRow().getData();
            if (signals.length === 0) return "";
            
            return signals.map(signal => {
                const metric = signal.suggestedMetric ? 
                    `[${signal.suggestedMetric}]` : 
                    signal.unit ? `[${signal.unit}]` : '';
                const githubLink = `https://github.com/OBDb/${row.make}-${row.model}/blob/main/signalsets/v3/default.json`;
                return `<div class="signal-item" 
                    data-scaling="${signal.scaling}"
                    data-name="${signal.name}"
                    data-path="${signal.path}"
                    onclick="window.open('${githubLink}', '_blank')"
                    style="cursor: pointer;">
                    ${signal.id} ${metric}
                </div>`;
            }).join('');
        }

        // Create column definitions starting with make/model
        const columns = [
            {
                title: "Vehicle",
                frozen: true,
                columns: [
                    {title: "Make", field: "make", width: 120, resizable: true, minWidth: 50},
                    {title: "Model", field: "model", width: 120, resizable: true, minWidth: 50}
                ]
            }
        ];

        // Group columns by ECU
        const ecuGroups = {};
        ecuPidCombos.forEach(([ecu, paramId]) => {
            if (!ecuGroups[ecu]) {
                ecuGroups[ecu] = [];
            }
            ecuGroups[ecu].push({
                title: paramId,
                field: `${ecu}_${paramId}`,
                formatter: formatSignalCell,
                headerSort: false,
                width: 150,
                resizable: true,
                minWidth: 50,
                maxWidth: 500,
            });
        });

        // Add ECU group columns
        Object.entries(ecuGroups).forEach(([ecu, pidColumns]) => {
            columns.push({
                title: ecu,
                columns: pidColumns,
                resizable: true,
            });
        });

        // Initialize Tabulator
        const table = new Tabulator("#matrix", {
            data: matrixData,
            layout: "fitColumns",
            columns: columns,
            height: "85vh",
            tooltips: false,
            groupBy: "make",
            groupHeader: function(value, count, data, group){
                return `${value} <span style="color: #666; font-size: 0.9em;">(${count} models)</span>`;
            },
            groupToggleElement: "header",
            groupStartOpen: false,
        });

        // Handle ECU column group toggling
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('ecu-toggle')) {
                const ecuName = e.target.dataset.ecu;
                const button = e.target;
                const isExpanded = button.textContent === '[−]';
                
                // Get all columns for this ECU
                const ecuColumns = table.getColumns().filter(col => 
                    col.getField() && col.getField().startsWith(`${ecuName}_`)
                );
                
                // Toggle visibility using CSS
                ecuColumns.forEach(col => {
                    const element = col.getElement();
                    const field = col.getField();
                    const cells = table.getRows().map(row => row.getCell(field));
                    
                    if (isExpanded) {
                        element.classList.add('column-hidden');
                        cells.forEach(cell => {
                            if (cell && cell.getElement()) {
                                cell.getElement().classList.add('column-hidden');
                            }
                        });
                    } else {
                        element.classList.remove('column-hidden');
                        cells.forEach(cell => {
                            if (cell && cell.getElement()) {
                                cell.getElement().classList.remove('column-hidden');
                            }
                        });
                    }
                });
                
                // Update button text
                button.textContent = isExpanded ? '[+]' : '[-]';
            }
        });

        // Custom tooltip handler
        let tooltip = null;
        document.getElementById("matrix").addEventListener("mouseover", function(e) {
            const signalItem = e.target.closest(".signal-item");
            if (signalItem) {
                if (!tooltip) {
                    tooltip = document.createElement("div");
                    tooltip.className = "tooltip";
                    document.body.appendChild(tooltip);
                }
                
                tooltip.innerHTML = `
                    <strong>${signalItem.dataset.name}</strong><br>
                    Path: ${signalItem.dataset.path}<br>
                    Scaling: ${signalItem.dataset.scaling}
                `;
                
                const rect = signalItem.getBoundingClientRect();
                tooltip.style.left = rect.right + 10 + "px";
                tooltip.style.top = rect.top + "px";
                tooltip.style.display = "block";
            }
        });

        document.getElementById("matrix").addEventListener("mouseout", function(e) {
            const signalItem = e.target.closest(".signal-item");
            if (signalItem && tooltip) {
                tooltip.style.display = "none";
            }
        });

        // Filter functions
        const filters = ["make", "model", "parameter", "metric"];
        
        function updateColumnVisibility() {
            // Get current filter values
            const filterValues = {
                metric: document.getElementById('metricFilter').value.toLowerCase(),
                parameter: document.getElementById('parameterFilter').value.toLowerCase()
            };

            // Get all visible rows
            const visibleRows = table.getRows("active");
            
            // Get all signal columns (excluding make/model)
            const signalColumns = table.getColumns().filter(col => {
                const field = col.getField();
                return field && field.includes('_');
            });
            
            // Helper function to check if a signal matches current filters
            function signalMatchesFilters(signal) {
                if (filterValues.metric) {
                    if (!signal.suggestedMetric || 
                        !signal.suggestedMetric.toLowerCase().includes(filterValues.metric)) {
                        return false;
                    }
                }
                if (filterValues.parameter) {
                    if (!signal.id.toLowerCase().includes(filterValues.parameter)) {
                        return false;
                    }
                }
                return true;
            }

            // Check each column
            signalColumns.forEach(col => {
                const field = col.getField();
                
                // Check if any visible row has matching content in this column
                const hasContent = visibleRows.some(row => {
                    const signals = row.getData()[field];
                    return signals && signals.some(signalMatchesFilters);
                });
                
                // Get all elements related to this column (header and cells)
                const colElement = col.getElement();
                const cells = visibleRows.map(row => row.getCell(field));
                
                if (hasContent) {
                    colElement.classList.remove('column-hidden');
                    cells.forEach(cell => {
                        if (cell && cell.getElement()) {
                            cell.getElement().classList.remove('column-hidden');
                        }
                    });
                } else {
                    colElement.classList.add('column-hidden');
                    cells.forEach(cell => {
                        if (cell && cell.getElement()) {
                            cell.getElement().classList.add('column-hidden');
                        }
                    });
                }
                
                // Update parent group visibility
                const parentGroup = colElement.closest('.tabulator-col-group');
                if (parentGroup) {
                    const siblingCols = parentGroup.querySelectorAll('.tabulator-col');
                    const allHidden = Array.from(siblingCols).every(col => 
                        col.classList.contains('column-hidden')
                    );
                    
                    if (allHidden) {
                        parentGroup.classList.add('column-hidden');
                    } else {
                        parentGroup.classList.remove('column-hidden');
                    }
                }
            });
        }

        filters.forEach(filter => {
            document.getElementById(filter + "Filter").addEventListener("input", function(e) {
                let value = e.target.value.toLowerCase();
                
                switch(filter) {
                    case "metric":
                    case "parameter":
                        table.setFilter(function(row) {
                            // Search through all columns that contain signals
                            return Object.entries(row).some(([key, signals]) => {
                                // Skip non-signal columns like make/model
                                if (!Array.isArray(signals)) return false;
                                
                                return signals.some(signal => {
                                    if (filter === "metric") {
                                        return signal.suggestedMetric && 
                                               signal.suggestedMetric.toLowerCase().includes(value);
                                    } else { // parameter
                                        return signal.id.toLowerCase().includes(value);
                                    }
                                });
                            });
                        });
                        
                        // Update column visibility after a small delay to ensure filter is applied
                        setTimeout(updateColumnVisibility, 100);
                        break;
                    default:
                        table.setFilter(filter, "like", value);
                        setTimeout(updateColumnVisibility, 100);
                }
            });
        });

        function resetFilters() {
            filters.forEach(filter => {
                document.getElementById(filter + "Filter").value = "";
            });
            table.clearFilter();
            
            // Remove all column-hidden classes
            document.querySelectorAll('.column-hidden').forEach(el => {
                el.classList.remove('column-hidden');
            });
        }

        // Subscribe to tableBuilt event to ensure everything is initialized
        table.on("tableBuilt", function(){
            updateColumnVisibility();
        });


        function resetFilters() {
            document.getElementById("makeFilter").value = "";
            document.getElementById("modelFilter").value = "";
            table.clearFilter();
        }
    </script>
</body>
</html>
    '''
    
    with open(output_dir / 'index.html', 'w') as f:
        f.write(html_content)

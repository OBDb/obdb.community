# template_generator.py

def get_html_template():
    """Return the HTML template for the matrix visualization."""
    return '''<!DOCTYPE html>
<html>
<head>
    <title>OBD Parameter Matrix</title>
    <link href="https://cdn.jsdelivr.net/npm/tabulator-tables@5.5.0/dist/css/tabulator.min.css" rel="stylesheet">
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/tabulator-tables@5.5.0/dist/js/tabulator.min.js"></script>
    <script src="matrix_data.js"></script>
    <style>
        /* Styles will be injected here */
        __STYLE_PLACEHOLDER__
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
        __JAVASCRIPT_PLACEHOLDER__
    </script>
</body>
</html>'''

def get_javascript_template():
    """Return the JavaScript code template for matrix functionality."""
    return '''
        // Function to format signal cell content
        function formatSignalCell(cell) {
            const signals = cell.getValue() || [];
            const row = cell.getRow().getData();
            if (signals.length === 0) return "";
            
            return signals.map(signal => {
                const githubLink = `https://github.com/OBDb/${row.make}-${row.model}/blob/main/signalsets/v3/default.json`;
                return `<div class="signal-item" 
                    data-scaling="${signal.scaling}"
                    data-name="${signal.name}"
                    data-path="${signal.path}"
                    onclick="window.open('${githubLink}', '_blank')"
                    style="cursor: pointer;">
                    ${signal.id}
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

            // Force row height recalculation after all columns are processed
            visibleRows.forEach(row => {
                table.rowManager.resetRowHeights([row]);
            });
            
            // Ensure table layout is updated
            table.redraw(true);
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

        // Reset all filters
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
'''

def get_complete_template(styles, javascript):
    """Combine the HTML template with styles and JavaScript."""
    template = get_html_template()
    template = template.replace('__STYLE_PLACEHOLDER__', styles)
    template = template.replace('__JAVASCRIPT_PLACEHOLDER__', javascript)
    return template
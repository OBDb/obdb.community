# style_generator.py

def get_css_styles():
    """Return the CSS styles for the matrix visualization."""
    return '''
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
        .tabulator-row {
            transition: all 0.3s ease;
        }
        .tabulator-cell {
            height: auto !important;
            transition: all 0.3s ease;
        }
        .tabulator-cell.column-hidden {
            width: 0 !important;
            min-width: 0 !important;
            max-width: 0 !important;
            padding: 0 !important;
            border: none !important;
            pointer-events: none;
            opacity: 0;
            height: 0 !important;
            overflow: hidden;
            margin: 0 !important;
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
        .tabulator-row.tabulator-group:hover {
            background-color: #f0f0f0 !important;
        }
        /* Disable row hover highlight */
        .tabulator-row.tabulator-selectable:hover {
            cursor: default !important;
        }
        /* Preserve alternating colors on hover */
        .tabulator-row.tabulator-row-even:hover {
            background-color: #fff !important;
        }
        .tabulator-row.tabulator-row-odd:hover {
            background-color: #f6f6f6 !important;
        }
    '''

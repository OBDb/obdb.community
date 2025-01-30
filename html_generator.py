# html_generator.py

import json
from pathlib import Path
from data_transformer import transform_matrix_data
from template_generator import get_complete_template, get_javascript_template
from style_generator import get_css_styles

def generate_html(matrix_data, output_dir):
    """Generate interactive HTML visualization of OBD parameter matrix."""
    output_dir = Path(output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    
    # Transform data for horizontal layout
    transformed_data, ecu_pid_combos = transform_matrix_data(matrix_data)
    
    # Generate matrix_data.js
    generate_js_data(transformed_data, ecu_pid_combos, output_dir)
    
    # Generate index.html
    generate_html_file(output_dir)

def generate_js_data(transformed_data, ecu_pid_combos, output_dir):
    """Generate the JavaScript data file containing matrix data."""
    with open(output_dir / 'matrix_data.js', 'w') as f:
        f.write('const matrixData = ')
        json.dump(transformed_data, f, indent=2)
        f.write(';\n')
        f.write('const ecuPidCombos = ')
        json.dump(list(ecu_pid_combos), f, indent=2)
        f.write(';')

def generate_html_file(output_dir):
    """Generate the main HTML file with the matrix visualization."""
    styles = get_css_styles()
    javascript = get_javascript_template()
    html_content = get_complete_template(styles, javascript)
    
    with open(output_dir / 'index.html', 'w') as f:
        f.write(html_content)

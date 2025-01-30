# data_transformer.py

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
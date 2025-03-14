#!/usr/bin/env node
/**
 * This script extracts the SAEJ1979 PIDs and their descriptions from the matrix data
 * and saves them to a separate JSON file for easier lookup in the UI.
 */
const fs = require('fs');
const path = require('path');

// Paths
const matrixDataPath = path.join(__dirname, '../public/data/matrix_data.json');
const outputPath = path.join(__dirname, '../public/data/saej1979_commands.json');

// Load matrix data
let matrixData;
try {
  const fileContents = fs.readFileSync(matrixDataPath, 'utf8');
  matrixData = JSON.parse(fileContents);
} catch (err) {
  console.error('Error loading matrix data:', err);
  process.exit(1);
}

// Extract SAEJ1979 PIDs and descriptions
const commands = {};

// Look for parameters with SAEJ1979 make or in the SAEJ1979 repository
matrixData.forEach(param => {
  if (param.make === 'SAEJ1979' || param.path?.includes('SAEJ1979')) {
    // Extract the PID from the command
    const pid = Object.keys(param.cmd)
      .find(key => key === '01' || key === '21');

    if (pid && param.cmd[pid]) {
      const pidValue = param.cmd[pid];

      // Add to commands object if we have a name
      if (param.name) {
        commands[pidValue] = param.name;
      }
    }
  }
});

console.log(`Found ${Object.keys(commands).length} SAEJ1979 commands`);

// Write to output file
fs.writeFileSync(outputPath, JSON.stringify(commands, null, 2));
console.log(`Saved SAEJ1979 commands to ${outputPath}`);

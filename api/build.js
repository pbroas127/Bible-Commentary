const fs = require('fs');
const path = require('path');

const mainPackageJsonPath = path.join(__dirname, 'package.json');
const distDir = path.join(__dirname, 'dist');
const distPackageJsonPath = path.join(distDir, 'package.json');
const hostJsonPath = path.join(__dirname, 'host.json');
const distHostJsonPath = path.join(distDir, 'host.json');

// Read the main package.json
const mainPackageJson = JSON.parse(fs.readFileSync(mainPackageJsonPath, 'utf8'));

// Create a new package.json for production
const prodPackageJson = {
  name: mainPackageJson.name,
  version: mainPackageJson.version,
  description: mainPackageJson.description,
  main: mainPackageJson.main,
  dependencies: mainPackageJson.dependencies || {},
};

// Ensure dist directory exists
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Write the new package.json to the dist directory
fs.writeFileSync(distPackageJsonPath, JSON.stringify(prodPackageJson, null, 2), 'utf8');

// Copy host.json to the dist directory
fs.copyFileSync(hostJsonPath, distHostJsonPath);

console.log('Production package.json and host.json created in dist/');

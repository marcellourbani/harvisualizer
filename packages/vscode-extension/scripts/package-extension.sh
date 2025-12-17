#!/bin/bash

# Exit immediately if a command exits with a non-zero status.
set -e

# Define source and temporary directories
SOURCE_DIR="$(pwd)"
TEMP_DIR=$(mktemp -d -t vsix-XXXXXXXXXX)

echo "Created temporary directory: $TEMP_DIR"

# Ensure cleanup on exit
function cleanup {
  echo "Cleaning up temporary directory: $TEMP_DIR"
  rm -rf "$TEMP_DIR"
}
trap cleanup EXIT

# 1. Run the build in the original directory
echo "Running npm run build in original directory..."
npm run build

# Copy necessary files to the temporary directory
echo "Copying essential files to temporary directory..."
cp "$SOURCE_DIR/package.json" "$TEMP_DIR/"
cp "$SOURCE_DIR/LICENSE" "$TEMP_DIR/"
cp "$SOURCE_DIR/README.md" "$TEMP_DIR/"
cp -R "$SOURCE_DIR/out" "$TEMP_DIR/"

# 2. Modify the copied package.json to remove vscode:prepublish script using Node.js
echo "Modifying package.json in temp directory to remove vscode:prepublish script..."
node -e "
  const fs = require('fs');
  const path = require('path');
  const pkgPath = path.join('$TEMP_DIR', 'package.json');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  delete pkg.scripts['vscode:prepublish'];
  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n');
"

# Change to the temporary directory
cd "$TEMP_DIR"

# Run VSCE package
echo "Running vsce package from temporary directory..."
npx @vscode/vsce package --no-dependencies

# Copy the generated .vsix file back to the original directory
VSIX_FILE=$(ls *.vsix)
echo "Copying $VSIX_FILE back to $SOURCE_DIR"
mv "$VSIX_FILE" "$SOURCE_DIR/"

echo "VSCE packaging complete."

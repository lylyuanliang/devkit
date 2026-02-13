#!/bin/bash

# Build configuration script
# Reads tools.config.json and bundles selected tools

CONFIG_FILE="tools.config.json"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "No tools.config.json found, including all tools"
  INCLUDED_TOOLS=""
else
  INCLUDED_TOOLS=$(jq -r '.included[]' "$CONFIG_FILE" | tr '\n' ',')
fi

echo "Building with tools: $INCLUDED_TOOLS"

# Build frontend
cd packages/core
yarn build
cd ../..

# Build Tauri app
yarn tauri build

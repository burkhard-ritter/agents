#!/bin/bash
# Helper script to get GitHub configuration values
# Usage: ./get-github-config.sh [key]
# Examples:
#   ./get-github-config.sh default_org
#   ./get-github-config.sh default_repo
#   ./get-github-config.sh projects.work.number

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: config.json not found at $CONFIG_FILE" >&2
    exit 1
fi

if [ -z "$1" ]; then
    # If no key provided, show all GitHub config
    jq -r '.github' "$CONFIG_FILE"
else
    # Get specific key
    KEY="$1"
    jq -r --arg key "$KEY" '.github | getpath($key | split("."))' "$CONFIG_FILE"
fi

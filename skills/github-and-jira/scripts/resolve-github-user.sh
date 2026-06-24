#!/bin/bash
# Helper script to resolve friendly names to GitHub usernames
# Usage: ./resolve-github-user.sh "svenja"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: config.json not found at $CONFIG_FILE" >&2
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: $0 <name>" >&2
    echo "Example: $0 svenja" >&2
    exit 1
fi

NAME=$(echo "$1" | tr '[:upper:]' '[:lower:]')

# Try to resolve the name from user_mappings
USERNAME=$(jq -r --arg name "$NAME" '.github.user_mappings[$name] // empty' "$CONFIG_FILE")

if [ -n "$USERNAME" ]; then
    echo "$USERNAME"
else
    # If not found in mappings, return the input (might already be a GitHub username)
    echo "$1"
fi

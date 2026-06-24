#!/bin/bash
# Helper script to resolve friendly names to Jira user emails
# Usage: ./resolve-jira-user.sh "thomas"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CONFIG_FILE="$SCRIPT_DIR/../config.json"

if [ ! -f "$CONFIG_FILE" ]; then
    echo "Error: config.json not found at $CONFIG_FILE" >&2
    exit 1
fi

if [ -z "$1" ]; then
    echo "Usage: $0 <name>" >&2
    echo "Example: $0 thomas" >&2
    exit 1
fi

NAME=$(echo "$1" | tr '[:upper:]' '[:lower:]')

# Try to resolve the name from user_mappings
EMAIL=$(jq -r --arg name "$NAME" '.jira.user_mappings[$name] // empty' "$CONFIG_FILE")

if [ -n "$EMAIL" ]; then
    echo "$EMAIL"
else
    # If not found in mappings, return the input (might already be an email)
    echo "$1"
fi

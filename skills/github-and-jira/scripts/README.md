# Helper Scripts

This directory contains helper scripts for working with the Jira/GitHub skill configuration.

## Available Scripts

### `resolve-github-user.sh`

Resolves a friendly name to a GitHub username using the config file.

```bash
./resolve-github-user.sh svenja
# Output: Svenja86

./resolve-github-user.sh hakan
# Output: hknozturk
```

**Usage in commands:**
```bash
USERNAME=$(./resolve-github-user.sh svenja)
gh issue create --assignee $USERNAME
```

### `resolve-jira-user.sh`

Resolves a friendly name to a Jira user email using the config file.

```bash
./resolve-jira-user.sh thomas
# Output: thomas.scherer@sportident.com

./resolve-jira-user.sh hakan
# Output: hakan@sportident.com
```

**Usage in commands:**
```bash
EMAIL=$(./resolve-jira-user.sh thomas)
acli jira workitem create --assignee $EMAIL
```

### `get-github-config.sh`

Retrieves GitHub configuration values from the config file.

```bash
# Get default organization
./get-github-config.sh default_org
# Output: sportidentgmbh

# Get default repo
./get-github-config.sh default_repo
# Output: sportidentgmbh/work

# Get all GitHub config
./get-github-config.sh
# Output: {full GitHub config JSON}
```

**Usage in commands:**
```bash
REPO=$(./get-github-config.sh default_repo)
gh issue list --repo $REPO

ORG=$(./get-github-config.sh default_org)
gh project list --owner $ORG
```

## Configuration File

These scripts read from `../config.json` (relative to the scripts directory).

The config file structure:
```json
{
  "github": {
    "default_org": "sportidentgmbh",
    "default_repo": "sportidentgmbh/work",
    "user_mappings": {
      "svenja": "Svenja86",
      "hakan": "hknozturk"
    },
    "projects": {
      "work": {
        "number": 6,
        "owner": "sportidentgmbh",
        "id": "PVT_kwDOBFZTm84BD6ca"
      }
    }
  },
  "jira": {
    "default_project": "NEP",
    "user_mappings": {
      "thomas": "thomas.scherer@sportident.com"
    }
  }
}
```

## Adding New Mappings

Edit `../config.json` to add new user mappings or update organization members:

```json
{
  "github": {
    "user_mappings": {
      "yourname": "your-github-username"
    }
  },
  "jira": {
    "user_mappings": {
      "yourname": "your.email@company.com"
    }
  }
}
```

## Requirements

- `jq` - JSON processor (for parsing config file)
- Bash shell

## Examples

### Create GitHub issue with friendly name assignment

```bash
#!/bin/bash
SCRIPT_DIR="$(dirname "$0")"
USERNAME=$($SCRIPT_DIR/resolve-github-user.sh svenja)
REPO=$($SCRIPT_DIR/get-github-config.sh default_repo)

gh issue create \
  --repo $REPO \
  --title "New task" \
  --body "Task description" \
  --assignee $USERNAME
```

### Create Jira ticket with friendly name assignment

```bash
#!/bin/bash
SCRIPT_DIR="$(dirname "$0")"
EMAIL=$($SCRIPT_DIR/resolve-jira-user.sh thomas)
PROJECT=$($SCRIPT_DIR/../config.json | jq -r '.jira.default_project')

acli jira workitem create \
  --project $PROJECT \
  --title "New task" \
  --assignee $EMAIL
```

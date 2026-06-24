---
name: github-and-jira
description: Work with Jira and GitHub issues/tickets using Atlassian CLI (acli) and GitHub CLI (gh). Query recently created/updated tickets, create new issues in projects, add items to boards, manage work items, and edit project fields. Use when working with Jira or GitHub issues, sprints, boards, or project management tasks.
allowed-tools: Bash, Read, Write, Glob, Grep
---

# Jira & GitHub Issue Management Skill

This skill provides comprehensive ticket and issue management for both Jira and GitHub using the Atlassian CLI (`acli`) and GitHub CLI (`gh`). It supports creating, querying, and managing work items across both platforms from the command line.

## Configuration

This skill includes a `config.json` file for commonly used organizations, projects, and user mappings. This allows you to use friendly names instead of full usernames or project IDs.

### Config File Location

`.claude/skills/jira/config.json`

### Customizing the Config

Edit the `config.json` file to add your own:
- **GitHub**: Default org, repos, projects, and user name mappings
- **Jira**: Default project and user email mappings

Example mappings:
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

### Helper Scripts

The skill includes helper scripts in `scripts/` directory:

```bash
# Resolve GitHub username from friendly name
./scripts/resolve-github-user.sh svenja
# Returns: Svenja86

# Resolve Jira email from friendly name
./scripts/resolve-jira-user.sh thomas
# Returns: thomas.scherer@sportident.com

# Get GitHub config values
./scripts/get-github-config.sh default_org
# Returns: sportidentgmbh
```

## Prerequisites

This skill requires the Atlassian CLI (`acli`) to be installed and configured:

```bash
# Check if acli is installed
acli --version

# Authenticate with Jira
acli jira auth login
```

For installation instructions, visit: https://developer.atlassian.com/cloud/cli/

## Quick Start Examples

### 0. Find your project key

```bash
# List recent projects to find the project key
acli jira project list --recent

# Note: Use the "Key" column (e.g., "NEP"), not the full project name
# Example: For "Neptune" project, use "NEP" in JQL queries
```

### 1. Query recently created tickets

```bash
# Get tickets created in the last 7 days
acli jira workitem search --jql "created >= -7d ORDER BY created DESC" --paginate

# Get tickets updated today
acli jira workitem search --jql "updated >= startOfDay() ORDER BY updated DESC" --limit 20

# Get recently created tickets in a specific project
acli jira workitem search --jql "project = TEAM AND created >= -7d ORDER BY created DESC" --paginate
```

### 2. Query recently updated tickets

```bash
# Get tickets updated in the last 24 hours
acli jira workitem search --jql "updated >= -1d ORDER BY updated DESC" --paginate

# Get tickets with recent comments
acli jira workitem search --jql "project = TEAM AND updated >= -3d ORDER BY updated DESC"

# View specific fields for recently updated tickets
acli jira workitem search --jql "updated >= -7d ORDER BY updated DESC" --fields "key,summary,status,updated,assignee"
```

### 3. Create a new ticket

```bash
# Create a simple task
acli jira workitem create --summary "Fix login bug" --project "TEAM" --type "Task"

# Create a bug with description and assignee
acli jira workitem create \
  --summary "Login fails on mobile" \
  --project "TEAM" \
  --type "Bug" \
  --description "Users cannot log in on iOS devices" \
  --assignee "user@example.com"

# Create a ticket with labels
acli jira workitem create \
  --summary "Add dark mode" \
  --project "TEAM" \
  --type "Story" \
  --label "feature,ui"

# Self-assign a ticket
acli jira workitem create \
  --summary "Update documentation" \
  --project "TEAM" \
  --type "Task" \
  --assignee "@me"
```

### 4. Create a ticket from file

```bash
# Create description file
cat > ticket_description.txt << 'EOF'
## Problem
Users are experiencing slow load times on the dashboard

## Expected Behavior
Dashboard should load in under 2 seconds

## Actual Behavior
Dashboard takes 10+ seconds to load

## Steps to Reproduce
1. Navigate to dashboard
2. Wait for page load
3. Observe loading time
EOF

# Create ticket with description from file
acli jira workitem create \
  --summary "Dashboard performance issue" \
  --project "TEAM" \
  --type "Bug" \
  --description-file ticket_description.txt \
  --assignee "@me"
```

### 5. View ticket details

```bash
# View a specific ticket
acli jira workitem view TEAM-123

# View multiple tickets
acli jira workitem view TEAM-123 TEAM-124 TEAM-125

# View with JSON output
acli jira workitem view TEAM-123 --json

# Open ticket in web browser (useful for editing fields not available in CLI)
acli jira workitem view TEAM-123 --web
```

## Common JQL Queries

### Recently Created/Updated Tickets

```bash
# Tickets created today
acli jira workitem search --jql "created >= startOfDay()"

# Tickets updated this week
acli jira workitem search --jql "updated >= startOfWeek()"

# My recently created tickets
acli jira workitem search --jql "creator = currentUser() AND created >= -7d ORDER BY created DESC"

# Tickets I'm assigned to, updated recently
acli jira workitem search --jql "assignee = currentUser() AND updated >= -3d ORDER BY updated DESC"

# High priority tickets created recently
acli jira workitem search --jql "priority = High AND created >= -7d ORDER BY created DESC"
```

### Tracking Changes

```bash
# Tickets that changed status recently
acli jira workitem search --jql "status changed DURING (-7d, now()) ORDER BY updated DESC"

# Tickets moved to 'In Progress' recently
acli jira workitem search --jql "status changed TO 'In Progress' DURING (-7d, now())"

# Tickets with new comments
acli jira workitem search --jql "comment ~ '*' AND updated >= -1d ORDER BY updated DESC"
```

### Project-Specific Queries

```bash
# All open tickets in a project
acli jira workitem search --jql "project = TEAM AND status != Done"

# Bugs in a specific project
acli jira workitem search --jql "project = TEAM AND type = Bug AND status != Closed"

# Stories ready for sprint
acli jira workitem search --jql "project = TEAM AND type = Story AND status = 'Ready for Dev'"
```

## Board Operations

### List boards

```bash
# Search for boards
acli jira board search

# Get board details
acli jira board get --id 123
```

### Working with Sprints

```bash
# List sprints for a board
acli jira board list-sprints --board-id 123

# Create a new sprint
acli jira sprint create --board-id 123 --name "Sprint 24" --start-date "2026-01-27" --end-date "2026-02-10"

# Add tickets to sprint (via ticket edit)
acli jira workitem edit TEAM-123 --sprint "Sprint 24"
```

## Advanced Ticket Management

### Edit tickets

```bash
# Change ticket status
acli jira workitem transition TEAM-123 --to "In Progress"

# Update summary
acli jira workitem edit TEAM-123 --summary "New summary"

# Reassign ticket
acli jira workitem assign TEAM-123 --assignee "user@example.com"

# Add labels
acli jira workitem edit TEAM-123 --label "urgent,customer-facing"
```

### Bulk operations

```bash
# Create multiple tickets from JSON
acli jira workitem create-bulk --from-json tickets.json

# Search and export to CSV
acli jira workitem search --jql "project = TEAM" --csv > tickets.csv
```

### Comments

```bash
# Add comment to ticket
acli jira workitem comment add TEAM-123 --body "Working on this now"

# List comments
acli jira workitem comment list TEAM-123
```

## Output Formats

```bash
# JSON output (for parsing)
acli jira workitem search --jql "project = TEAM" --json

# CSV output (for spreadsheets)
acli jira workitem search --jql "project = TEAM" --csv

# Custom fields
acli jira workitem search --jql "project = TEAM" --fields "key,summary,assignee,status"

# Open in browser
acli jira workitem view TEAM-123 --web
```

## Best Practices

### 1. Query recently changed tickets efficiently

Use relative date functions for dynamic queries:
- `created >= -7d` - Created in last 7 days
- `updated >= startOfDay()` - Updated today
- `updated >= startOfWeek()` - Updated this week

### 2. Always use project KEY, not project name

```bash
# WRONG - Using full project name
acli jira workitem search --jql "project = Neptune"

# CORRECT - Using project key
acli jira workitem search --jql "project = NEP"

# Find project keys with:
acli jira project list --recent
```

### 3. Create tickets with good structure

Always include:
- Clear, concise summary
- Detailed description (use --description-file for longer descriptions)
- Appropriate ticket type (Bug, Story, Task, Epic)
- Assignee (use @me for self-assignment)
- Relevant labels for categorization

### 4. Add tickets to boards/sprints

1. Create the ticket first
2. Use `acli jira workitem edit` to add to sprint
3. Or move via status transition to automatically add to board

### 5. Track what changed

Use JQL's `changed` operator:
- `status changed DURING (-7d, now())`
- `assignee changed AFTER -3d`
- `priority changed TO High`

### 6. Use --web flag to open tickets in browser

When you need to:
- Add components to tickets
- Set custom fields
- Use rich text formatting
- Perform operations not available in CLI

Simply use: `acli jira workitem view TICKET-KEY --web`

## CLI Limitations and Workarounds

### Fields that require web interface

Some Jira fields cannot be set or edited via the `acli` CLI and require using the web interface:

- **Components** - Cannot be set during creation or edit
- **Custom fields** - Most custom fields are not accessible via CLI flags
- **Advanced formatting** - Rich text formatting in descriptions

**Workaround:** Create the ticket via CLI, then open in browser to complete:

```bash
# Create ticket and capture the key
TICKET_KEY=$(acli jira workitem create \
  --summary "My ticket" \
  --project "NEP" \
  --type "Task" \
  --json | grep -o '"key":"[^"]*"' | cut -d'"' -f4)

# Open in browser to add components and other fields
acli jira workitem view $TICKET_KEY --web
```

## Common Workflows

### Complete ticket creation workflow

```bash
# 1. Find your project key
acli jira project list --recent

# 2. Create a description file for complex tickets
cat > /tmp/ticket_desc.txt << 'EOF'
**Problem:**
Detailed problem description

**Solution:**
Proposed solution

**Requirements:**
- Requirement 1
- Requirement 2
EOF

# 3. Create the ticket
acli jira workitem create \
  --summary "Ticket title" \
  --project "NEP" \
  --type "Task" \
  --description-file /tmp/ticket_desc.txt \
  --assignee "user@example.com" \
  --label "label1,label2"

# 4. If you need to add components or other fields, open in browser
acli jira workitem view NEP-XXX --web
```

### Daily standup preparation

```bash
# What did I work on yesterday?
acli jira workitem search --jql "assignee = currentUser() AND updated >= -1d" --fields "key,summary,status"

# What am I working on today?
acli jira workitem search --jql "assignee = currentUser() AND status = 'In Progress'" --fields "key,summary"
```

### Sprint planning

```bash
# View backlog tickets
acli jira workitem search --jql "project = TEAM AND status = 'To Do' AND sprint is EMPTY" --fields "key,summary,priority,storypoints"

# Create sprint tickets
acli jira workitem create --summary "Sprint planning" --project "TEAM" --type "Task"
```

### Bug tracking

```bash
# Recent bugs
acli jira workitem search --jql "type = Bug AND created >= -7d ORDER BY priority DESC"

# Critical bugs
acli jira workitem search --jql "type = Bug AND priority = Highest AND status != Closed"
```

## When Claude Should Use This Skill

### Jira-related requests
- User asks to create, view, or search Jira tickets/issues
- User mentions Jira, work items, or issue tracking
- User wants to query recently created or updated Jira tickets
- User needs to see what changed in Jira recently
- User asks about sprints, boards, or Jira project management
- User wants to create tickets and add them to Jira boards
- User asks to assign, transition, or comment on Jira tickets
- User mentions JQL queries or Jira searches

### GitHub-related requests
- User asks to create, view, or search GitHub issues
- User mentions GitHub issues, pull requests, or repositories
- User wants to query recently created or updated GitHub issues
- User asks about GitHub Projects, project boards, or project fields
- User wants to add issues to GitHub Projects
- User asks to edit project item fields (Status, Priority, etc.)
- User mentions GitHub issue search queries
- User asks to assign, label, or edit GitHub issues

# GitHub Issue Management

## Prerequisites

This skill requires the GitHub CLI (`gh`) to be installed and configured:

```bash
# Check if gh is installed
gh --version

# Authenticate with GitHub
gh auth login

# Verify project scope (required for Projects v2)
gh auth status

# Add project scope if needed (use --hostname for non-interactive)
gh auth refresh -s project --hostname github.com
```

For installation instructions, visit: https://cli.github.com/

## Using Config for GitHub

The config file can simplify GitHub operations:

```bash
# Use config values in scripts
REPO=$(jq -r '.github.default_repo' .claude/skills/jira/config.json)
ORG=$(jq -r '.github.default_org' .claude/skills/jira/config.json)

# Or use helper scripts
USERNAME=$(./scripts/resolve-github-user.sh svenja)
gh issue create --repo $REPO --assignee $USERNAME

# Get project info from config
PROJECT_NUM=$(jq -r '.github.projects.work.number' .claude/skills/jira/config.json)
PROJECT_OWNER=$(jq -r '.github.projects.work.owner' .claude/skills/jira/config.json)
```

## Quick Start Examples

### 1. List recently created/updated issues

```bash
# List open issues in current repo
gh issue list

# List recently created issues (last 7 days) using search
gh issue list --search "created:>=2026-01-16" --limit 20

# List recently updated issues
gh issue list --search "updated:>=2026-01-20" --limit 20

# List issues in specific repo
gh issue list --repo owner/repo

# List your issues
gh issue list --assignee "@me"

# List issues with specific label
gh issue list --label bug

# List all issues (including closed)
gh issue list --state all
```

### 2. Create a new issue

```bash
# Simple issue creation (interactive prompts)
gh issue create

# Create with all details inline
gh issue create \
  --title "Fix login bug" \
  --body "Users cannot log in on mobile devices" \
  --assignee "@me" \
  --label "bug,urgent"

# Create from file
cat > issue_body.md << 'EOF'
## Problem
Dashboard loading is very slow

## Expected
Load time under 2 seconds

## Actual
Takes 10+ seconds
EOF

gh issue create \
  --title "Dashboard performance issue" \
  --body-file issue_body.md \
  --label "performance"

# Create and add to project immediately
gh issue create \
  --title "New feature" \
  --body "Feature description" \
  --project "Roadmap"
```

### 3. View issue details

```bash
# View issue in terminal
gh issue view 123

# View issue in browser
gh issue view 123 --web

# View issue from specific repo
gh issue view 123 --repo owner/repo

# View with JSON output
gh issue view 123 --json title,body,state,assignees
```

### 4. Edit issues

```bash
# Edit title and body
gh issue edit 123 --title "New title" --body "Updated description"

# Add assignee
gh issue edit 123 --add-assignee "@me"

# Add labels
gh issue edit 123 --add-label "bug,urgent"

# Add to project
gh issue edit 123 --add-project "Roadmap"

# Remove from project
gh issue edit 123 --remove-project "Old Project"

# Set milestone
gh issue edit 123 --milestone "v1.0"
```

## GitHub Projects v2

### List projects

```bash
# List your projects
gh project list

# List organization projects
gh project list --owner myorg

# List with closed projects
gh project list --closed
```

### View project details

```bash
# View project fields and metadata
gh project view 1 --owner myorg

# Open project in browser
gh project view 1 --owner myorg --web
```

### List project fields

```bash
# List all fields in a project
gh project field-list 1 --owner myorg

# Get field IDs (needed for editing)
gh project field-list 1 --owner myorg --format json
```

Example output:
```json
{
  "fields": [
    {"id": "PVTSSF_...", "name": "Status", "type": "ProjectV2SingleSelectField", 
     "options": [{"id": "47fc9ee4", "name": "In progress"}]},
    {"id": "PVTSSF_...", "name": "Priority", "type": "ProjectV2SingleSelectField",
     "options": [{"id": "79628723", "name": "P0"}]},
    {"id": "PVTF_...", "name": "Estimate", "type": "ProjectV2Field"}
  ]
}
```

### Add issue to project

```bash
# Add issue to project (returns item ID)
gh project item-add 1 --owner myorg --url https://github.com/owner/repo/issues/123

# Capture the item ID for later use
ITEM_ID=$(gh project item-add 1 --owner myorg \
  --url https://github.com/owner/repo/issues/123 \
  --format json | jq -r '.id')
```

### Edit project item fields

**Important:** You need three pieces of information to edit a field:
1. **Project ID** - Get from `gh project list`
2. **Item ID** - Get from `gh project item-add` or `gh project item-list`
3. **Field ID** - Get from `gh project field-list`

```bash
# First, get the project and field information
PROJECT_ID="PVT_kwHOAFQosc4AdPlc"
gh project field-list 2 --owner myorg --format json

# Set a text field
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTF_lAHOAFQosc4AdPlczgS87kA \
  --text "My text value"

# Set a number field (e.g., Estimate)
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTF_lAHOAFQosc4AdPlczgS87kA \
  --number 5

# Set a single-select field (e.g., Status, Priority)
# First find the option ID from field-list output
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTSSF_lAHOAFQosc4AdPlczgS87j4 \
  --single-select-option-id 79628723

# Set a date field
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTF_lAHOAFQosc4AdPlczgS87kE \
  --date 2026-02-01

# Set an iteration field (requires GraphQL to get iteration IDs)
# First, get available iterations using GraphQL API
gh api graphql -f query='
{
  organization(login: "myorg") {
    projectV2(number: 6) {
      field(name: "Iteration") {
        ... on ProjectV2IterationField {
          id
          configuration {
            iterations {
              id
              title
              startDate
            }
          }
        }
      }
    }
  }
}' | jq -r '.data.organization.projectV2.field.configuration.iterations'

# Then set the iteration using the iteration ID
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTIF_lAHOAFQosc4AdPlczg1-utM \
  --iteration-id a3f8b31c

# Clear a field value
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTF_... \
  --clear
```

### List project items

```bash
# List all items in a project
gh project item-list 1 --owner myorg

# Get item IDs with JSON output
gh project item-list 1 --owner myorg --format json | jq -r '.items[].id'
```

## Complete GitHub Workflow Examples

### Create issue and add to project with custom fields

```bash
# 1. Create the issue
ISSUE_URL=$(gh issue create \
  --title "Implement new feature" \
  --body "Feature description" \
  --assignee "@me" \
  --label "feature" \
  --json url --jq '.url')

echo "Created issue: $ISSUE_URL"

# 2. Add to project
ITEM_ID=$(gh project item-add 2 \
  --owner myorg \
  --url $ISSUE_URL \
  --format json | jq -r '.id')

echo "Added to project with item ID: $ITEM_ID"

# 3. Get project ID and field IDs
PROJECT_ID="PVT_kwHOAFQosc4AdPlc"

# Get field IDs (do this once and save)
FIELDS=$(gh project field-list 2 --owner myorg --format json)

# Extract specific field IDs
STATUS_FIELD_ID=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Status") | .id')
PRIORITY_FIELD_ID=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Priority") | .id')

# Get option IDs for single-select fields
IN_PROGRESS_ID=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Status") | .options[] | select(.name=="In progress") | .id')
P0_ID=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Priority") | .options[] | select(.name=="P0") | .id')

# 4. Set project fields
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id $STATUS_FIELD_ID \
  --single-select-option-id $IN_PROGRESS_ID

gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id $PRIORITY_FIELD_ID \
  --single-select-option-id $P0_ID

echo "Project fields updated!"
```

### Create issue, add to project, and set iteration

```bash
# Complete workflow including iteration field
REPO="owner/repo"
PROJECT_NUM=6
PROJECT_OWNER="myorg"
PROJECT_ID="PVT_kwDOBFZTm84BD6ca"

# 1. Create issue with description from file
cat > /tmp/issue_desc.md << 'EOF'
Task description here
EOF

ISSUE_URL=$(gh issue create \
  --repo $REPO \
  --title "Task title" \
  --body-file /tmp/issue_desc.md \
  --assignee username)

echo "Created: $ISSUE_URL"

# 2. Add to project and get item ID
ITEM_ID=$(gh project item-add $PROJECT_NUM \
  --owner $PROJECT_OWNER \
  --url $ISSUE_URL \
  --format json | jq -r '.id')

echo "Item ID: $ITEM_ID"

# 3. Get iteration field ID and available iterations
ITERATION_FIELD_ID=$(gh project field-list $PROJECT_NUM \
  --owner $PROJECT_OWNER \
  --format json | jq -r '.fields[] | select(.name=="Iteration") | .id')

# Get iteration options via GraphQL
ITERATIONS=$(gh api graphql -f query="
{
  organization(login: \"$PROJECT_OWNER\") {
    projectV2(number: $PROJECT_NUM) {
      field(name: \"Iteration\") {
        ... on ProjectV2IterationField {
          configuration {
            iterations {
              id
              title
              startDate
            }
          }
        }
      }
    }
  }
}")

# Find next week's iteration (example: get iteration starting on specific date)
NEXT_WEEK_ITERATION_ID=$(echo $ITERATIONS | jq -r '.data.organization.projectV2.field.configuration.iterations[] | select(.startDate=="2026-01-26") | .id')

# 4. Set iteration
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id $ITERATION_FIELD_ID \
  --iteration-id $NEXT_WEEK_ITERATION_ID

echo "Iteration set to next week!"
```

### Query recently updated issues

```bash
# Issues updated in last 24 hours
gh issue list --search "updated:>=2026-01-22"

# Issues updated this week
gh issue list --search "updated:>=2026-01-20"

# My issues updated recently
gh issue list --assignee "@me" --search "updated:>=2026-01-20"

# Issues by state change
gh issue list --search "closed:>=2026-01-20"
```

## GitHub Search Syntax

GitHub uses a powerful search syntax for filtering issues:

```bash
# Date-based searches
gh issue list --search "created:>=2026-01-20"
gh issue list --search "updated:2026-01-20..2026-01-23"
gh issue list --search "closed:>=2026-01-20"

# User-based searches
gh issue list --search "author:username"
gh issue list --search "assignee:username"
gh issue list --search "mentions:username"

# Label and milestone
gh issue list --search "label:bug label:urgent"
gh issue list --search "milestone:v1.0"

# State and type
gh issue list --search "is:open"
gh issue list --search "is:closed"
gh issue list --search "is:issue" # vs is:pr

# Text search
gh issue list --search "performance in:title"
gh issue list --search "login in:body"

# Combining filters
gh issue list --search "is:open label:bug created:>=2026-01-20 sort:updated-desc"
```

For more search syntax: https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests

## Best Practices for GitHub

### 1. Always specify repo when not in a git directory

```bash
# WRONG - Will fail if not in a repo directory
gh issue list

# CORRECT - Specify repo explicitly
gh issue list --repo owner/repo
```

### 2. Use JSON output for automation

```bash
# Get structured data
gh issue list --json number,title,state,labels

# Parse with jq
gh issue list --json number,title --jq '.[] | "\(.number): \(.title)"'
```

### 3. Cache field IDs for project automation

Project field IDs don't change frequently. Save them:

```bash
# Get once
gh project field-list 2 --owner myorg --format json > project_fields.json

# Use later
STATUS_FIELD_ID=$(jq -r '.fields[] | select(.name=="Status") | .id' project_fields.json)
```

### 4. Project scope is required for Projects v2

Always ensure you have the project scope:
```bash
gh auth status | grep project
# If not present (use --hostname for non-interactive):
gh auth refresh -s project --hostname github.com
```

### 5. Use GraphQL API for iteration fields

Iteration fields don't expose their options via `field-list`. Use GraphQL:
```bash
gh api graphql -f query='
{
  organization(login: "myorg") {
    projectV2(number: 6) {
      field(name: "Iteration") {
        ... on ProjectV2IterationField {
          configuration {
            iterations { id title startDate }
          }
        }
      }
    }
  }
}'
```

### 6. Capture item IDs when adding to projects

Always capture the item ID when adding issues to projects:
```bash
ITEM_ID=$(gh project item-add 6 --owner myorg --url $ISSUE_URL --format json | jq -r '.id')
```

## CLI Limitations for GitHub

### Projects v2 complexity

GitHub Projects v2 requires multiple steps and IDs:
- Item IDs change when issues are added to projects
- Field IDs and option IDs are long GUIDs
- No direct way to set fields during issue creation
- Iteration fields require GraphQL API to get available iterations

**Workaround:** Create helper functions or scripts to cache IDs and automate multi-step operations.

## Troubleshooting GitHub Issues

### Authentication errors

```bash
# Error: "your authentication token is missing required scopes [project]"
# Solution: Add project scope (non-interactive mode)
gh auth refresh -s project --hostname github.com
```

### Finding organization vs user projects

```bash
# List organization projects
gh project list --owner orgname

# List user projects  
gh project list --owner username

# Or list your own projects
gh project list
```

### Iteration field not showing options

Iteration fields are special and don't show options in `field-list`. Use GraphQL:
```bash
gh api graphql -f query='
{
  organization(login: "myorg") {
    projectV2(number: 6) {
      field(name: "Iteration") {
        ... on ProjectV2IterationField {
          id
          configuration {
            iterations {
              id
              title
              startDate
              duration
            }
          }
        }
      }
    }
  }
}'
```

## Common GitHub Workflows

### Daily issue review

```bash
# What issues were created today?
gh issue list --search "created:>=2026-01-23" --repo owner/repo

# What issues were updated?
gh issue list --search "updated:>=2026-01-23" --repo owner/repo

# My open issues
gh issue list --assignee "@me" --state open --repo owner/repo
```

### Create and triage new issue

```bash
# Create issue
gh issue create --repo owner/repo

# Add labels
gh issue edit 123 --add-label "bug,needs-triage" --repo owner/repo

# Assign
gh issue edit 123 --add-assignee "@me" --repo owner/repo

# Add to project
gh issue edit 123 --add-project "Backlog" --repo owner/repo
```

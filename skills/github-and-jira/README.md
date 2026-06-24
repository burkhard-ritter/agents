# Jira & GitHub Issue Management Skill for Claude Code

A comprehensive Claude Code skill for working with both Jira and GitHub issues using the Atlassian CLI (`acli`) and GitHub CLI (`gh`). This skill enables you to query, create, and manage issues and work items across both platforms directly from the command line.

## Configuration

This skill includes a configuration file for commonly used organizations, projects, and user mappings, making it easier to work with your team.

### Config File

**Location**: `.claude/skills/jira/config.json`

The config file stores:
- **GitHub**: Default organization, repositories, projects, and user name-to-username mappings
- **Jira**: Default project and user name-to-email mappings

### Example Configuration

```json
{
  "github": {
    "default_org": "sportidentgmbh",
    "default_repo": "sportidentgmbh/work",
    "user_mappings": {
      "svenja": "Svenja86",
      "hakan": "hknozturk",
      "thomas": "thomas-scherer"
    },
    "projects": {
      "work": {
        "number": 6,
        "owner": "sportidentgmbh",
        "id": "PVT_kwDOBFZTm84BD6ca"
      }
    },
    "org_members": [...]
  },
  "jira": {
    "default_project": "NEP",
    "user_mappings": {
      "thomas": "thomas.scherer@sportident.com",
      "hakan": "hakan@sportident.com"
    }
  }
}
```

### Helper Scripts

Use the included helper scripts to resolve friendly names:

```bash
# Resolve GitHub username
./scripts/resolve-github-user.sh svenja
# Output: Svenja86

# Resolve Jira email
./scripts/resolve-jira-user.sh thomas
# Output: thomas.scherer@sportident.com

# Get config values
./scripts/get-github-config.sh default_org
# Output: sportidentgmbh
```

### Customizing for Your Team

1. Edit `config.json` to add your organization and team members
2. Add user mappings for easy reference (e.g., first names → GitHub usernames)
3. Store commonly used project IDs and numbers
4. Update organization members list as needed

## Installation

This skill supports both Jira and GitHub. Install the tools you need based on your workflow.

## Jira Setup

### 1. Install Atlassian CLI

Follow the installation instructions at: https://developer.atlassian.com/cloud/cli/

Or use a package manager:

```bash
# macOS
brew install atlassian-cli

# Linux (download from releases)
# Visit: https://developer.atlassian.com/cloud/cli/install/
```

### 2. Authenticate

```bash
acli jira auth login
```

You'll be prompted to:
1. Enter your Atlassian site URL (e.g., `yourcompany.atlassian.net`)
2. Authenticate via browser
3. Grant CLI access to your Jira instance

### 3. Verify Installation

```bash
acli jira workitem search --jql "created >= -1d" --limit 5
```

## Quick Start

### Find Your Project Key

Before creating or querying tickets, you need to know your project's key (not the full name):

```bash
# List your recent projects
acli jira project list --recent

# Look for the "Key" column (e.g., "NEP" for "Neptune" project)
```

**Important:** Always use the project KEY (e.g., "NEP"), not the full project name (e.g., "Neptune") in JQL queries and when creating tickets.

### Query Recently Created Tickets

```bash
# Tickets created in the last 7 days
acli jira workitem search --jql "created >= -7d ORDER BY created DESC"

# Your tickets created recently
acli jira workitem search --jql "creator = currentUser() AND created >= -7d"
```

### Query Recently Updated Tickets

```bash
# Tickets updated today
acli jira workitem search --jql "updated >= startOfDay() ORDER BY updated DESC"

# Your assigned tickets updated recently
acli jira workitem search --jql "assignee = currentUser() AND updated >= -3d"
```

### Create a New Ticket

```bash
# Simple task
acli jira workitem create --summary "Fix login bug" --project "TEAM" --type "Task"

# Bug with details
acli jira workitem create \
  --summary "Dashboard loading slow" \
  --project "TEAM" \
  --type "Bug" \
  --description "Dashboard takes 10+ seconds to load" \
  --assignee "@me" \
  --label "performance,urgent"
```

### Add Ticket to Sprint/Board

```bash
# First create the ticket
TICKET_KEY=$(acli jira workitem create --summary "New feature" --project "TEAM" --type "Story" --json | jq -r '.key')

# Then add to sprint
acli jira workitem edit $TICKET_KEY --sprint "Sprint 24"

# Or transition to move to board column
acli jira workitem transition $TICKET_KEY --to "In Progress"
```

### Open Ticket in Browser

Some operations (like adding components) require the web interface:

```bash
# Open ticket in your default browser
acli jira workitem view TEAM-123 --web
```

## Usage with Claude Code

Once this skill is installed, Claude Code will automatically use it when you ask about Jira or GitHub tasks. Simply ask:

**Jira examples:**
- "Show me Jira tickets created in the last week in project NEP"
- "Create a bug ticket in Jira for the login issue"
- "What Jira tickets were updated today?"
- "Create a Jira story and add it to Sprint 24"

**GitHub examples:**
- "Show me GitHub issues created this week in owner/repo"
- "Create a GitHub issue for the performance problem"
- "List my assigned GitHub issues"
- "Create a GitHub issue and add it to project 2 with high priority"

**With config file, you can use friendly names:**
- "Create a GitHub issue in work repo and assign it to Svenja"
- "Add this issue to the work project with iteration for next week"
- "Assign this Jira ticket to Thomas"

Claude will automatically:
1. Read the config file to resolve names and projects
2. Use helper scripts to map friendly names to usernames/emails
3. Execute the appropriate `acli` or `gh` commands with correct values

## Common Use Cases

### 1. Daily Standup

```bash
# What did I work on yesterday?
acli jira workitem search --jql "assignee = currentUser() AND updated >= -1d"

# What am I working on today?
acli jira workitem search --jql "assignee = currentUser() AND status = 'In Progress'"
```

### 2. Track Recent Changes

```bash
# Tickets that changed status in last 7 days
acli jira workitem search --jql "status changed DURING (-7d, now())"

# High-priority items created recently
acli jira workitem search --jql "priority = High AND created >= -7d"
```

### 3. Sprint Planning

```bash
# View backlog
acli jira workitem search --jql "project = TEAM AND sprint is EMPTY AND status = 'To Do'"

# Create sprint tasks
acli jira workitem create --summary "Implement feature X" --project "TEAM" --type "Story"
```

### 4. Bug Triage

```bash
# Recent bugs by priority
acli jira workitem search --jql "type = Bug AND created >= -7d ORDER BY priority DESC"

# Critical unresolved bugs
acli jira workitem search --jql "type = Bug AND priority = Highest AND status != Closed"
```

## JQL Quick Reference

### Date Functions
- `created >= -7d` - Created in last 7 days
- `updated >= startOfDay()` - Updated today
- `updated >= startOfWeek()` - Updated this week
- `created >= "2026-01-01"` - Created after specific date

### User Functions
- `assignee = currentUser()` - Assigned to me
- `creator = currentUser()` - Created by me
- `assignee = "user@example.com"` - Assigned to specific user

### Status and Changes
- `status = "In Progress"` - Current status
- `status changed DURING (-7d, now())` - Status changed recently
- `status changed TO "Done" AFTER -3d` - Completed recently

### Filters
- `project = TEAM` - Specific project
- `type = Bug` - Issue type
- `priority = High` - Priority level
- `labels = urgent` - Has label
- `sprint = "Sprint 24"` - In specific sprint

## CLI Limitations

### Fields Not Available via CLI

Some Jira fields cannot be set through the `acli` command-line tool:

- **Components** - Cannot be set during ticket creation or editing
- **Most custom fields** - Not accessible via CLI flags
- **Rich text formatting** - Advanced description formatting

**Workaround:**
1. Create the ticket using CLI with all available fields
2. Use `acli jira workitem view TICKET-KEY --web` to open it in browser
3. Add components and other fields through the web interface

### Complete Ticket Creation Workflow

```bash
# 1. Find project key
acli jira project list --recent

# 2. Create description file
cat > /tmp/ticket.txt << 'EOF'
**Problem:** Description here
**Solution:** Proposed fix
EOF

# 3. Create ticket
acli jira workitem create \
  --summary "Your ticket title" \
  --project "NEP" \
  --type "Task" \
  --description-file /tmp/ticket.txt \
  --assignee "user@example.com"

# 4. Open in browser to add components
acli jira workitem view NEP-XXX --web
```

## Troubleshooting

### Project Key Errors

```bash
# ERROR: "No project could be found with key 'Neptune'"
# CAUSE: Using full project name instead of key

# SOLUTION: Find the correct key
acli jira project list --recent
# Use the "Key" column (e.g., NEP), not the "Name" column (Neptune)
```

### Authentication Issues

```bash
# Re-authenticate
acli jira auth logout
acli jira auth login

# Check current authentication
acli config list
```

### Permission Errors

Ensure your Jira account has:
- Browse project permission
- Create issues permission
- Edit issues permission (for updates)

### JQL Syntax Errors

- Use quotes around strings: `project = "TEAM"`
- Use proper date format: `created >= -7d` or `created >= "2026-01-01"`
- Check field names: use `acli jira field search` to list available fields

## Advanced Features

### Custom Fields

```bash
# Search with custom fields
acli jira workitem search --jql "project = TEAM" --fields "key,summary,customfield_10001"

# List available fields
acli jira field search
```

### Bulk Operations

```bash
# Export to CSV
acli jira workitem search --jql "project = TEAM" --csv > tickets.csv

# Create multiple tickets
acli jira workitem create-bulk --from-json tickets.json
```

### Attachments

```bash
# Add attachment
acli jira workitem attachment add TEAM-123 --file screenshot.png

# List attachments
acli jira workitem attachment list TEAM-123
```

---

# GitHub Issue Management

## Installation

### 1. Install GitHub CLI

Follow the installation instructions at: https://cli.github.com/

Or use a package manager:

```bash
# macOS
brew install gh

# Linux (Debian/Ubuntu)
sudo apt install gh

# Other platforms
# Visit: https://github.com/cli/cli#installation
```

### 2. Authenticate

```bash
gh auth login
```

You'll be prompted to:
1. Choose GitHub.com or GitHub Enterprise
2. Authenticate via browser or token
3. Choose HTTPS or SSH for git operations

### 3. Add Project Scope

GitHub Projects v2 requires the `project` scope:

```bash
# Check current scopes
gh auth status

# Add project scope (use --hostname for non-interactive)
gh auth refresh -s project --hostname github.com
```

### 4. Verify Installation

```bash
# List issues (if in a repo directory)
gh issue list --limit 5

# Or specify a repo
gh issue list --repo owner/repo --limit 5
```

## Quick Start

### List Recently Created/Updated Issues

```bash
# Recently created issues (last 7 days)
gh issue list --search "created:>=2026-01-16" --repo owner/repo

# Recently updated issues
gh issue list --search "updated:>=2026-01-20" --repo owner/repo

# Your assigned issues
gh issue list --assignee "@me" --repo owner/repo
```

### Create a New Issue

```bash
# Simple creation
gh issue create --repo owner/repo

# With all details
gh issue create \
  --repo owner/repo \
  --title "Fix login bug" \
  --body "Users cannot log in on iOS" \
  --assignee "@me" \
  --label "bug,urgent"

# From file
gh issue create \
  --repo owner/repo \
  --title "Performance issue" \
  --body-file description.md \
  --label "performance"
```

### Add Issue to GitHub Project

```bash
# Create issue
ISSUE_URL=$(gh issue create \
  --repo owner/repo \
  --title "New feature" \
  --body "Description" \
  --json url --jq '.url')

# Add to project
gh project item-add 2 --owner myorg --url $ISSUE_URL
```

### Edit Project Fields

```bash
# Get project and field information
gh project field-list 2 --owner myorg --format json

# Add issue to project and get item ID
ITEM_ID=$(gh project item-add 2 --owner myorg \
  --url https://github.com/owner/repo/issues/123 \
  --format json | jq -r '.id')

# Set Status field
gh project item-edit \
  --id $ITEM_ID \
  --project-id PVT_kwHOAFQosc4AdPlc \
  --field-id PVTSSF_lAHOAFQosc4AdPlczgS87ec \
  --single-select-option-id 47fc9ee4

# Set Priority field
gh project item-edit \
  --id $ITEM_ID \
  --project-id PVT_kwHOAFQosc4AdPlc \
  --field-id PVTSSF_lAHOAFQosc4AdPlczgS87j4 \
  --single-select-option-id 79628723
```

## Common Use Cases

### Daily Issue Review

```bash
# What issues were created today?
gh issue list --search "created:>=2026-01-23" --repo owner/repo

# What issues were updated?
gh issue list --search "updated:>=2026-01-23" --repo owner/repo

# My open issues
gh issue list --assignee "@me" --state open --repo owner/repo
```

### Create and Triage Issue

```bash
# Create
gh issue create --repo owner/repo --title "Bug report" --body "Details"

# Label and assign
gh issue edit 123 --repo owner/repo \
  --add-label "bug,needs-triage" \
  --add-assignee "@me"

# Add to project
gh issue edit 123 --repo owner/repo --add-project "Backlog"
```

### Search Issues

```bash
# Date-based
gh issue list --search "created:>=2026-01-20" --repo owner/repo

# By author
gh issue list --search "author:username" --repo owner/repo

# By label
gh issue list --search "label:bug label:urgent" --repo owner/repo

# Combined
gh issue list --search "is:open label:bug created:>=2026-01-20 sort:updated-desc" --repo owner/repo
```

## GitHub Projects v2 Workflow

### Complete Example: Create Issue with Project Fields

```bash
#!/bin/bash
REPO="owner/repo"
PROJECT_NUM=2
PROJECT_OWNER="myorg"
PROJECT_ID="PVT_kwHOAFQosc4AdPlc"

# 1. Create issue
echo "Creating issue..."
ISSUE_URL=$(gh issue create \
  --repo $REPO \
  --title "Implement authentication" \
  --body "Add OAuth2 support" \
  --assignee "@me" \
  --label "feature" \
  --json url --jq '.url')

echo "Created: $ISSUE_URL"

# 2. Add to project
echo "Adding to project..."
ITEM_ID=$(gh project item-add $PROJECT_NUM \
  --owner $PROJECT_OWNER \
  --url $ISSUE_URL \
  --format json | jq -r '.id')

echo "Item ID: $ITEM_ID"

# 3. Get field IDs (cache these!)
FIELDS=$(gh project field-list $PROJECT_NUM --owner $PROJECT_OWNER --format json)

STATUS_FIELD=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Status") | .id')
PRIORITY_FIELD=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Priority") | .id')

IN_PROGRESS=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Status") | .options[] | select(.name=="In progress") | .id')
HIGH_PRIORITY=$(echo $FIELDS | jq -r '.fields[] | select(.name=="Priority") | .options[] | select(.name=="P0") | .id')

# 4. Set fields
echo "Setting Status to 'In progress'..."
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id $STATUS_FIELD \
  --single-select-option-id $IN_PROGRESS

echo "Setting Priority to 'P0'..."
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id $PRIORITY_FIELD \
  --single-select-option-id $HIGH_PRIORITY

echo "Done!"
```

### Setting Iteration Fields

Iteration fields require the GraphQL API to get available iterations:

```bash
# Get iteration field ID and available iterations
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
}' | jq '.data.organization.projectV2.field.configuration.iterations'

# Then set the iteration
gh project item-edit \
  --id $ITEM_ID \
  --project-id $PROJECT_ID \
  --field-id PVTIF_lAHOAFQosc4AdPlczg1-utM \
  --iteration-id a3f8b31c
```

## Troubleshooting

### GitHub Authentication Issues

```bash
# Error: "your authentication token is missing required scopes [project]"
# Solution: Add project scope with hostname for non-interactive mode
gh auth refresh -s project --hostname github.com

# Verify scopes
gh auth status
```

### Finding the Right Project Owner

```bash
# List organization projects
gh project list --owner orgname

# List user projects
gh project list --owner username

# List your own projects
gh project list
```

### Iteration Fields Not Showing Options

Iteration fields don't expose options via `gh project field-list`. Use GraphQL API instead:

```bash
gh api graphql -f query='
{
  organization(login: "myorg") {
    projectV2(number: 6) {
      field(name: "Iteration") {
        ... on ProjectV2IterationField {
          id
          configuration {
            iterations { id title startDate }
          }
        }
      }
    }
  }
}'
```

## GitHub CLI Limitations

### Projects v2 Complexity

- Requires multiple API calls to set project fields
- Need to track Project IDs, Item IDs, Field IDs, and Option IDs
- No single command to create issue with project fields
- Field/option IDs are long GUIDs that must be looked up
- Iteration fields require GraphQL API to get available iterations

**Recommendation:** Cache field IDs in variables or files for reuse.

### Repository Context

Many `gh` commands require being in a git repository or specifying `--repo`:

```bash
# In repo directory - works
gh issue list

# Outside repo - must specify
gh issue list --repo owner/repo
```

## Resources

- [Atlassian CLI Documentation](https://developer.atlassian.com/cloud/cli/)
- [JQL Reference](https://support.atlassian.com/jira-software-cloud/docs/use-advanced-search-with-jira-query-language-jql/)
- [Jira REST API](https://developer.atlassian.com/cloud/jira/platform/rest/v3/)
- [GitHub CLI Documentation](https://cli.github.com/manual/)
- [GitHub Issue Search Syntax](https://docs.github.com/en/search-github/searching-on-github/searching-issues-and-pull-requests)
- [GitHub Projects v2 API](https://docs.github.com/en/issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects)

## License

This skill is provided as-is for use with Claude Code.

---
description: Create GitLab Merge Request - Use MCP tools to create new MRs
---

# Create GitLab Merge Request

This workflow guides you through creating a new merge request using the GitLab MCP tools.

## Prerequisites

- **Project ID**: Use full path (e.g., `ankehao_demo/windsurf_demo`)
- **Source branch**: Usually `main` or current development branch
- **Branch name**: Descriptive name for your feature branch

## Steps

### 1. Create Feature Branch

Use `mcp4_create_branch` to create a new branch for your changes:

```
Branch name: feature/your-feature-name
Source: main
Project: ankehao_demo/windsurf_demo
```

### 2. Make Changes

**For single file changes:**
- Use `mcp4_create_or_update_file`
- Provide file path, content, and commit message

**For multiple file changes:**
- Use `mcp4_push_files` 
- Provide array of files with paths and contents
- Include clear commit message

### 3. Create Merge Request

Use `mcp4_create_merge_request` with:
- **Title**: Clear, concise description of changes
- **Description**: Detailed explanation of what and why
- **Source branch**: Your feature branch
- **Target branch**: Usually `main`

## Example Usage

```
"Create a new MR for score decay feature. 
Branch name: feature/score-decay
Changes: Update config.js and game.js to add score decay mechanics
Title: Add score decay mechanism
Description: Implements score decay to prevent large players from staying dominant without activity"
```

## Best Practices

1. **Branch Naming**: Use descriptive names like `feature/feature-name` or `fix/bug-description`
2. **Commit Messages**: Be clear about what changes were made and why
3. **MR Descriptions**: Include context, testing done, and any breaking changes
4. **File Organization**: Group related changes in single commits when possible

## Troubleshooting

**Issue:** "Not Found" errors when accessing files
**Solution:** Use full project path instead of numeric ID (e.g., `ankehao_demo/windsurf_demo`)

**Issue:** Permission denied errors
**Solution:** Ensure your GitLab token has proper `read_repository` and `write_repository` permissions

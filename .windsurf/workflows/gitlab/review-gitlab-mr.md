---
description: Review GitLab Merge Request - Review existing MRs using MCP tools
---

# Review GitLab Merge Request

This workflow guides you through reviewing an existing merge request using the GitLab MCP tools, accounting for the limitation that MR metadata cannot be retrieved automatically.

## Prerequisites

- **MR URL**: Full GitLab MR URL in format `https://gitlab.com/{namespace}/{project}/-/merge_requests/{id}`
- **Source branch**: Feature branch name being merged
- **Target branch**: Base branch name (usually `main`)
- **Project ID**: Full project path (e.g., `ankehao_demo/windsurf_demo`)

## Required Information

Before starting the review, provide:
- **MR URL**: The complete GitLab MR link
- **Source branch**: Name of the feature branch
- **Target branch**: Name of the base branch
- **Files to review**: List of modified files (if known)

## Review Process

### 1. Initial Setup
I'll parse the MR information and prepare to compare branches.

### 2. File Comparison
For each modified file, I'll:
- Use `mcp4_get_file_contents` to read the file from source branch
- Use `mcp4_get_file_contents` to read the file from target branch
- Generate a diff-style comparison

### 3. Code Analysis
I'll analyze the changes for:
- **Code Quality**: Style, readability, maintainability
- **Potential Issues**: Bugs, edge cases, performance problems
- **Best Practices**: Following project conventions
- **Security**: Any security concerns
- **Testing**: Whether tests need to be updated

### 4. Review Report
You'll receive a detailed review including:
- Summary of changes
- Line-by-line analysis of significant modifications
- Recommendations for improvements
- Any blocking issues that should be addressed

## Example Usage

```
"Review MR #5
URL: https://gitlab.com/ankehao_demo/windsurf_demo/-/merge_requests/5
Source: feature/score-decay
Target: main
Files: config.js, game.js"
```

## What I Can Review

- **JavaScript files**: Game logic, configuration, utilities
- **Python files**: Backend code, Flask routes
- **HTML/CSS files**: Templates and styling
- **Configuration files**: Package.json, requirements.txt
- **Documentation**: README files, inline comments

## Limitations & Workarounds

**Limitation:** Cannot retrieve MR metadata automatically
**Workaround:** You provide the URL and branch information manually

**Limitation:** Cannot see MR comments or discussions
**Workaround:** Focus on technical code review

**Limitation:** Cannot check CI/CD status
**Workaround:** Manually verify tests pass locally

**Limitation:** Cannot access commit history
**Workaround:** Review based on current branch state

## Best Practices for Review

1. **Be Specific**: Reference exact lines and files in feedback
2. **Explain Why**: Don't just point out issues, explain the reasoning
3. **Suggest Solutions**: Provide concrete improvement suggestions
4. **Consider Context**: Understand the feature's purpose and impact
5. **Check Tests**: Ensure new functionality is properly tested

## Troubleshooting

**Issue:** "Not Found" errors when accessing files
**Solution:** Use full project path instead of numeric ID (e.g., `ankehao_demo/windsurf_demo`)

**Issue:** Branch doesn't exist
**Solution:** Verify branch names are spelled correctly and exist in the repository

**Issue:** Permission denied errors
**Solution:** Ensure your GitLab token has proper `read_repository` permissions

**Issue:** Cannot determine which files changed
**Solution:** Provide a list of modified files, or I can check common project files

## Review Checklist

During the review, I'll check:
- [ ] Code follows project style guidelines
- [ ] New functionality is properly tested
- [ ] No obvious bugs or edge cases
- [ ] Performance considerations addressed
- [ ] Security implications considered
- [ ] Documentation is updated if needed
- [ ] Breaking changes are clearly documented
- [ ] Error handling is appropriate

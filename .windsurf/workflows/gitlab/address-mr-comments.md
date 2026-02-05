---
description: Address MR Comments - Handle feedback and make updates to existing MRs
---

# Address MR Comments

This workflow guides you through addressing feedback on existing merge requests using the GitLab MCP tools, working around the limitation that MR comments cannot be accessed automatically.

## Prerequisites

- **MR URL**: Full GitLab MR URL
- **Feature branch**: The branch with your changes
- **Comments/Feedback**: List of comments or feedback to address (provided manually)
- **Project ID**: Full project path (e.g., `ankehao_demo/windsurf_demo`)

## Required Information

Before starting, provide:
- **MR URL**: The complete GitLab MR link
- **Feature branch**: Name of your feature branch
- **Comments to address**: Copy/paste or summarize the feedback you received
- **Files mentioned**: Which files the comments reference

## Workflow Steps

### 1. Analyze Feedback
- Review each comment/feedback item
- Identify which files need changes
- Prioritize blocking vs. nice-to-have items
- Group related feedback together

### 2. Review Current Code
I'll use `mcp4_get_file_contents` to:
- Examine current state of mentioned files
- Understand the context for each comment
- Identify the exact locations needing changes

### 3. Implement Changes
**For single file fixes:**
- Use `mcp4_create_or_update_file` 
- Update the specific file with fixes
- Include descriptive commit message

**For multiple file changes:**
- Use `mcp4_push_files`
- Update all affected files in one commit
- Reference the MR number in commit message

### 4. Generate Response
I'll create a summary you can paste into MR comments:
- List which comments were addressed
- Explain changes made for each item
- Note any comments that need clarification
- Suggest next steps

## Example Usage

```
"Address comments on MR #5
URL: https://gitlab.com/ankehao_demo/windsurf_demo/-/merge_requests/5
Branch: feature/score-decay

Comments to address:
1. 'Add error handling for negative scores in game.js line 45'
2. 'Update config.js to make decay rate configurable'
3. 'Add tests for the new decay mechanism'

Please fix these and provide a response I can paste back."
```

## Types of Feedback to Handle

### Code Issues
- **Bugs**: Fix incorrect logic, edge cases
- **Performance**: Optimize algorithms, reduce complexity
- **Style**: Follow project conventions, improve readability

### Feature Changes
- **Enhancements**: Add requested functionality
- **Refactoring**: Improve code structure
- **Configuration**: Make features configurable

### Documentation
- **Comments**: Add inline documentation
- **README**: Update project documentation
- **API docs**: Document new endpoints/functions

## Response Templates

### For Individual Comments:
```
**Comment [N]:** [Brief summary of original comment]
**Status:** ✅ Addressed / ⚠️ Partially addressed / ❌ Needs clarification
**Changes:** [Description of what was changed]
**Files:** [List of files modified]
```

### For Overall Summary:
```
## MR #5 - Feedback Addressed

### ✅ Completed
- [ ] Fixed error handling for negative scores
- [ ] Made decay rate configurable
- [ ] Added comprehensive tests

### ⚠️ Needs Discussion
- [ ] Performance optimization suggestion (need more context)

### ❌ Unable to Address
- [ ] Feature requested outside scope (consider separate MR)

### Testing
- [ ] All existing tests pass
- [ ] New tests added for modified functionality
- [ ] Manual testing completed

Please review the changes and let me know if anything else needs attention!
```

## Best Practices

1. **One Commit Per Feedback Round**: Group all comment fixes in one commit
2. **Clear Commit Messages**: Reference MR number and feedback summary
3. **Preserve Functionality**: Ensure fixes don't break existing features
4. **Add Tests**: Include tests for any new or modified functionality
5. **Communicate Clearly**: Explain what was changed and why

## Common Scenarios

### Scenario 1: Simple Bug Fix
```
"Fix the undefined variable error in game.js line 23"
→ Update the variable declaration and add null check
→ Test the fix works correctly
→ Respond: 'Fixed undefined variable by adding proper initialization'
```

### Scenario 2: Style/Convention Feedback
```
"Please follow the project's naming convention for the new function"
→ Rename function to match project style
→ Update all references
→ Respond: 'Renamed function to follow project naming convention'
```

### Scenario 3: Feature Request
```
"Can you add a configuration option for this?"
→ Add config parameter to config.js
→ Update code to use the config value
→ Add tests for the new option
→ Respond: 'Added configurable option with default value'
```

## Troubleshooting

**Issue:** Cannot find the code mentioned in comment
**Solution:** Ask for clarification on exact file/line numbers

**Issue:** Comment requests breaking changes
**Solution:** Discuss impact and consider separate MR for major changes

**Issue:** Multiple conflicting comments
**Solution:** Prioritize and address in logical order, ask for clarification

**Issue:** Cannot test the fix properly
**Solution:** Describe testing approach and request manual verification

## Iterative Process

Addressing MR comments is often iterative:
1. **Round 1**: Address initial feedback
2. **Review**: Reviewer checks changes
3. **Round 2**: Address any new comments
4. **Final**: Get approval and merge

Use this workflow for each round of feedback until the MR is approved.

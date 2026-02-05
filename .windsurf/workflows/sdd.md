---
description: Spec-Driven Development (SDD) Workflow - Pull Jira specs and generate task breakdown
---

# Spec-Driven Development (SDD) Workflow

This workflow helps you implement features using a spec-driven approach by pulling specifications from Jira and breaking them down into actionable tasks.

## Prerequisites

- Jira MCP server configured and connected
- Valid Jira issue key/ID for the specification
- Write access to the repository

## Workflow Steps

### 1. Identify the Jira Specification

Ask the user for the Jira issue key (e.g., `PROJ-123`) that contains the specification or feature requirements.

### 2. Pull Specification from Jira

Use the Jira MCP server to retrieve the full specification details:
- Issue title and description
- Acceptance criteria
- Technical requirements
- Dependencies and blockers
- Any attached documentation

### 3. Analyze the Specification

Review the pulled specification and identify:
- **Core requirements**: What must be implemented
- **Technical approach**: How it should be built
- **Dependencies**: What needs to exist first
- **Success criteria**: How to verify completion
- **Edge cases**: What could go wrong

### 4. Break Down into Tasks

Create a structured task breakdown with:
- **Task ID**: Sequential numbering (T1, T2, etc.)
- **Task description**: Clear, actionable item
- **Dependencies**: Which tasks must complete first
- **Estimated complexity**: Low/Medium/High
- **Acceptance criteria**: How to verify the task is done

### 5. Generate tasks.md

Create or update `tasks.md` in the project root with:

```markdown
# Tasks for [Jira Issue Key]: [Issue Title]

**Jira Link**: [URL to Jira issue]
**Status**: Planning
**Last Updated**: [Date]

## Specification Summary

[Brief overview of what needs to be built]

## Task Breakdown

### T1: [Task Title]
- **Description**: [What needs to be done]
- **Dependencies**: None | T[X], T[Y]
- **Complexity**: Low | Medium | High
- **Acceptance Criteria**:
  - [ ] Criterion 1
  - [ ] Criterion 2
- **Files to modify**: [List of files]

### T2: [Task Title]
...

## Implementation Order

1. T[X] - [Brief description]
2. T[Y] - [Brief description]
...

## Testing Strategy

- Unit tests: [What to test]
- Integration tests: [What to test]
- Manual verification: [What to check]

## Notes

[Any additional context, risks, or considerations]
```

### 6. Present Plan to User

Show the user:
- Summary of the specification
- Number of tasks identified
- Estimated complexity breakdown
- Suggested implementation order
- Any risks or blockers identified

### 7. Wait for User Approval

**⚠️ STOP HERE - Do not proceed without explicit user approval**

Ask the user to review `tasks.md` and confirm:
- ✅ Task breakdown is complete and accurate
- ✅ Dependencies are correctly identified
- ✅ Implementation order makes sense
- ✅ Acceptance criteria are clear

The user may request changes to:
- Task granularity (split or merge tasks)
- Implementation approach
- Priority or order
- Additional considerations

### 8. Iterate if Needed

If the user requests changes:
- Update `tasks.md` with the requested modifications
- Re-present the updated plan
- Wait for approval again

### 9. Begin Implementation

Once approved:
- Mark status in `tasks.md` as "In Progress"
- Start with the first task in the implementation order
- Update task checkboxes as you complete acceptance criteria
- Commit changes with references to task IDs

### 10. Track Progress

As you work through tasks:
- Check off completed acceptance criteria
- Update task status (Not Started → In Progress → Done)
- Note any blockers or changes in the Notes section
- Keep `tasks.md` synchronized with actual progress

## Example Usage

**User**: "Let's implement PROJ-456 using SDD"

**Cascade**: 
1. Retrieves PROJ-456 from Jira
2. Analyzes the specification
3. Creates `tasks.md` with 8 tasks
4. Presents the breakdown
5. Waits for approval

**User**: "Looks good, but split T3 into two tasks"

**Cascade**:
1. Updates `tasks.md` with T3a and T3b
2. Adjusts dependencies
3. Re-presents the plan
4. Waits for approval

**User**: "Approved, let's start"

**Cascade**: Begins implementing tasks in order

## Best Practices

- **Keep tasks atomic**: Each task should be independently testable
- **Clear acceptance criteria**: No ambiguity about "done"
- **Track dependencies**: Don't start dependent tasks early
- **Update frequently**: Keep `tasks.md` current with reality
- **Reference task IDs**: Use them in commit messages and PRs
- **Test incrementally**: Verify each task before moving on

## Notes

- This workflow requires the Jira MCP server to be properly configured
- If Jira is unavailable, the user can manually provide the specification
- The `tasks.md` file serves as the single source of truth during implementation
- Consider creating a branch per major task or feature for easier review

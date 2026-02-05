---
description: GitHub Pull Request Review
auto_execution_mode: 1
---

# Workflow: Review a Pull Request on GitHub

You are reviewing a GitHub Pull Request. Follow these steps to conduct a thorough review:

## Important: Cross-Repository Support

This workflow supports reviewing PRs from ANY GitHub repository, not just the currently open workspace. 

**When the user provides a PR URL or specifies a repository:**
- Extract the owner/repo from the URL or specification (e.g., `parkerduff/game-demo` from `https://github.com/parkerduff/game-demo/pull/9`)
- Use the `--repo owner/repo` flag with all `gh` commands
- Do NOT attempt to checkout the PR branch locally unless explicitly requested
- Work entirely through the GitHub API using `gh` commands

## Step-by-Step Review Process

1. **Parse the PR reference** - Extract owner, repo, and PR number from the user's input
2. **Fetch the PR details** - Get the PR number, title, description, changed files, and latest commit SHA
3. **Review the PR description** - Verify it clearly states purpose and links to relevant issues
4. **Analyze the diff** - Get the full diff and analyze all changes
5. **Post line-specific comments** - For each issue or suggestion, IMMEDIATELY post a comment to GitHub using the API
6. **Post overall feedback** - After all line comments are posted, post a comprehensive summary comment

## Review Criteria

Analyze the PR thoroughly covering the following areas:

### 1. Purpose & Scope Review
- Does the PR clearly state its purpose and link to relevant issues?
- Are the changes aligned with the stated purpose?
- Is the scope appropriate (not too large or mixing unrelated changes)?

### 2. Code Quality Assessment
- **Correctness**: Does the code work as intended? Are there logical errors?
- **Standards**: Does the code follow project coding standards and conventions?
- **Readability**: Is the code clear and well-documented?
- **Performance**: Are there any performance concerns or inefficiencies?
- **Security**: Are there any security vulnerabilities or concerns?

### 3. Testing & Verification
- Are appropriate tests included (unit, integration, e2e)?
- Do the tests adequately cover the changes?
- Have all automated checks (linters, tests, CI/CD) passed?
- Are the "How to Test" instructions clear and complete?

### 4. Architecture & Design
- Does the implementation follow established patterns in the codebase?
- Are there better approaches or refactoring opportunities?
- Is the code maintainable and extensible?
- Are dependencies appropriate and necessary?

### 5. Documentation
- Is relevant documentation updated (README, API docs, inline comments)?
- Are complex logic sections adequately explained?
- Are breaking changes clearly documented?

### 6. UI/UX Review (if applicable)
- Do screenshots/GIFs demonstrate the changes effectively?
- Is the user experience intuitive and consistent?
- Are there accessibility considerations?

## Line-Specific Comment Format

For individual code comments, keep them concise and direct:
- Start with an emoji prefix: 💡 (suggestion), 🔍 (required change), or ❓ (question)
- Be specific about what needs to change
- Explain the "why" behind your feedback
- Provide examples or alternatives when suggesting changes

**Examples:**
- `💡 Suggestion: Consider adding error handling here for edge cases.`
- `🔍 Required: This function needs a return type annotation.`
- `❓ Question: Should this be async to handle potential promise rejections?`

## Overall Feedback Format

For the final summary comment, use this structured format:

### ✅ Strengths
<!-- Highlight what's done well -->

### 🔍 Required Changes
<!-- Critical issues that must be addressed before approval -->

### 💡 Suggestions
<!-- Optional improvements and best practices -->

### ❓ Questions
<!-- Clarifications needed from the author -->

### 🧪 Testing Notes
<!-- Results from manual testing or additional test scenarios to consider -->

## CRITICAL: Actually Post Comments to GitHub

**YOU MUST EXECUTE THE COMMANDS, NOT JUST SHOW THEM TO THE USER.**

When you identify an issue or suggestion during your review:
1. Immediately construct the `gh api` command with the proper parameters
2. Execute the command using the run_command tool
3. Verify the comment was posted successfully
4. Continue to the next issue

**DO NOT:**
- Show bash commands in code blocks without executing them
- Provide example commands for the user to run manually
- Wait until the end to post all comments
- Explain what commands you would run - just run them

### How to Post Line-Specific Comments

For each issue you identify, immediately execute:

```bash
gh api repos/OWNER/REPO/pulls/PR_NUMBER/comments \
  -f body="Your comment text with emoji prefix" \
  -f commit_id="COMMIT_SHA" \
  -f path="relative/path/to/file" \
  -F line=LINE_NUMBER \
  -f side="RIGHT"
```

**Required Parameters:**
- `OWNER/REPO`: Extract from the PR URL (e.g., `parkerduff/game-demo`)
- `PR_NUMBER`: The PR number from the URL
- `COMMIT_SHA`: Get this first using `gh pr view PR_NUMBER --repo OWNER/REPO --json commits --jq '.commits[-1].oid'`
- `path`: Relative path from the diff output
- `line`: The line number where the issue occurs
- `body`: Your comment with emoji prefix (✅, 💡, 🔍, or ❓)

### How to Post Overall Feedback

After posting all line-specific comments, post your summary:

```bash
gh api repos/OWNER/REPO/issues/PR_NUMBER/comments \
  -f body="Your formatted overall feedback"
```

**Note:** Use `/issues/` endpoint for general comments, `/pulls/` endpoint for line-specific comments.

### Example Workflow Execution

```bash
# Step 1: Get commit SHA
COMMIT_SHA=$(gh pr view 9 --repo parkerduff/game-demo --json commits --jq '.commits[-1].oid')

# Step 2: Post line-specific comment immediately when you find an issue
gh api repos/parkerduff/game-demo/pulls/9/comments \
  -f body="🔍 Required: Add error handling here" \
  -f commit_id="$COMMIT_SHA" \
  -f path="src/auth.js" \
  -F line=42 \
  -f side="RIGHT"

# Step 3: Post another comment for the next issue
gh api repos/parkerduff/game-demo/pulls/9/comments \
  -f body="💡 Suggestion: Consider extracting this to a helper function" \
  -f commit_id="$COMMIT_SHA" \
  -f path="src/auth.js" \
  -F line=58 \
  -f side="RIGHT"

# Step 4: After all line comments, post overall feedback
gh api repos/parkerduff/game-demo/issues/9/comments \
  -f body="### ✅ Strengths
- Good code structure
- Comprehensive tests

### 🔍 Required Changes
- Fix error handling in auth.js line 42

### 💡 Suggestions
- Consider refactoring auth.js line 58"
```

## Review Tone Guidelines
- Be constructive and respectful
- Explain the "why" behind feedback
- Offer specific examples or alternatives
- Acknowledge good practices and improvements
- Focus on the code, not the person
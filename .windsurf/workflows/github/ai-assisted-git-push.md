---
description: Push to GitHub with AI-Generated Commit Messages (Cascade)
auto_execution_mode: 1
---

# Push to GitHub with AI-Generated Commit Messages (Cascade)

This workflow outlines the steps to commit changes with an AI-generated commit message and push them to GitHub.

## Workflow Steps

### 1. Check Git Status
Verify the current state of your local repository.
```bash
git status
```

### 2. Review Changes
Cascade will present the output of `git status`. You will be asked to confirm if you want to proceed.
*(User interaction: Cascade will ask "Review the above changes. Continue?" and provide yes/no options)*

### 3. Generate Commit Message
Cascade will analyze the staged changes (using `git diff --staged`) to create a suggested commit message. If no changes are staged, Cascade may offer to stage all current changes or ask you to stage them manually.

*(Cascade internal step: Analyze diff and generate commit message)*

### 4. Review & Commit
Cascade will present the AI-generated commit message. You'll have the opportunity to review and edit it. Once confirmed, Cascade will execute the commit.
```bash
# Cascade will run this with the (potentially user-edited) generated message
git commit -m "[generated-message]"
```

### 5. Push to GitHub
Push your committed changes to the current branch on the `origin` remote, setting it to track the upstream branch.
```bash
git push -u origin HEAD
```

**Notes:**
*   This workflow defaults to pushing to the `main` branch on the `origin` remote. You may need to adjust these if your setup differs.
*   Ensure the desired files are staged before step 3 for the most accurate AI-generated commit message.
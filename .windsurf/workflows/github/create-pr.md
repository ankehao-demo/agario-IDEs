---
description: Create a Pull Request
auto_execution_mode: 1
---

# Generate PR Workflow

1. Run format script to ensure code follows style guidelines:
```bash
./scripts/format.sh
```

2. **Create feature branch BEFORE committing (if on main):**
```bash
# Check current branch
git branch --show-current

# If on main, create feature branch first
if [ "$(git branch --show-current)" = "main" ]; then
  git checkout -b $(user_or_whoami="${USER:-$(whoami)}"; branch_prefix="${user_or_whoami:-feat}"; echo "$branch_prefix" | tr '[:upper:]' '[:lower:]')/descriptive-branch-name
fi
```

3. If there are un-committed changes, commit with a descriptive message:
```bash
git commit -am "descriptive commit message"
```

4. **Push the feature branch to origin:**
```bash
git push -u origin $(git branch --show-current)
```

5. Check what changes were made in this branch:
```bash
git diff main
```

6. Create PR using the template:
```bash
# Create PR with proper escaping for code references
gh pr create --title "Title In Capital Case" --body $'PR body following template'
```

Important notes:
- Title should be in Capital Case (e.g. "Make Cascade Better")
- PR must follow the template github_pr_template defined below.
- Leave testing section as TODO.
- Use single quotes with $' syntax for the PR body to ensure proper escaping of special characters and newlines. Use real newline characters.
- Explicitly specify `--base`, `--head`, `--repo`, and `--web=false` to avoid interactive prompts.
- Create PRs as drafts by default using the `--draft` flag unless otherwise specified.
- Do NOT research around and try to understand the user's changes. Just look at the contents of the diff.
- **CRITICAL**: Never commit changes directly to main. Always use feature branches for PRs.
- If you accidentally commit to main, follow step 3 to move changes to a feature branch before creating the PR.
- The feature branch must be pushed to origin before `gh pr create` will work.
- If `gh pr create` fails with "No commits between main and [branch]", ensure the feature branch has commits and is pushed to origin.

<github_pr_template>
Summary
=======
Write a 1-2 sentence summary of what this PR does.

Changes
=======
For large PRs, write some bullet points about what the PR does. Please note anything that the reviewer should be especially aware of.

Security Impact
===============
Describe the security impact of this PR. Consider ALL of the following potential security implications:

**API & Network Changes:**
- Are new API endpoints being exposed? If so, detail their authentication and authorization mechanisms.
- Are existing endpoint permissions or access controls being modified?
- Are new network ports or services being exposed?
- Are there changes to TLS/SSL configurations or certificate handling?
- Are there modifications to network filtering, firewall rules, or ingress/egress controls?

**Authentication & Authorization:**
- Are there changes to authentication mechanisms or user session handling?
- Are new roles, permissions, or access control rules being introduced?
- Are there modifications to token validation, JWT handling, or cookie security?

**Data Handling:**
- Are sensitive data fields being added to models, protos, or databases?
- Are there changes to how PII or confidential information is processed, stored, or transmitted?
- Are there modifications to data encryption or hashing methods?
- Are there changes to data retention policies or deletion mechanisms?

**Dependencies & Infrastructure:**
- Are new third-party dependencies (libraries, packages, services) being introduced?
- Are existing dependencies being updated to address security vulnerabilities?
- Are there changes to container images, Kubernetes configurations, or deployment processes?
- Are there modifications to infrastructure-as-code that affect security posture?

**Cryptography & Secrets:**
- Are new cryptographic methods or algorithms being implemented?
- Are there changes to how secrets, keys, or credentials are managed?
- Are there modifications to encryption key rotation or management?

**Protocol & Schema Changes:**
- If you have proto/field changes or additions, what are the security implications if these schemas were publicly known?
- Could these changes expose internal implementation details or sensitive information?

**Logging & Monitoring:**
- Are there changes to logging that might expose sensitive information?
- Are there modifications to audit trails or security monitoring?

**IMPORTANT:** If ANY of the changes have the potential to impact the security of the application or deployment, you MUST add Mark and Matt V as code reviewers. When in doubt, err on the side of caution and include them.

Test Plan
=========
Describe how you have tested this PR. For PRs that modify production code this is **required**. These test plans will help guide the reviewer as well as enterprise QA processes.

Cherry-Picking
==============
Is this PR a fix for another PR? Does this PR need to be cherry-picked onto the current enterprise release branch/language server release branch?

Documentation
=============
List any relevant documents related to this change. Here are some potential things worth documenting:
- Is the code itself documented reasonably well? Note that high level architecture documentation is usually better in a separate document.
- How will people know how to build on top of this? What should they be careful to avoid breaking? Should a system architecture document be created / updated?
- Was there any complex process used to develop this change that others may want to use in the future?
- If this is an internal tool or system, what new information do users of this tool/system need to know?
- If this affects our production systems or release processes, what runbooks need to be updated?
- If this is a data pipeline, is there documentation about what datasets were produced, what they contain, and how to regenerate them?
- If this is related to a research experiment, are the results of that research recorded somewhere?
</github_pr_template>
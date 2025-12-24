---
description: When asked to address comments on a pull request
auto_execution_mode: 1
---

1. Check out the PR branch: `gh pr checkout [id]`

2. Get comments on PR
```bash
gh api --paginate repos/[owner]/[repo]/pulls/[id]/comments | jq '.[] | {user: .user.login, body, path, line, original_line, created_at, in_reply_to_id, pull_request_review_id, commit_id}'
```

3. For EACH comment, do the following. Remember to address one comment at a time.
  3a. Print out the following: "(index). From [user] on [file]:[lines] — [body]"
  3b. Analyze the file and the line range.
  3c. If you don't understand the comment, do not make a change. Just ask me for clarification, or to implement it myself.
  3d. If you think you can make the change, make the change BEFORE moving onto the next comment.

4. After all comments are processed, summarize what you did, and which comments need the USER's attention.
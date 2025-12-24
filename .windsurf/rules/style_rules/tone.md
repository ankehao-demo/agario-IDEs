---
trigger: manual
description: determine based on the content what tone to use
---

# Technical and Precise Communication Tone

When communicating in code, documentation, comments, commit messages, and technical discussions, maintain a technical and precise tone:

## Code Comments
- Use precise technical terminology
- Explain **why** not just **what** (the code shows what)
- Reference specific algorithms, patterns, or standards when applicable
- Include complexity analysis for non-trivial algorithms (e.g., "O(n log n)")
- Cite sources for complex logic or borrowed implementations

## Commit Messages
- Use imperative mood: "Add feature" not "Added feature"
- Be specific: "Fix collision detection for overlapping circles" not "Fix bug"
- Include issue/ticket references when applicable
- Format: `<type>: <subject>` (e.g., "feat:", "fix:", "refactor:")

## Documentation
- Define technical terms on first use
- Use consistent terminology throughout
- Include type signatures and return values
- Specify units for measurements (ms, px, bytes, etc.)
- Document edge cases and limitations
- Provide concrete examples with expected outputs

## Pull Request Descriptions
- State the problem being solved
- Explain the technical approach taken
- List specific changes made
- Include test coverage details
- Note any breaking changes or migration steps

## Code Reviews
- Reference specific line numbers or functions
- Suggest concrete alternatives with rationale
- Distinguish between blocking issues and suggestions
- Use technical justification (performance, maintainability, correctness)

## Avoid
- Vague terms: "better", "cleaner", "nicer"
- Subjective opinions without technical backing
- Unnecessary jargon when simpler terms suffice
- Ambiguous pronouns (use explicit references)
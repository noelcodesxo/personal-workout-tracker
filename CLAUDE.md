# Claude Code — Project Guidelines

## Git & PR Workflow

**Never commit directly to `main`.** All work goes through a feature branch and a pull request.

1. Create a branch: `git checkout -b feat/<name>` (e.g. `feat/epic-2-exercises`)
2. Do the work, commit on that branch
3. Push: `git push -u origin <branch>`
4. Open a PR: `gh pr create ...` so the user can review before merging

This applies to every non-trivial change — new features, bug fixes, epic work.

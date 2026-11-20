# Contributing to PulseAlpha

## Before opening a pull request

1. Run `python3 scripts/verify.py`.
2. Check the page locally with `python3 -m http.server 8000`.
3. Keep all content research-only: no trade execution, brokerage credentials or personal financial information.
4. Never add provider keys to browser code. Real provider access belongs behind a server-side endpoint.
5. Review the exact staging area before pushing:

   ```bash
   git status
   git diff --cached
   ```

## Data and model changes

- Label simulated or delayed data clearly.
- Document data provenance and licensing before using a live source.
- Do not describe a projection as a guaranteed return or investment recommendation.
- Treat external API responses as untrusted input; avoid inserting them with `innerHTML` without a deliberate sanitization strategy.

## Commit style

Use short, descriptive commits, for example:

```text
feat: add forecast confidence explanation
fix: preserve selected exchange after model refresh
docs: clarify server-side key handling
```

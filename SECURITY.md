# Security policy

## Secret-handling policy

PulseAlpha is currently a static, simulated-data prototype and intentionally contains no API keys, passwords, tokens, or credentials.

If live NSE/BSE data is added in the future:

- Keep provider credentials in server-side environment variables or a managed secret store.
- Never place keys in `index.html`, browser JavaScript, client-side configuration, source maps, or public build logs.
- Keep local `.env` files untracked. The checked-in `.env.example` contains comments and placeholders only.
- Route data-provider requests through a backend endpoint that authenticates and rate-limits requests; do not call a credentialed market-data API directly from the browser.
- Rotate a credential immediately if it is ever pasted into an issue, commit, pull request, screenshot, or chat.

## Reporting a vulnerability

Please use GitHub's private security advisory feature for this repository, or contact the repository maintainer through the private contact channel configured in the repository settings. Do not include passwords, API keys, account numbers, or personal financial information in public issues.

## Supported scope

Security fixes apply to the default branch of this repository. This prototype is for research and product demonstration only; it does not execute trades or handle brokerage accounts.

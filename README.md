# PulseAlpha

An elegant, dependency-free research dashboard for exploring directional equity signals across a sample of Indian NSE/BSE stocks.

> **Prototype notice:** prices, charts, signals and forecasts are generated locally from simulated inputs. This repository does not provide live market data, investment research or trade recommendations.

## Features

- Searchable sample universe: Reliance, TCS, HDFC Bank, ICICI Bank, Infosys and SBI
- NSE/BSE display switcher, range controls and selectable forecast horizons
- Illustrative price paths, projected ranges, confidence scores and technical signal stack
- Responsive desktop/mobile interface with accessible controls
- Built-in methodology disclosure and clear research-only guardrails

## Run locally

No package installation or secret configuration is required.

```bash
cd "/Users/robins/My files/Project repos/Assignment BSE NSE pred app"
python3 -m http.server 8000
```

Open [http://localhost:8000](http://localhost:8000) and stop the server with `Ctrl+C` when finished. Opening `index.html` directly also works in modern browsers, but a local server is preferable.

## Verify before pushing

The repository includes a dependency-free verification script and a matching GitHub Actions workflow.

```bash
python3 scripts/verify.py
```

It checks static-file wiring, browser UI IDs referenced by JavaScript, and common accidental credential formats. It is a safeguard, not a replacement for code review or a dedicated secret scanner.

## Project structure

```text
├── index.html                   # Application markup
├── styles.css                   # Responsive visual system
├── app.js                       # Simulated fixtures and UI behavior
├── scripts/verify.py            # Local source and secret-pattern checks
├── .github/workflows/verify.yml # CI verification on pushes and pull requests
├── .env.example                 # Safe, commented reference only
└── SECURITY.md                  # Credential and vulnerability-reporting policy
```

## Adding live market data safely

Do **not** replace the simulated `STOCKS` fixture with a browser call that embeds an API key. Market-data credentials can be harvested from any client-side JavaScript bundle.

Instead:

1. Add a server-side service or serverless function that owns the provider key.
2. Store the key in your deployment platform's managed secret store or server environment.
3. Expose a narrowly scoped API to the browser, with authentication, validation, rate limiting and caching.
4. Keep `.env` files untracked; use `.env.example` only for comments/placeholders.
5. Validate data licensing, model performance and applicable Indian securities/compliance requirements before publishing outputs as research.

See [SECURITY.md](SECURITY.md) for the repository's security policy.

## Before creating a public repository

- Choose and add a license that matches how you want others to use the project.
- Review the staging area with `git status` and `git diff --cached` before every push.
- Never commit `.env`, private keys, provider dashboards/screenshots, real customer data or brokerage credentials.

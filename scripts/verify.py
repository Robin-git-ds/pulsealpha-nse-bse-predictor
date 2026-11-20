#!/usr/bin/env python3
"""Dependency-free repository checks for PulseAlpha.

Run with: python3 scripts/verify.py

The checks cover the source-controlled static application only. They catch
broken asset wiring, missing DOM targets referenced by the UI, and several
common accidentally committed credential formats.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
REQUIRED_FILES = ("index.html", "styles.css", "app.js", "README.md", ".gitignore", "SECURITY.md")
TEXT_EXTENSIONS = {".html", ".css", ".js", ".md", ".py", ".yml", ".yaml", ".json", ".txt"}
IGNORED_DIRECTORIES = {".git", "node_modules", ".venv", "venv", "coverage", "dist", "build", "data"}
SECRET_PATTERNS = {
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{20,}\b"),
    "GitHub fine-grained token": re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    "OpenAI-style key": re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    "Private key block": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----"),
}


def source_files() -> list[Path]:
    """Return text source files while excluding dependencies and local outputs."""
    files: list[Path] = []
    for path in ROOT.rglob("*"):
        if any(part in IGNORED_DIRECTORIES for part in path.parts):
            continue
        if path.is_file() and path.suffix.lower() in TEXT_EXTENSIONS:
            files.append(path)
    return files


def check_required_files(errors: list[str]) -> None:
    for file_name in REQUIRED_FILES:
        if not (ROOT / file_name).is_file():
            errors.append(f"Missing required repository file: {file_name}")


def check_static_wiring(errors: list[str]) -> None:
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    script = (ROOT / "app.js").read_text(encoding="utf-8")
    for asset in ("styles.css", "app.js"):
        if asset not in html:
            errors.append(f"index.html does not reference {asset}")

    html_ids = set(re.findall(r'\bid="([^"]+)"', html))
    javascript_ids = set(re.findall(r'element\("([^"]+)"\)', script))
    unresolved = sorted(javascript_ids - html_ids)
    if unresolved:
        errors.append("JavaScript references missing HTML IDs: " + ", ".join(unresolved))


def check_for_secrets(errors: list[str]) -> None:
    for path in source_files():
        try:
            text = path.read_text(encoding="utf-8")
        except UnicodeDecodeError:
            continue
        for label, pattern in SECRET_PATTERNS.items():
            if pattern.search(text):
                errors.append(f"Possible {label} found in {path.relative_to(ROOT)}")


def main() -> int:
    errors: list[str] = []
    check_required_files(errors)
    check_static_wiring(errors)
    check_for_secrets(errors)
    if errors:
        print("Repository verification failed:")
        for error in errors:
            print(f"- {error}")
        return 1
    print("Repository verification passed: static wiring and common secret checks are clean.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

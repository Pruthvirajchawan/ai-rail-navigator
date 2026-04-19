# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| `main`  | ✅ Actively maintained |
| < 1.0   | ❌ Not supported   |

## Reporting a Vulnerability

We take security seriously. If you discover a vulnerability, please **do not** open a public GitHub issue.

### How to Report

1. Email the maintainers directly (see repository contacts), **or**
2. Use [GitHub Security Advisories](../../security/advisories/new) for private disclosure

### What to Include

- A clear description of the vulnerability
- Steps to reproduce (PoC code if possible)
- Affected versions / commits
- Potential impact assessment
- Any suggested mitigations

### Response Timeline

| Stage | Target |
|-------|--------|
| Initial acknowledgement | Within **48 hours** |
| Triage & severity assignment | Within **5 business days** |
| Fix or mitigation | Within **30 days** for critical / high-severity issues |
| Public disclosure | Coordinated with reporter after patch release |

## Security Best Practices for Contributors

- Never commit secrets, API keys, or credentials — use environment variables
- Run `npm audit` before submitting dependency upgrades
- Validate all external inputs (especially future API integrations)
- Follow the principle of least privilege when adding new permissions
- Use parameterized queries — never string-concatenate SQL

## Scope

This policy covers the application code in this repository. For vulnerabilities in upstream dependencies, please report directly to the maintainers of those packages.

Thank you for helping keep this project and its users safe! 🛡️

# Contributing to AI Railway Section Controller

Thank you for your interest in contributing! This document outlines our development workflow, coding standards, and review process.

---

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Branching Strategy](#branching-strategy)
- [Commit Convention](#commit-convention)
- [Pull Request Process](#pull-request-process)
- [Coding Standards](#coding-standards)
- [Testing](#testing)

---

## Code of Conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md). By participating, you agree to uphold its terms.

---

## Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/ai-railway-controller.git
   cd ai-railway-controller
   ```
3. **Install** dependencies:
   ```bash
   npm install
   ```
4. **Run** the dev server:
   ```bash
   npm run dev
   ```

---

## Development Workflow

```
main ──────────────●──────────────●──────────► (protected, production)
                  ╱                ╲
              merge              merge
              ╱                      ╲
   feat/route-planner          fix/alert-spam
   ●──●──●                      ●──●
```

1. Create a **feature branch** from `main`
2. Make focused, atomic commits
3. Push & open a **Pull Request** targeting `main`
4. Address review feedback
5. Squash-merge once approved & CI passes

---

## Branching Strategy

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New feature | `feat/manual-conflict-override` |
| `fix/` | Bug fix | `fix/sparkline-overflow` |
| `refactor/` | Code restructure (no behavior change) | `refactor/extract-ai-hooks` |
| `docs/` | Documentation only | `docs/update-architecture-diagram` |
| `chore/` | Tooling, deps, configs | `chore/upgrade-vite-5` |
| `test/` | Test additions | `test/conflict-resolver-cases` |

---

## Commit Convention

We follow **[Conventional Commits](https://www.conventionalcommits.org)**:

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Examples

```bash
feat(ai-engine): add Dijkstra fallback when A* fails
fix(alerts): de-duplicate maintenance notifications
refactor(simulation): extract tick reducer into pure function
docs(readme): update architecture diagram
chore(deps): bump framer-motion to 11.x
test(conflict-resolver): cover head-on collision case
```

### Allowed Types
`feat` · `fix` · `docs` · `style` · `refactor` · `perf` · `test` · `chore` · `ci` · `build` · `revert`

---

## Pull Request Process

1. **Title** — Use a Conventional Commit-style title
2. **Description** — Fill out the PR template (what, why, screenshots if UI)
3. **Link issues** — Reference with `Closes #123` or `Refs #456`
4. **Self-review** — Walk through your own diff before requesting review
5. **CI must pass** — Lint, typecheck, tests, build
6. **At least 1 approval** required for merge
7. **Squash-merge** — Keeps history linear

### Pre-submission Checklist

- [ ] Code follows the project's style (run `npm run lint`)
- [ ] TypeScript compiles with no errors (`tsc --noEmit`)
- [ ] Tests added/updated and passing (`npm run test`)
- [ ] No `console.log` or commented-out code left behind
- [ ] Documentation updated (README / inline JSDoc) if behavior changed
- [ ] Screenshots attached for UI changes
- [ ] No secrets or hardcoded credentials committed

---

## Coding Standards

### TypeScript
- **Strict mode** — no `any` without a `// eslint-disable-next-line` justification
- **Explicit return types** on exported functions
- Prefer **`type`** over `interface` for unions, **`interface`** for object shapes

### React
- **Functional components only** — no class components
- **Hooks** for state and side effects
- **Memoization** (`useMemo` / `useCallback`) only when profiling shows benefit
- **One component per file**, named export matching the filename

### Styling
- ✅ Use **semantic Tailwind tokens** from `index.css` and `tailwind.config.ts`
- ❌ Never hardcode colors like `text-white` or `bg-[#3b82f6]`
- All colors must be **HSL**
- Use `cn()` helper from `lib/utils.ts` for conditional classes

### File Organization
```
src/
├── components/
│   ├── dashboard/    # Domain-specific panels
│   └── ui/           # Reusable shadcn primitives
├── hooks/            # Custom React hooks
├── lib/              # Pure logic, types, data
└── pages/            # Route-level components
```

### Naming
- **Components** — `PascalCase.tsx`
- **Hooks** — `use-kebab-case.ts`
- **Utilities** — `kebab-case.ts`
- **Types** — `PascalCase`, suffix with intent (`TrainStatus`, `AlertSeverity`)

---

## Testing

### Unit Tests (Vitest)
```bash
npm run test            # Run once
npm run test -- --watch # Watch mode
```

- Place alongside source: `foo.ts` → `foo.test.ts`
- Cover **pure functions** in `lib/` thoroughly
- Mock React state for hook tests

### E2E Tests (Playwright)
```bash
npx playwright test
```

- Cover critical user flows (dashboard loads, simulation runs, conflict resolves)
- Run against local dev server

---

## Questions?

Open a [Discussion](../../discussions) or reach out via [Issues](../../issues).

Happy contributing! 🚆

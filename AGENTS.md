# CLAUDE.md

Personal shared configuration library (`@prb/devkit`). Provides reusable Biome, Prettier, TypeScript, Vitest, and Just
configs, plus GitHub Actions.

## Project Structure

```
biome/          Biome v2 configs (base.jsonc, ui.jsonc)
just/           Just recipe modules (base, csv, npm, settings, vercel)
tsconfig/       TypeScript presets (base, build, next)
vitest/         Vitest config factory (base.js)
actions/        GitHub Actions (setup, node-cache)
vscode/         Shared VSCode settings
tests/          BATS tests for CSV/TSV validation
```

## Package Exports

```
@prb/devkit/biome       → biome/base.jsonc
@prb/devkit/biome/base  → biome/base.jsonc
@prb/devkit/biome/ui    → biome/ui.jsonc
@prb/devkit/prettier    → .prettierrc.js
@prb/devkit/tsconfig/*  → tsconfig/{base,build,next}.json
@prb/devkit/vitest      → vitest/base.js
```

## Commands

```bash
just full-check      # Run all checks (prettier, biome, shell)
just full-write      # Run all fixes
just shell-check     # ShellCheck + shfmt
just test            # Run all BATS tests
just test-csv        # Run CSV validation tests
just test-tsv        # Run TSV validation tests
```

## Tech Stack

- **Node.js** >= 20 (ESM)
- **Biome** v2 for linting/formatting JS/TS/JSON
- **Prettier** for Markdown, YAML
- **Just** as task runner
- **BATS** for shell testing
- **ShellCheck** + **shfmt** for shell script quality

## Conventions

- ESM-only (`"type": "module"` in package.json)
- Prettier config: `printWidth: 120`, `trailingComma: "all"`
- Biome formatter: `indentStyle: "space"`, `lineWidth: 100`
- Biome linting: recommended rules with customizations (see `biome/base.jsonc`)
- Just settings: `bash -euo pipefail`, `unstable` mode enabled
- Vitest factory (`defineDevkitConfig`) provides CI-aware defaults (retry, timeout, reporters)
- After modifying Markdown files, run `just prettier-write` to format them
- After modifying `just/csv.just`, run `just test` to verify the BATS tests pass

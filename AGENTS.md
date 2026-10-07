# AGENTS.md

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
tests/          BATS CSV/TSV, Python Vercel helper, and packed-package Vitest compatibility tests
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
just test            # Run BATS, Vercel helper, and Vitest compatibility tests
just test-vitest     # Test the packed package against Vitest 4 and 5
just test-vercel     # Test Vercel deployment URL capture
just test-csv        # Run CSV validation tests
just test-tsv        # Run TSV validation tests
```

## Releases

- npm publishing runs only in `.github/workflows/release.yml` through npm trusted publishing in staged mode. Never run
  `npm publish`, `npm stage approve`, or `npm stage reject` locally. The `publish` recipes in `just/npm.just` are for
  consumer repositories, not for this package.
- To ship: bump the version and changelog, commit, create the annotated tag `vX.Y.Z` (prerelease: `vX.Y.Z-beta.N`), push
  the commit, then run `git push origin <tag>`.
- CI stages the version. It stays unpublished until the maintainer approves it with 2FA on npmjs.com (Staged Packages)
  or `npm stage approve <stage-id>`. Prereleases use their identifier as the dist-tag.
- Setup, once: `npm trust github @prb/devkit --repo PaulRBerg/devkit --file release.yml --allow-stage-publish -y`

## Tech Stack

- **Node.js** >= 20 (ESM)
- **Biome** v2 for linting/formatting JS/TS/JSON
- **Prettier** for Markdown, YAML
- **Just** >= 1.55.0 as task runner (setup action pins 1.58.0)
- **BATS** for shell testing
- **ShellCheck** + **shfmt** for shell script quality

## Conventions

- ESM-only (`"type": "module"` in package.json)
- Prettier config: `printWidth: 120`, `trailingComma: "all"`
- Biome formatter: `indentStyle: "space"`, `lineWidth: 100`
- Biome linting: recommended rules with customizations (see `biome/base.jsonc`)
- Just settings: `bash -euo pipefail`, `unstable` mode enabled
- Vitest factory (`defineDevkitConfig`) provides CI-aware defaults (retry, timeout, reporters)
- After changing the Vitest factory or its package exports, run `just test-vitest`. It requires Node.js >= 22.12 and npm
  registry access, installs pinned Vitest 4/5 consumers in temporary directories, and tests the packed package.
- After modifying Markdown files, run `just prettier-write` to format them
- After modifying `just/csv.just`, run `just test` to verify the BATS tests pass

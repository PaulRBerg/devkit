# 🛠️ Devkit

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm](https://img.shields.io/npm/v/@prb/devkit)](https://www.npmjs.com/package/@prb/devkit)

Personal configuration files and reusable scripts. Designed to be extended and customized as needed.

## 📦 Installation

```bash
npm install @prb/devkit
```

Or with other package managers:

```bash
pnpm add @prb/devkit
bun add @prb/devkit
```

## 🚀 Usage

### Biome

Extend the base Biome configuration in your `biome.jsonc`:

```jsonc
{
  "$schema": "https://biomejs.dev/schemas/latest/schema.json",
  "extends": ["@prb/devkit/biome"],
}
```

For UI projects, use the UI variant:

```jsonc
{
  "extends": ["@prb/devkit/biome/ui"],
}
```

### Prettier

Reference the Prettier config in your `package.json`:

```json
{
  "prettier": "@prb/devkit/prettier"
}
```

### TypeScript

Extend TSConfig presets in your `tsconfig.json`:

```json
{
  "extends": "@prb/devkit/tsconfig/base"
}
```

Available presets:

- `@prb/devkit/tsconfig/base` — Base TypeScript configuration
- `@prb/devkit/tsconfig/build` — Build-optimized configuration
- `@prb/devkit/tsconfig/next` — Next.js configuration

### Vitest

Use the devkit vitest config factory in your `vitest.config.ts`:

```typescript
import { defineDevkitConfig } from "@prb/devkit/vitest";

export default defineDevkitConfig({
  environment: "jsdom", // or "node" (default), "happy-dom"
  setupFiles: ["./tests/setup.ts"],
  coverage: true,
});
```

The config provides CI-aware defaults:

- `globals: true`
- `retry: 2` in CI, `0` locally
- `testTimeout: 30s` in CI, `10s` locally
- `reporters: ["basic"]` in CI, `["verbose"]` locally

For merging with existing Vite configs:

```typescript
import { defineDevkitConfig, mergeConfig } from "@prb/devkit/vitest";
import { defineConfig } from "vitest/config";

export default mergeConfig(
  defineDevkitConfig({ environment: "jsdom" }),
  defineConfig({
    test: {
      alias: { "@": "./src" },
    },
  }),
);
```

### Just

Import Just recipes in your `justfile`:

```just
import "@prb/devkit/just/base.just"
import "@prb/devkit/just/npm.just"
```

Available modules:

| Module          | Description                     |
| --------------- | ------------------------------- |
| `base.just`     | Common development recipes      |
| `csv.just`      | CSV/TSV validation with qsv     |
| `npm.just`      | NPM package management          |
| `settings.just` | Just settings and configuration |
| `vercel.just`   | Vercel build and deploy         |

## ⚙️ Available Configs

| Tool        | Config File/Directory                    |
| ----------- | ---------------------------------------- |
| 🔍 Biome    | [`biome/`](./biome/)                     |
| 🛠 Just     | [`just/`](./just/)                       |
| ✨ Prettier | [`.prettierrc.json`](./.prettierrc.json) |
| 📦 TSConfig | [`tsconfig/`](./tsconfig/)               |
| 🧪 Vitest   | [`vitest/`](./vitest/)                   |
| 💻 VSCode   | [`vscode/`](./vscode/)                   |

## 🐈‍⬛ GitHub Actions

Reusable composite actions for GitHub CI workflows.

| Action                                        | Description                                |
| --------------------------------------------- | ------------------------------------------ |
| [`actions/setup`](./actions/setup/)           | Install dependencies (Node.js, Just, etc.) |
| [`actions/node-cache`](./actions/node-cache/) | Cache Node.js dependencies                 |

```yaml
- uses: PaulRBerg/devkit/actions/setup@v1
```

Dependency caching stores only the package-manager cache, not `node_modules`. Set `save-cache: true` in at most one
parallel job to publish a refreshed cache.

## 🍴 Fork

This repository is a fork of [`sablier-labs/devkit`](https://github.com/sablier-labs/devkit), reset to `v1.0.0` under
the `@prb/devkit` name. For the change history prior to this fork, see the
[upstream `CHANGELOG.md`](https://github.com/sablier-labs/devkit/blob/main/CHANGELOG.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under MIT — see the [LICENSE](LICENSE.md) file for details.

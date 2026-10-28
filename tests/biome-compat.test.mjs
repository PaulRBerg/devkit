import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "devkit-biome-"));
after(() => rmSync(temporary, { force: true, recursive: true }));

function run(command, args, cwd, expectedStatus = 0) {
  const result = spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    maxBuffer: 2 * 1024 * 1024,
    stdio: ["ignore", "pipe", "pipe"],
    timeout: 120_000,
  });
  assert.ifError(result.error);
  assert.equal(
    result.status,
    expectedStatus,
    `${command} ${args.join(" ")}\n${result.stdout}\n${result.stderr}`,
  );
  return `${result.stdout}${result.stderr}`;
}

const [packed] = JSON.parse(
  run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", temporary], repository),
);
const consumer = join(temporary, "consumer");
mkdirSync(consumer);
writeFileSync(
  join(consumer, "package.json"),
  JSON.stringify({
    private: true,
    type: "module",
    dependencies: {
      "@biomejs/biome": "2.6.2",
      "@prb/devkit": `file:${join(temporary, packed.filename)}`,
      ultracite: "8.1.0",
    },
  }),
);
run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);

const classes = "text-red-500 flex text-sm";
const uiSource = `export function Counter({ onIncrement }: { onIncrement: () => void }) {
  const handleClick = () => {
    onIncrement();
  };
  return (
    <button className="${classes}" onClick={handleClick} type="button">
      Increment
    </button>
  );
}
`;

function biome(args, expectedStatus = 0) {
  return run(
    process.execPath,
    ["node_modules/@biomejs/biome/bin/biome", ...args],
    consumer,
    expectedStatus,
  );
}

for (const scenario of [
  { devkit: "@prb/devkit/biome", name: "base export", ultracite: ["core"] },
  { devkit: "@prb/devkit/biome/base", name: "base alias", ultracite: ["core"] },
  { name: "UI", ultracite: ["core", "react"] },
  { name: "Next", ultracite: ["core", "react", "next"] },
]) {
  test(`packed Devkit ${scenario.name} composes with Biome 2.6.2 and Ultracite 8.1.0`, () => {
    const ui = scenario.devkit === undefined;
    writeFileSync(
      join(consumer, "biome.json"),
      JSON.stringify({
        files: { includes: ["**/*.{tsx,ts,md,yaml}"] },
        vcs: { enabled: false },
        extends: [
          ...scenario.ultracite.map((preset) => `ultracite/biome/${preset}`),
          scenario.devkit ?? "@prb/devkit/biome/base",
          ...(ui ? ["@prb/devkit/biome/ui"] : []),
        ],
      }),
    );
    const source = join(consumer, "counter.tsx");
    writeFileSync(source, ui ? uiSource : "export const count = 1;\n");
    const markdown = join(consumer, "example.md");
    const yaml = join(consumer, "example.yaml");
    const markdownSource = '# Example\n\n```json\n{"enabled":true}\n```\n';
    const yamlSource = "items: [one,two]\n";
    writeFileSync(markdown, markdownSource);
    writeFileSync(yaml, yamlSource);
    biome(["check", "--write", "--unsafe", source, markdown, yaml]);
    biome(["check", source, markdown, yaml]);
    assert.equal(readFileSync(markdown, "utf8"), markdownSource);
    assert.equal(readFileSync(yaml, "utf8"), yamlSource);
    if (ui) assert.ok(readFileSync(source, "utf8").includes(`className="${classes}"`));

    writeFileSync(source, "const unused = 1;\nexport const count = 1;\n");
    const diagnostics = biome(["lint", source], 1);
    assert.match(diagnostics, /lint\/correctness\/noUnusedVariables/);
    if (ui) {
      writeFileSync(
        source,
        `import { useState } from "react";
export function Broken({ ready }: { ready: boolean }) {
  if (ready) return useState(0)[0];
  return 0;
}
`,
      );
      assert.match(biome(["lint", source], 1), /lint\/correctness\/useHookAtTopLevel/);
    }
  });
}

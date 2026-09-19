import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, test } from "node:test";
import { fileURLToPath } from "node:url";

const repository = fileURLToPath(new URL("../", import.meta.url));
const fixtures = fileURLToPath(new URL("./fixtures/vitest/", import.meta.url));
const temporary = mkdtempSync(join(tmpdir(), "devkit-vitest-"));
after(() => rmSync(temporary, { force: true, recursive: true }));

function run(command, args, cwd, env = process.env) {
  try {
    return execFileSync(command, args, {
      cwd,
      encoding: "utf8",
      env,
      maxBuffer: 2 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
      timeout: 120_000,
    });
  } catch (error) {
    throw new Error(
      `${command} ${args.join(" ")} failed\n${error.stdout ?? ""}\n${error.stderr ?? ""}`,
    );
  }
}

const [packed] = JSON.parse(
  run("npm", ["pack", "--ignore-scripts", "--json", "--pack-destination", temporary], repository),
);

for (const version of ["4.1.11", "5.0.0"]) {
  test(`packed Devkit works with Vitest ${version}`, async (context) => {
    const consumer = join(temporary, version);
    mkdirSync(consumer);
    cpSync(fixtures, consumer, { recursive: true });
    writeFileSync(
      join(consumer, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: {
          "@prb/devkit": `file:${join(temporary, packed.filename)}`,
          "@vitest/coverage-v8": version,
          vitest: version,
        },
      }),
    );
    run("npm", ["install", "--ignore-scripts", "--no-audit", "--no-fund"], consumer);

    for (const scenario of [
      { ci: "", coverage: "", name: "local defaults" },
      { ci: "", coverage: "false", name: "coverage explicitly disabled" },
      { ci: "1", coverage: "true", name: "CI reporter" },
      { ci: "", coverage: "true", name: "V8 coverage" },
    ]) {
      await context.test(scenario.name, () => {
        const env = {
          ...process.env,
          CI: scenario.ci,
          DEVKIT_TEST_COVERAGE: scenario.coverage,
          NO_COLOR: "1",
        };
        delete env.FORCE_COLOR;
        const args = ["node_modules/vitest/vitest.mjs", "run", "--config", "vitest.config.mjs"];
        if (scenario.coverage === "true") args.push("--coverage");
        run(process.execPath, args, consumer, env);
        if (scenario.coverage === "true") {
          const coverage = JSON.parse(
            readFileSync(join(consumer, "coverage/coverage-final.json"), "utf8"),
          );
          assert.ok(Object.keys(coverage).some((file) => file.endsWith("/sum.js")));
        }
      });
    }
  });
}

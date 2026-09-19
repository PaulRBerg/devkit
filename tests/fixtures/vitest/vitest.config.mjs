import { defineDevkitConfig, mergeConfig } from "@prb/devkit/vitest";

const options = { setupFiles: ["./setup.js"] };
if (process.env.DEVKIT_TEST_COVERAGE) {
  options.coverage = process.env.DEVKIT_TEST_COVERAGE === "true";
}

export default mergeConfig(defineDevkitConfig(options), {
  test: {
    include: ["smoke.test.js"],
    ...(options.coverage ? { coverage: { reporter: ["json"] } } : {}),
  },
});

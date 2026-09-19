import { defineConfig, mergeConfig } from "vitest/config";

/**
 * @typedef {Object} DevkitVitestOptions
 * @property {"node" | "jsdom" | "happy-dom"} [environment]
 * @property {string[]} [setupFiles]
 * @property {boolean} [coverage]
 */

/**
 * @param {DevkitVitestOptions} [options]
 */
export function defineDevkitConfig(options = {}) {
  const isCI = Boolean(process.env.CI);

  const baseConfig = {
    test: {
      ...(options.coverage ? { coverage: { provider: "v8" } } : {}),
      environment: options.environment ?? "node",
      globals: true,
      reporters: isCI ? ["default"] : ["verbose"],
      retry: isCI ? 2 : 0,
      ...(options.setupFiles ? { setupFiles: options.setupFiles } : {}),
      testTimeout: isCI ? 30_000 : 10_000,
    },
  };

  return defineConfig(baseConfig);
}

// Re-export for merging with existing vite configs
export { mergeConfig };

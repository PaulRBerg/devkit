import { expect, test } from "vitest";
import { sum } from "./sum.js";

test("the consumer runs with its setup file and Devkit globals", () => {
  expect(globalThis.devkitSetupLoaded).toBe(true);
  expect(globalThis.expect).toBe(expect);
  expect(sum(2, 3)).toBe(5);
});

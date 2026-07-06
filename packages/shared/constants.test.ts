import { describe, expect, it } from "vitest";
import {
  APP_ADDRESS,
  APP_DOMAIN,
  APP_NAME,
  APP_SLUG,
} from "./constants.js";

describe("@packages/shared constants", () => {
  it("exports APP_NAME as a non-empty string", () => {
    expect(typeof APP_NAME).toBe("string");
    expect(APP_NAME.length).toBeGreaterThan(0);
  });

  it("exports APP_ADDRESS as a non-empty string", () => {
    expect(typeof APP_ADDRESS).toBe("string");
    expect(APP_ADDRESS.length).toBeGreaterThan(0);
  });

  it("exports APP_DOMAIN as a non-empty string", () => {
    expect(typeof APP_DOMAIN).toBe("string");
    expect(APP_DOMAIN.length).toBeGreaterThan(0);
  });

  it("exports APP_SLUG as a non-empty string", () => {
    expect(typeof APP_SLUG).toBe("string");
    expect(APP_SLUG.length).toBeGreaterThan(0);
  });
});

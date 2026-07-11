import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { CATEGORY_CHIPS, CATEGORY_CHIP_BY_KEY } from "./categories";

describe("CATEGORY_CHIPS", () => {
  it("exposes the Todos filter plus the eight chip categories in order", () => {
    expect(CATEGORY_CHIPS.map((c) => c.key)).toEqual([
      "todos",
      "comida",
      "mascotas",
      "belleza",
      "salud",
      "ropa",
      "hogar",
      "tecnologia",
      "otro",
    ]);
  });

  it("binds each real chip to its canonical Spanish Commerce category, and Todos to none", () => {
    expect(CATEGORY_CHIP_BY_KEY.todos.category).toBeNull();
    expect(CATEGORY_CHIP_BY_KEY.comida.category).toBe("Comida y bebida");
    expect(CATEGORY_CHIP_BY_KEY.belleza.category).toBe("Belleza y cuidado personal");
    expect(CATEGORY_CHIP_BY_KEY.ropa.category).toBe("Accesorios y ropa");
    expect(CATEGORY_CHIP_BY_KEY.hogar.category).toBe("Hogar y artesanías");
    expect(CATEGORY_CHIP_BY_KEY.tecnologia.category).toBe("Tecnología");
  });

  it("points each chip at its light/navy icon pair", () => {
    for (const chip of CATEGORY_CHIPS) {
      expect(chip.icon).toEqual({
        light: `/categories/${chip.key}-light.png`,
        navy: `/categories/${chip.key}-navy.png`,
      });
    }
  });

  it("ships both delivered PNGs in public/ for every chip", () => {
    // Vitest runs with the app as cwd, so public/ resolves from there.
    const publicDir = path.resolve(process.cwd(), "public");
    for (const chip of CATEGORY_CHIPS) {
      expect(existsSync(path.join(publicDir, chip.icon.light))).toBe(true);
      expect(existsSync(path.join(publicDir, chip.icon.navy))).toBe(true);
    }
  });
});

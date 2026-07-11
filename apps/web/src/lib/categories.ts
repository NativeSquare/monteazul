import {
  CATEGORY_CHIP_TOKENS,
  TODOS_CHIP,
  type CommerceCategory,
} from "@packages/shared/categories";

/**
 * Category filter chips for the Monteazul directory.
 *
 * The short-label tokens are the single source of truth in `@packages/shared`
 * (derived from `docs/product/design.md`); this module only adds what is
 * web-specific: the delivered icon pair per chip (light = resting, navy =
 * selected — PNGs under `public/categories/`) and the "Todos" filter. Only the
 * categories with a chip token appear as chips — `Inmuebles y servicios` is a
 * valid Commerce category but renders only as a list section (no filter chip).
 */
export type CategoryKey =
  | "todos"
  | "comida"
  | "mascotas"
  | "belleza"
  | "salud"
  | "ropa"
  | "hogar"
  | "tecnologia"
  | "otro";

export type CategoryChip = {
  key: CategoryKey;
  /** Short label rendered under the chip icon (matches the prototype). */
  label: string;
  /** Canonical Spanish Commerce category, or null for the "Todos" filter. */
  category: CommerceCategory | null;
  /** Delivered icon pair: `light` when resting, `navy` when selected. */
  icon: { light: string; navy: string };
};

const CHIP_DEFS: {
  key: CategoryKey;
  category: CommerceCategory | null;
}[] = [
  { key: "todos", category: null },
  { key: "comida", category: "Comida y bebida" },
  { key: "mascotas", category: "Mascotas" },
  { key: "belleza", category: "Belleza y cuidado personal" },
  { key: "salud", category: "Salud y bienestar" },
  { key: "ropa", category: "Accesorios y ropa" },
  { key: "hogar", category: "Hogar y artesanías" },
  { key: "tecnologia", category: "Tecnología" },
  { key: "otro", category: "Otro" },
];

export const CATEGORY_CHIPS: readonly CategoryChip[] = CHIP_DEFS.map(
  ({ key, category }) => {
    const token =
      category === null ? TODOS_CHIP : CATEGORY_CHIP_TOKENS[category];
    if (!token) {
      throw new Error(`Missing chip token for category: ${category}`);
    }
    return {
      key,
      category,
      label: token.label,
      icon: {
        light: `/categories/${key}-light.png`,
        navy: `/categories/${key}-navy.png`,
      },
    };
  },
);

export const CATEGORY_CHIP_BY_KEY = Object.fromEntries(
  CATEGORY_CHIPS.map((chip) => [chip.key, chip]),
) as Record<CategoryKey, CategoryChip>;

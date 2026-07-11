// @ts-check
/**
 * Canonical Commerce taxonomy for the Monteazul directory — the single source
 * of truth shared by the Convex backend (schema validation, seed) and the web
 * app (filter chips, section grouping).
 *
 * Category and sub-category labels are the EXACT Spanish values of the Notion
 * base, per `docs/product/annuaire-spec.md` §3. Chip colours/pastels/short
 * labels come from `docs/product/design.md` (and the Claude Design prototype).
 *
 * Note — the prototype documented chip tokens for seven categories only.
 * `Otro` gained a neutral token later at the product owner's request
 * (correcciones ronda 2 #2). `Inmuebles y servicios` still has no token and
 * appears only as a list section, never as a coloured filter chip.
 */

/** The nine canonical Commerce categories, in display order. */
export const COMMERCE_CATEGORIES = [
  "Comida y bebida",
  "Mascotas",
  "Belleza y cuidado personal",
  "Salud y bienestar",
  "Accesorios y ropa",
  "Hogar y artesanías",
  "Tecnología",
  "Inmuebles y servicios",
  "Otro",
];

/** The only category that may carry sub-categories. */
export const COMIDA_CATEGORY = "Comida y bebida";

/** The seven `Comida y bebida` sub-categories (multi-select), in order. */
export const COMIDA_SUBCATEGORIES = [
  "Almuerzos y comida típica",
  "Panadería y repostería",
  "Carnes y embutidos",
  "Frutas y mercado",
  "Snacks y saludables",
  "Helados y postres",
  "Otros",
];

/** Chip design token for the "Todos" filter (not a Commerce category). */
export const TODOS_CHIP = {
  label: "Todos",
  color: "#1C2E4A",
  pastel: "#EEF1F6",
};

/**
 * Chip design tokens per Commerce category, keyed by the exact category value.
 * Only the seven categories documented in `docs/product/design.md` are present.
 */
export const CATEGORY_CHIP_TOKENS = {
  "Comida y bebida": { label: "Comida", color: "#E07B39", pastel: "#FBEEE3" },
  Mascotas: { label: "Mascotas", color: "#0E9E8E", pastel: "#E0F2EF" },
  "Belleza y cuidado personal": {
    label: "Belleza",
    color: "#C85BA0",
    pastel: "#F7E7F1",
  },
  "Salud y bienestar": { label: "Salud", color: "#2E9E5B", pastel: "#E4F4EA" },
  "Accesorios y ropa": { label: "Ropa", color: "#5B62D6", pastel: "#E8E9FB" },
  "Hogar y artesanías": { label: "Hogar", color: "#C2922B", pastel: "#F6EEDA" },
  Tecnología: { label: "Tecnología", color: "#3D7FD1", pastel: "#E4EEFA" },
  Otro: { label: "Otros", color: "#64748B", pastel: "#EEF1F4" },
};

/** True when the category may carry `Comida y bebida` sub-categories. */
export function isComidaCategory(category) {
  return category === COMIDA_CATEGORY;
}

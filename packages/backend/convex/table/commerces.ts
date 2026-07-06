import {
  COMMERCE_CATEGORIES,
  type CommerceCategory,
} from "@packages/shared/categories";
import { defineTable } from "convex/server";
import { v } from "convex/values";
import { query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  categoryValidator,
  estadoValidator,
  horarioValidator,
  normalizeForSearch,
  residesValidator,
} from "../lib/commerce";

/**
 * Commerce — the central entity of the directory (see CONTEXT.md). Always owned
 * by exactly one account (`ownerId`). Internal fields (`resides`, `notas`,
 * `estado`, `ownerId`) are admin-only and never surfaced by public queries.
 */
const documentSchema = {
  name: v.string(),
  category: categoryValidator,
  // Sub-categories are only valid for "Comida y bebida" — enforced by
  // `assertValidCommerce` (a schema validator cannot express the dependency).
  subcategories: v.optional(v.array(v.string())),
  description: v.string(),
  whatsapp: v.string(), // 10 digits, no +57
  photos: v.array(v.id("_storage")), // ordered
  horario: v.optional(horarioValidator),
  torreApto: v.optional(v.string()),
  instagram: v.optional(v.string()),
  contactName: v.optional(v.string()),
  // Accent- and case-insensitive full-text haystack (name + category +
  // sub-categories + description), normalised via `commerceSearchText` and
  // recomputed on every write. Backs the `search_text` index — Convex has no
  // native accent folding, so search happens on this normalised field.
  searchText: v.string(),
  // Internal, admin-only:
  resides: residesValidator,
  notas: v.optional(v.string()),
  estado: estadoValidator,
  ownerId: v.id("users"),
};

export const commerces = defineTable(documentSchema)
  .index("by_estado", ["estado"])
  .index("by_category", ["category"])
  .index("by_owner", ["ownerId"])
  .searchIndex("search_text", {
    searchField: "searchText",
    filterFields: ["estado", "category"],
  });

/** Public projection of a Commerce — strips every internal, admin-only field. */
async function toPublicCommerce(ctx: QueryCtx, doc: Doc<"commerces">) {
  const photos = (
    await Promise.all(doc.photos.map((id) => ctx.storage.getUrl(id)))
  ).filter((url): url is string => url !== null);

  return {
    _id: doc._id,
    _creationTime: doc._creationTime,
    name: doc.name,
    category: doc.category,
    subcategories: doc.subcategories,
    description: doc.description,
    whatsapp: doc.whatsapp,
    photos,
    horario: doc.horario,
    torreApto: doc.torreApto,
    instagram: doc.instagram,
    contactName: doc.contactName,
  };
}

/**
 * Fetch the `publicado` Commerces matching an optional accent-insensitive
 * search query and/or category, then project and group them by category in the
 * canonical taxonomy order. Shared by the plain listing and the search query so
 * both apply the exact same `publicado`-only, internal-fields-stripped rules.
 *
 * - With a search query: uses the `search_text` index over the normalised
 *   field (accent- and case-insensitive, matching name / category /
 *   sub-category / description words), filtered to `publicado` (+ category).
 * - Without: uses the category or estado index directly.
 */
async function collectPublicSections(
  ctx: QueryCtx,
  opts: { text?: string; category?: CommerceCategory },
) {
  const normalized = normalizeForSearch(opts.text ?? "").trim();
  const category = opts.category ?? null;

  let published: Doc<"commerces">[];
  if (normalized.length > 0) {
    published = await ctx.db
      .query("commerces")
      .withSearchIndex("search_text", (q) => {
        const search = q
          .search("searchText", normalized)
          .eq("estado", "publicado");
        return category ? search.eq("category", category) : search;
      })
      .collect();
  } else if (category) {
    published = await ctx.db
      .query("commerces")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("estado"), "publicado"))
      .collect();
  } else {
    published = await ctx.db
      .query("commerces")
      .withIndex("by_estado", (q) => q.eq("estado", "publicado"))
      .collect();
  }

  const sections = [];
  for (const cat of COMMERCE_CATEGORIES) {
    const inCategory = published.filter((doc) => doc.category === cat);
    if (inCategory.length === 0) continue;
    const commercesInCategory = await Promise.all(
      inCategory.map((doc) => toPublicCommerce(ctx, doc)),
    );
    sections.push({
      category: cat,
      count: commercesInCategory.length,
      commerces: commercesInCategory,
    });
  }
  return sections;
}

/**
 * Public annuaire listing: publicado Commerces grouped by category, in the
 * canonical taxonomy order. Never returns `pendiente` nor `suspendido` fiches,
 * and never leaks internal fields.
 */
export const listPublicByCategory = query({
  args: {},
  handler: (ctx) => collectPublicSections(ctx, {}),
});

/**
 * Public annuaire search: same grouped, publicado-only projection as
 * `listPublicByCategory`, narrowed by an accent- and case-insensitive text
 * query and/or the active category chip. Both filters combine.
 */
export const searchPublic = query({
  args: {
    text: v.optional(v.string()),
    category: v.optional(categoryValidator),
  },
  handler: (ctx, args) =>
    collectPublicSections(ctx, { text: args.text, category: args.category }),
});

import { getAuthUserId } from "@convex-dev/auth/server";
import {
  COMIDA_CATEGORY,
  COMIDA_SUBCATEGORIES,
  COMMERCE_CATEGORIES,
  type CommerceCategory,
} from "@packages/shared/categories";
import { defineTable } from "convex/server";
import { ConvexError, v } from "convex/values";
import { mutation, query } from "../_generated/server";
import type { Doc } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import {
  RESIDES_VALUES,
  type ResidesValue,
  assertValidCommerce,
  categoryValidator,
  commerceSearchText,
  estadoValidator,
  horarioValidator,
  normalizeForSearch,
  residesValidator,
} from "../lib/commerce";
import { requireAuthenticated } from "../rbac";

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

/**
 * Resolve a Commerce's ordered storage photo ids to their public URLs, dropping
 * any that no longer resolve. Shared by every Commerce projection.
 */
async function resolvePhotoUrls(
  ctx: QueryCtx,
  ids: Doc<"commerces">["photos"],
): Promise<string[]> {
  const urls = await Promise.all(ids.map((id) => ctx.storage.getUrl(id)));
  return urls.filter((url): url is string => url !== null);
}

/**
 * Public projection of a Commerce — strips every internal, admin-only field.
 * Exported so other public surfaces (e.g. « Mis guardados » in `favorites`)
 * expose the exact same internal-fields-stripped shape.
 */
export async function toPublicCommerce(ctx: QueryCtx, doc: Doc<"commerces">) {
  const photos = await resolvePhotoUrls(ctx, doc.photos);

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
 * search query and/or category, picking the narrowest index available:
 *
 * - With a search query: the `search_text` index over the normalised field
 *   (accent- and case-insensitive, matching name / category / sub-category /
 *   description words), filtered to `publicado` (+ category when set).
 * - Category only: the `by_category` index, filtered to `publicado`.
 * - Neither: the `by_estado` index.
 */
async function fetchPublished(
  ctx: QueryCtx,
  opts: { text?: string; category?: CommerceCategory },
): Promise<Doc<"commerces">[]> {
  const normalized = normalizeForSearch(opts.text ?? "").trim();
  const category = opts.category ?? null;

  if (normalized.length > 0) {
    return ctx.db
      .query("commerces")
      .withSearchIndex("search_text", (q) => {
        const search = q
          .search("searchText", normalized)
          .eq("estado", "publicado");
        return category ? search.eq("category", category) : search;
      })
      .collect();
  }
  if (category) {
    return ctx.db
      .query("commerces")
      .withIndex("by_category", (q) => q.eq("category", category))
      .filter((q) => q.eq(q.field("estado"), "publicado"))
      .collect();
  }
  return ctx.db
    .query("commerces")
    .withIndex("by_estado", (q) => q.eq("estado", "publicado"))
    .collect();
}

/**
 * Project the given Commerces to their public shape and group them by category
 * in the canonical taxonomy order, dropping empty categories. Shared by the
 * plain listing and the search query so both expose the exact same
 * internal-fields-stripped, canonically-ordered sections.
 */
async function groupByCategory(ctx: QueryCtx, docs: Doc<"commerces">[]) {
  const sections = [];
  for (const category of COMMERCE_CATEGORIES) {
    const inCategory = docs.filter((doc) => doc.category === category);
    if (inCategory.length === 0) continue;
    const commercesInCategory = await Promise.all(
      inCategory.map((doc) => toPublicCommerce(ctx, doc)),
    );
    sections.push({
      category,
      count: commercesInCategory.length,
      commerces: commercesInCategory,
    });
  }
  return sections;
}

/** Fetch + group the public sections for an optional query and/or category. */
async function collectPublicSections(
  ctx: QueryCtx,
  opts: { text?: string; category?: CommerceCategory },
) {
  return groupByCategory(ctx, await fetchPublished(ctx, opts));
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

/**
 * Public detail of a single Commerce, backing the fiche screen. Returns the
 * internal-fields-stripped projection ONLY when the fiche is `publicado`; a
 * `pendiente`/`suspendido` fiche, an unknown id, or a malformed id string all
 * return `null` so the web app renders its "no encontrado" page. Accepts a raw
 * string id (the URL param) and normalises it, so a deep link with garbage in
 * the path degrades gracefully instead of throwing. Never leaks the internal
 * fields (`resides`, `notas`, `estado`, `ownerId`).
 */
export const getPublicById = query({
  args: { id: v.string() },
  handler: async (ctx, args) => {
    const id = ctx.db.normalizeId("commerces", args.id);
    if (!id) return null;
    const doc = await ctx.db.get(id);
    if (!doc || doc.estado !== "publicado") return null;
    return toPublicCommerce(ctx, doc);
  },
});

/**
 * Owner projection of a Commerce — the fiche as its Entrepreneur sees it in
 * « Mi negocio », including the `estado` (e.g. `pendiente` = pending approval)
 * and the internal fields the owner themselves submitted (`resides`, `notas`).
 * Only ever returned to the owner (see `myCommerce`), never to the public.
 */
export async function toOwnerCommerce(ctx: QueryCtx, doc: Doc<"commerces">) {
  const photos = await resolvePhotoUrls(ctx, doc.photos);

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
    resides: doc.resides,
    notas: doc.notas,
    estado: doc.estado,
  };
}

/**
 * The « Mi negocio » query: the caller's own fiche (with its `estado`) or
 * `null`. Scoped to the caller through the `by_owner` index, so it is an
 * ownership guard by construction — a caller can only ever obtain their own
 * fiche, never another account's, and an anonymous caller gets `null`.
 */
export const myCommerce = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) return null;
    const doc = await ctx.db
      .query("commerces")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();
    if (!doc) return null;
    return toOwnerCommerce(ctx, doc);
  },
});

/**
 * Taxonomy + enum values backing the entrepreneur fiche form. Surfaced from the
 * shared constants (`@packages/shared`) and the domain enums so the back-office
 * form builds its selects from the single source of truth, without duplicating
 * the Spanish labels client-side.
 */
export const getFormOptions = query({
  args: {},
  handler: () => ({
    categories: COMMERCE_CATEGORIES,
    comidaCategory: COMIDA_CATEGORY,
    comidaSubcategories: COMIDA_SUBCATEGORIES,
    residesValues: RESIDES_VALUES,
  }),
});

/**
 * Submit the caller's fiche (back-office entrepreneur onboarding).
 *
 * Creates the Commerce in `pendiente` (invisible to the public until a Super
 * admin approves it) and grants the `entreprise` role to the account at
 * submission — approval only publishes (see CONTEXT.md). Enforces the 1:1 rule
 * (one account owns exactly one Commerce: a second submission is refused) and
 * the business-rule validation (WhatsApp exactly 10 digits, sub-categories only
 * for « Comida y bebida », ¿Resides? among the three values), surfacing a
 * Spanish `ConvexError` message the form renders inline.
 *
 * `category` and `resides` are accepted as plain strings and validated here (so
 * the back-office passes the form values as-is); once validated they match the
 * strict schema validators on insert.
 */
export const submitCommerce = mutation({
  args: {
    name: v.string(),
    category: v.string(),
    subcategories: v.optional(v.array(v.string())),
    description: v.string(),
    whatsapp: v.string(),
    horario: horarioValidator,
    torreApto: v.optional(v.string()),
    instagram: v.optional(v.string()),
    contactName: v.optional(v.string()),
    resides: v.string(),
    notas: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { userId, user } = await requireAuthenticated(ctx);

    // 1:1 strict — an account owns exactly one Commerce.
    const existing = await ctx.db
      .query("commerces")
      .withIndex("by_owner", (q) => q.eq("ownerId", userId))
      .first();
    if (existing) {
      throw new ConvexError({
        message:
          "Ya tienes un negocio registrado. Cada cuenta gestiona un solo negocio.",
      });
    }

    // Business rules a schema validator cannot express — surfaced in Spanish.
    try {
      assertValidCommerce({
        category: args.category,
        subcategories: args.subcategories,
        whatsapp: args.whatsapp,
      });
      if (!RESIDES_VALUES.includes(args.resides as ResidesValue)) {
        throw new Error("El valor de ¿Resides en Monteazul? no es válido.");
      }
    } catch (error) {
      throw new ConvexError({
        message: error instanceof Error ? error.message : "Datos inválidos.",
      });
    }

    const subcategories =
      args.subcategories && args.subcategories.length > 0
        ? args.subcategories
        : undefined;

    const commerceId = await ctx.db.insert("commerces", {
      name: args.name,
      category: args.category as CommerceCategory,
      subcategories,
      description: args.description,
      whatsapp: args.whatsapp,
      photos: [],
      horario: args.horario,
      torreApto: args.torreApto,
      instagram: args.instagram,
      contactName: args.contactName,
      searchText: commerceSearchText({
        name: args.name,
        category: args.category,
        subcategories,
        description: args.description,
      }),
      resides: args.resides as ResidesValue,
      notas: args.notas,
      estado: "pendiente",
      ownerId: userId,
    });

    // Grant the `entreprise` role at submission. Never downgrade a Super admin
    // who happens to submit a fiche.
    if (user.role !== "admin") {
      await ctx.db.patch(userId, { role: "entreprise" });
    }

    return commerceId;
  },
});

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { horarioValidator } from "../lib/commerce";
import { requireAdmin } from "../rbac";

// STUB (test-first). Real implementation lands in the `feat` commit.

export const createSeededEntreprise = mutation({
  args: {
    email: v.string(),
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
    await requireAdmin(ctx);
    return { email: args.email, password: "" };
  },
});

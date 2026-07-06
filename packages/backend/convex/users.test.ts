import { convexTest } from "convex-test";
import { expect, test } from "vitest";
import { api } from "./_generated/api";
import schema from "./schema";

// Provide glob explicitly so convex-test can locate _generated/ and all function modules.
// Pattern matches *.ts and *.js files from the convex/ root.
const modules = import.meta.glob("./**/*.*s");

test("getUserByEmail returns null when no user exists with that email", async () => {
  const t = convexTest(schema, modules);
  const result = await t.query(api.table.users.getUserByEmail, {
    email: "nonexistent@example.com",
  });
  expect(result).toBeNull();
});

test("getUserByEmail returns the user document when a matching user exists", async () => {
  const t = convexTest(schema, modules);

  // Insert a user directly via the in-memory DB
  const userId = await t.run(async (ctx) => {
    return await ctx.db.insert("users", {
      email: "test@example.com",
      name: "Test User",
    });
  });

  const result = await t.query(api.table.users.getUserByEmail, {
    email: "test@example.com",
  });

  expect(result).not.toBeNull();
  expect(result!._id).toBe(userId);
  expect(result!.email).toBe("test@example.com");
  expect(result!.name).toBe("Test User");
});

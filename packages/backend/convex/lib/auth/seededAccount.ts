import type { Id } from "../../_generated/dataModel";
import type { MutationCtx } from "../../_generated/server";
import type { Role } from "./roles";

// STUB (test-first). Real implementation lands in the `feat` commit.

export function generateStrongPassword(): string {
  return "";
}

export async function createSeededPasswordAccount(
  _ctx: MutationCtx,
  _args: { email: string; name?: string; password: string; role: Role },
): Promise<Id<"users">> {
  throw new Error("not implemented");
}

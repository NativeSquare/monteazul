import { describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";

import { ConvexReactClientFake, renderWithConvex } from "@packages/test-utils";
import { EntrepreneurGuard } from "./entrepreneur-guard";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace, push: vi.fn() }),
}));
// The guard needs an authenticated Convex session; the fake client carries no
// auth, so pin the hook (the ROLE routing below is what this suite covers).
vi.mock("convex/react", async (importOriginal) => {
  const actual = await importOriginal<typeof import("convex/react")>();
  return {
    ...actual,
    useConvexAuth: () => ({ isAuthenticated: true, isLoading: false }),
  };
});

function renderGuard(role: "admin" | "entreprise" | "user") {
  replace.mockReset();
  const client = new ConvexReactClientFake();
  client.registerQueryFake(api.table.users.currentUser, () => ({
    _id: "user_1" as unknown as Id<"users">,
    _creationTime: 0,
    email: "quien@example.com",
    role,
  }));
  return renderWithConvex(
    <EntrepreneurGuard>
      <div data-testid="entrepreneur-content" />
    </EntrepreneurGuard>,
    { client },
  );
}

describe("EntrepreneurGuard — routing by role", () => {
  it("redirects a Super admin to their panel and never renders the entrepreneur flow", async () => {
    renderGuard("admin");

    await waitFor(() => expect(replace).toHaveBeenCalledWith("/negocios"));
    expect(screen.queryByTestId("entrepreneur-content")).toBeNull();
  });

  it("renders the entrepreneur area for a non-admin account", async () => {
    renderGuard("entreprise");

    await waitFor(() =>
      expect(screen.getByTestId("entrepreneur-content")).toBeTruthy(),
    );
    expect(replace).not.toHaveBeenCalled();
  });
});

import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import type { ReactNode } from "react";

import {
  ConvexReactClientFake,
  renderWithConvex,
} from "@packages/test-utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

// NavUser (rendered when a user is logged in) depends on the Next.js app
// router and the Convex auth provider, neither of which exist in jsdom.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signOut: vi.fn(), signIn: vi.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe("AppSidebar", () => {
  it("shows the logged-in user's name and email from the currentUser query", () => {
    const client = new ConvexReactClientFake();
    client.registerQueryFake(api.table.users.currentUser, () => ({
      _id: "test_user_id" as unknown as Id<"users">,
      _creationTime: 0,
      name: "Ada Lovelace",
      email: "ada@example.com",
      image: "",
    }));

    renderWithConvex(<AppSidebar />, { client, wrapper });

    expect(screen.getByText("Ada Lovelace")).toBeDefined();
    expect(screen.getByText("ada@example.com")).toBeDefined();
  });

  it("shows a loading skeleton instead of the user menu when no user is available", () => {
    const client = new ConvexReactClientFake();
    client.registerQueryFake(api.table.users.currentUser, () => null);

    renderWithConvex(<AppSidebar />, { client, wrapper });

    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    // Static sidebar content still renders.
    expect(screen.getByText("Acme Inc.")).toBeDefined();
  });
});

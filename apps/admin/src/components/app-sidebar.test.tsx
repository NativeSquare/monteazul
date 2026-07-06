import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { api } from "@packages/backend/convex/_generated/api";
import type { Id } from "@packages/backend/convex/_generated/dataModel";
import type { ComponentProps, ReactNode } from "react";

import {
  ConvexReactClientFake,
  renderWithConvex,
} from "@packages/test-utils";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

// NavUser (rendered when an admin is logged in) depends on the Next.js app
// router and the Convex auth provider, neither of which exist in jsdom.
// AppSidebar itself reads the current pathname for nav highlighting.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/team",
}));
// next/link pulls in Next's app-router context (and a nested copy of react),
// neither of which exist in jsdom. A plain anchor is enough for these tests.
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    ...props
  }: ComponentProps<"a"> & { href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));
vi.mock("@convex-dev/auth/react", () => ({
  useAuthActions: () => ({ signOut: vi.fn(), signIn: vi.fn() }),
}));

function wrapper({ children }: { children: ReactNode }) {
  return <SidebarProvider>{children}</SidebarProvider>;
}

describe("AppSidebar", () => {
  it("shows the logged-in admin's name and email from the currentAdmin query", () => {
    const client = new ConvexReactClientFake();
    client.registerQueryFake(api.table.admin.currentAdmin, () => ({
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

  it("shows a loading skeleton instead of the user menu when no admin is available", () => {
    const client = new ConvexReactClientFake();
    client.registerQueryFake(api.table.admin.currentAdmin, () => null);

    renderWithConvex(<AppSidebar />, { client, wrapper });

    expect(screen.queryByText("Ada Lovelace")).toBeNull();
    // Static sidebar content still renders.
    expect(screen.getByText("Admin Panel")).toBeDefined();
  });
});

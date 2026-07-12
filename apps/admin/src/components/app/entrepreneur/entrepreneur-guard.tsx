"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import { Spinner } from "@/components/ui/spinner";

/**
 * Guards the entrepreneur area (« Mi negocio »). Reuses the same Convex Auth
 * session as the rest of the back-office — it requires an authenticated
 * account (an account with no fiche yet still holds the `user` role until it
 * submits). An anonymous caller is redirected to the entrepreneur login, and a
 * Super admin is redirected to THEIR panel: the admin must never see the
 * fiche registration/edition flow, whatever path routed them here.
 */
export function EntrepreneurGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();
  // `undefined` while loading; `null` when anonymous.
  const me = useQuery(api.table.users.currentUser);
  const isAdmin = me?.role === "admin";

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/acceso");
    }
  }, [isLoading, isAuthenticated, router]);

  useEffect(() => {
    if (isAdmin) {
      router.replace("/negocios");
    }
  }, [isAdmin, router]);

  // Block until the ROLE is known too — otherwise an admin would flash the
  // entrepreneur screens before the redirect kicks in.
  if (isLoading || !isAuthenticated || me === undefined || isAdmin) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}

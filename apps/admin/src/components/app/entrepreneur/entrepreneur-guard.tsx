"use client";

import { useConvexAuth } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@/components/ui/spinner";

/**
 * Guards the entrepreneur area (« Mi negocio »). Reuses the same Convex Auth
 * session as the rest of the back-office — it only requires an authenticated
 * account (an account with no fiche yet still holds the `user` role until it
 * submits). An anonymous caller is redirected to the entrepreneur login.
 */
export function EntrepreneurGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useConvexAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/acceso");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <>{children}</>;
}

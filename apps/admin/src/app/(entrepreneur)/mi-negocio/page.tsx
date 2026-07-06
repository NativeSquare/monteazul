"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import { MiNegocioView } from "@/components/app/entrepreneur/mi-negocio-view";
import { Spinner } from "@/components/ui/spinner";

export default function MiNegocioPage() {
  const router = useRouter();
  const commerce = useQuery(api.table.commerces.myCommerce);

  useEffect(() => {
    // No fiche yet → send the entrepreneur to the submission wizard.
    if (commerce === null) {
      router.replace("/mi-negocio/nueva");
    }
  }, [commerce, router]);

  if (commerce === undefined || commerce === null) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <MiNegocioView commerce={commerce} />;
}

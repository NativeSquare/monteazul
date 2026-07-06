"use client";

import { useQuery } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { api } from "@packages/backend/convex/_generated/api";
import { FicheWizard } from "@/components/app/entrepreneur/fiche-wizard";
import { Spinner } from "@/components/ui/spinner";

export default function NuevaFichePage() {
  const router = useRouter();
  const commerce = useQuery(api.table.commerces.myCommerce);

  useEffect(() => {
    // Already has a fiche (1:1 strict) → no second submission, go to the view.
    if (commerce) {
      router.replace("/mi-negocio");
    }
  }, [commerce, router]);

  if (commerce === undefined || commerce) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return <FicheWizard />;
}

import type { Metadata } from "next";
import { TERMINOS } from "@packages/shared/legal";
import { LegalDocument } from "@/components/app/legal/legal-document";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Monteazul",
  description:
    "Términos y Condiciones de Uso de la Plataforma Monteazul, directorio de emprendimientos.",
};

export default function TerminosPage() {
  return <LegalDocument doc={TERMINOS} />;
}

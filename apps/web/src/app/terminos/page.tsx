import type { Metadata } from "next";
import { TERMINOS } from "@packages/shared/legal";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Términos y Condiciones — Cerka",
  description:
    "Términos y Condiciones de Uso de la Plataforma Cerka, directorio de emprendimientos.",
};

export default function TerminosPage() {
  return <LegalDocument doc={TERMINOS} />;
}

import type { Metadata } from "next";
import { PRIVACIDAD } from "@packages/shared/legal";
import { LegalDocument } from "@/components/legal/legal-document";

export const metadata: Metadata = {
  title: "Política de Privacidad — Monteazul",
  description:
    "Política de Privacidad y Tratamiento de Datos Personales de la Plataforma Monteazul.",
};

export default function PrivacidadPage() {
  return <LegalDocument doc={PRIVACIDAD} />;
}

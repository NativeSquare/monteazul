import type { Metadata } from "next";
import { PRIVACIDAD } from "@packages/shared/legal";
import { LegalDocument } from "@/components/app/legal/legal-document";

export const metadata: Metadata = {
  title: "Política de Privacidad — Cerka",
  description:
    "Política de Privacidad y Tratamiento de Datos Personales de la Plataforma Cerka.",
};

export default function PrivacidadPage() {
  return <LegalDocument doc={PRIVACIDAD} />;
}

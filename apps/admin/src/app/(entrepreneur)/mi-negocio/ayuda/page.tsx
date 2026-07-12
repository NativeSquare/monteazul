import { IconLifebuoy } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// The real support number, displayed on purpose (provided by the owner).
const CONTACT_PHONE = "+57 319 416 5914";
// wa.me wants only digits (country code included, no "+", no spaces).
const WHATSAPP_HREF = `https://wa.me/${CONTACT_PHONE.replace(/\D/g, "")}?text=${encodeURIComponent(
  "Hola, tengo una duda sobre mi negocio en Monteazul.",
)}`;

export default function AyudaPage() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <IconLifebuoy className="size-5" />
          </div>
          <CardTitle>Ayuda</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <p className="text-muted-foreground text-sm">
            Para cualquier solicitud o duda sobre tu negocio, contáctanos al
            siguiente número:
          </p>
          {/* Opens a WhatsApp chat (a tel: link does nothing on desktop). */}
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-primary underline underline-offset-4"
          >
            {CONTACT_PHONE}
          </a>
          <p className="text-muted-foreground text-xs">
            Te responderemos lo antes posible.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

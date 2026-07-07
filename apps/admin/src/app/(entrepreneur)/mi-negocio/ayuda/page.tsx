import { IconLifebuoy } from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// TODO: replace with the real support number once provided.
const CONTACT_PHONE = "+57 000 000 0000";

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
          <a
            href={`tel:${CONTACT_PHONE.replace(/\s/g, "")}`}
            className="text-lg font-semibold text-primary hover:underline"
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

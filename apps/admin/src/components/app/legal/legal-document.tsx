import Link from "next/link";
import type { LegalBlock, LegalDoc } from "@packages/shared/legal";

/**
 * Renders a shared legal document (`@packages/shared/legal`) with the
 * back-office design tokens. The content lives in the shared package — never
 * edit legal text here.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <main className="mx-auto min-h-screen max-w-[720px] px-5 py-10">
      <p className="text-muted-foreground text-[13px] font-medium">
        {doc.subtitle}
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight">{doc.title}</h1>
      <p className="text-muted-foreground mt-2 text-[13px]">
        Fecha de última actualización: {doc.updatedAt}.
      </p>

      {doc.intro.map((paragraph) => (
        <p
          key={paragraph.slice(0, 40)}
          className="mt-5 text-[15px] leading-[1.7]"
        >
          {paragraph}
        </p>
      ))}

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-[17px] font-bold">{section.heading}</h2>
          {section.blocks.map((block, index) => (
            <LegalBlockView key={index} block={block} />
          ))}
        </section>
      ))}

      <div className="mt-10 border-t pt-6">
        <Link
          href="/acceso"
          className="text-primary text-sm font-semibold underline-offset-4 hover:underline"
        >
          Volver al inicio de sesión
        </Link>
      </div>
    </main>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "ul") {
    return (
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.7]">
        {block.items.map((item) => (
          <li key={item.slice(0, 40)}>{item}</li>
        ))}
      </ul>
    );
  }
  return <p className="mt-3 text-[15px] leading-[1.7]">{block.text}</p>;
}

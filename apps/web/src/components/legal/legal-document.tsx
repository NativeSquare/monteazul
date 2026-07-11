import Link from "next/link";
import type { LegalBlock, LegalDoc } from "@packages/shared/legal";

/**
 * Renders a shared legal document (`@packages/shared/legal`) with the public
 * annuaire's design tokens. The content lives in the shared package — never
 * edit legal text here.
 */
export function LegalDocument({ doc }: { doc: LegalDoc }) {
  return (
    <main className="mx-auto min-h-screen max-w-[720px] bg-surface px-5 py-10">
      <p className="text-[13px] font-medium text-ink-muted">{doc.subtitle}</p>
      <h1 className="mt-1 text-[26px] font-bold tracking-[-0.02em] text-ink">
        {doc.title}
      </h1>
      <p className="mt-2 text-[13px] text-ink-muted">
        Fecha de última actualización: {doc.updatedAt}.
      </p>

      {doc.intro.map((paragraph) => (
        <p
          key={paragraph.slice(0, 40)}
          className="mt-5 text-[15px] leading-[1.7] text-ink-soft"
        >
          {paragraph}
        </p>
      ))}

      {doc.sections.map((section) => (
        <section key={section.heading} className="mt-8">
          <h2 className="text-[17px] font-bold text-ink">{section.heading}</h2>
          {section.blocks.map((block, index) => (
            <LegalBlockView key={index} block={block} />
          ))}
        </section>
      ))}

      {/* Reachable from the directory footer AND the sign-in consent links —
          offer both ways back. */}
      <div className="mt-10 flex flex-wrap gap-x-8 gap-y-2 border-t border-hairline pt-6">
        <Link
          href="/"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Volver al directorio
        </Link>
        <Link
          href="/login"
          className="text-sm font-semibold text-primary underline-offset-4 hover:underline"
        >
          Volver al login
        </Link>
      </div>
    </main>
  );
}

function LegalBlockView({ block }: { block: LegalBlock }) {
  if (block.type === "ul") {
    return (
      <ul className="mt-3 list-disc space-y-2 pl-5 text-[15px] leading-[1.7] text-ink-soft">
        {block.items.map((item) => (
          <li key={item.slice(0, 40)}>{item}</li>
        ))}
      </ul>
    );
  }
  return (
    <p className="mt-3 text-[15px] leading-[1.7] text-ink-soft">{block.text}</p>
  );
}

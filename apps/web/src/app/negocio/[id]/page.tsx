import { CommerceDetailScreen } from "@/components/directory/commerce-detail-screen";

/**
 * Public Commerce detail route (`/negocio/<id>`). Deep-linkable: the client
 * screen resolves the fiche from `getPublicById`, which returns `null` (→ "no
 * encontrado") for any fiche that is not `publicado`.
 */
export default async function CommerceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <main className="min-h-screen bg-page">
      <CommerceDetailScreen id={id} />
    </main>
  );
}

import Link from "next/link";
import { EntryEditForm } from "~/components/features/entry-form/EntryEditForm";

export default async function EntreePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numId = parseInt(id, 10);

  if (isNaN(numId)) {
    return (
      <main className="mx-auto max-w-lg px-4 py-6">
        <p className="text-sm text-red-600">Identifiant invalide.</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <div className="mb-4 flex items-center gap-3">
        <Link href="/historique" className="text-sm text-blue-600 hover:underline">
          ← Historique
        </Link>
        <h1 className="text-lg font-semibold">Modifier une prise</h1>
      </div>
      <EntryEditForm id={numId} />
    </main>
  );
}

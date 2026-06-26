import { EntryList } from "~/components/features/entry-history/EntryList";

export default function HistoriquePage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">Historique</h1>
      <EntryList />
    </main>
  );
}

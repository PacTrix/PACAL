import { EntryForm } from "~/components/features/entry-form/EntryForm";

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-6 text-xl font-bold">PACAL</h1>
      <EntryForm />
    </main>
  );
}

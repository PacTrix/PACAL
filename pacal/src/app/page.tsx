import { Suspense } from "react";

import { EntryForm } from "~/components/features/entry-form/EntryForm";

export default function Page() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <Suspense>
        <EntryForm />
      </Suspense>
    </main>
  );
}

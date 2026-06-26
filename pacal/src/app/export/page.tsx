"use client";

import { useState } from "react";

export default function ExportPage() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const handleDownload = () => {
    const params = new URLSearchParams();
    if (from) params.set("from", new Date(from).toISOString());
    if (to) params.set("to", new Date(to).toISOString());
    const query = params.size > 0 ? `?${params.toString()}` : "";
    window.location.href = `/api/export${query}`;
  };

  return (
    <main className="mx-auto max-w-lg px-4 py-6">
      <h1 className="mb-4 text-lg font-semibold">Exporter mes données</h1>

      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-600">
          L&apos;export génère un fichier ZIP contenant un CSV de toutes vos
          entrées et les photos associées.
        </p>

        <div className="flex flex-col gap-3 rounded border border-gray-200 bg-gray-50 p-4">
          <p className="text-sm font-medium">Filtrer par période (optionnel)</p>

          <div className="flex flex-col gap-1">
            <label htmlFor="export-from" className="text-sm text-gray-600">
              Du
            </label>
            <input
              id="export-from"
              type="datetime-local"
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="export-to" className="text-sm text-gray-600">
              Au
            </label>
            <input
              id="export-to"
              type="datetime-local"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Télécharger l&apos;export (.zip)
        </button>

        {!from && !to && (
          <p className="text-xs text-gray-500">
            Sans filtre de période, toutes les entrées sont exportées.
          </p>
        )}
      </div>
    </main>
  );
}

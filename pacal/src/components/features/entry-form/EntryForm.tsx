"use client";

import { useRef, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

import { api } from "~/trpc/react";
import {
  ENTRY_CONDITION_LABELS,
  ENTRY_CONDITIONS,
  ENTRY_UNITS,
  NOTE_TYPES,
} from "~/server/db/schema";

const LAST_CONTEXT_KEY = "pacal_last_context";

const formatDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

type PhotoSlot = { file: File | null; previewUrl: string | null };
const emptySlot = (): PhotoSlot => ({ file: null, previewUrl: null });

function PhotoWidget({
  label,
  slot,
  onChangeSlot,
}: {
  label: string;
  slot: PhotoSlot;
  onChangeSlot: (s: PhotoSlot) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File | null) => {
    if (slot.previewUrl) URL.revokeObjectURL(slot.previewUrl);
    if (file) {
      onChangeSlot({ file, previewUrl: URL.createObjectURL(file) });
    } else {
      onChangeSlot(emptySlot());
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium text-brand-marine">
        {label}{" "}
        <span className="text-xs font-normal text-gray-500">(optionnel)</span>
      </span>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
      />
      {slot.previewUrl ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={slot.previewUrl}
            alt="Aperçu"
            className="h-32 w-full rounded border border-gray-200 object-cover"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => galleryRef.current?.click()}
              className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm"
            >
              Changer
            </button>
            <button
              type="button"
              onClick={() => handleFile(null)}
              className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600"
            >
              Retirer
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          >
            📷 Prendre
          </button>
          <button
            type="button"
            onClick={() => galleryRef.current?.click()}
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm"
          >
            🖼 Galerie
          </button>
        </div>
      )}
    </div>
  );
}

async function uploadPhoto(file: File): Promise<string | undefined> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/photos", { method: "POST", body: fd });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { path: string };
  return data.path;
}

export function EntryForm() {
  const searchParams = useSearchParams();

  // Pré-remplissage depuis duplication (query params) ou depuis localStorage
  const dupCondition = searchParams.get("condition") ?? "";
  const savedContext =
    typeof window !== "undefined"
      ? (localStorage.getItem(LAST_CONTEXT_KEY) ?? "")
      : "";
  const initialCondition = dupCondition || savedContext;

  const [timestamp, setTimestamp] = useState(formatDatetimeLocal(new Date()));
  const [condition, setCondition] = useState<string>(initialCondition);
  const [description, setDescription] = useState(searchParams.get("description") ?? "");
  const [quantity, setQuantity] = useState(searchParams.get("quantity") ?? "");
  const [unit, setUnit] = useState(searchParams.get("unit") ?? "");
  const [calories, setCalories] = useState(searchParams.get("calories") ?? "");
  const [note, setNote] = useState(searchParams.get("note") ?? "");
  const [noteType, setNoteType] = useState(searchParams.get("noteType") ?? "");
  const [photo1, setPhoto1] = useState<PhotoSlot>(emptySlot());
  const [photo2, setPhoto2] = useState<PhotoSlot>(emptySlot());
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Mise à jour du contexte depuis localStorage si pas de duplication en cours
  useEffect(() => {
    if (!dupCondition && !condition) {
      const saved = localStorage.getItem(LAST_CONTEXT_KEY) ?? "";
      if (saved) setCondition(saved);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const createEntry = api.entries.create.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimestamp(formatDatetimeLocal(new Date()));
      // Conserver le contexte (ne pas remettre à vide — FR-29)
      setDescription("");
      setQuantity("");
      setUnit("");
      setCalories("");
      setNote("");
      setNoteType("");
      if (photo1.previewUrl) URL.revokeObjectURL(photo1.previewUrl);
      if (photo2.previewUrl) URL.revokeObjectURL(photo2.previewUrl);
      setPhoto1(emptySlot());
      setPhoto2(emptySlot());
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!condition) return;

    setIsUploading(true);
    try {
      const [path1, path2] = await Promise.all([
        photo1.file ? uploadPhoto(photo1.file) : Promise.resolve(undefined),
        photo2.file ? uploadPhoto(photo2.file) : Promise.resolve(undefined),
      ]);

      await createEntry.mutateAsync({
        timestamp: new Date(timestamp),
        condition: condition as (typeof ENTRY_CONDITIONS)[number],
        description: description.trim() || undefined,
        quantity: quantity !== "" ? parseInt(quantity, 10) : undefined,
        unit: unit !== "" ? (unit as (typeof ENTRY_UNITS)[number]) : undefined,
        calories: calories !== "" ? parseFloat(calories) : undefined,
        note: note.trim() || undefined,
        noteType: noteType !== "" ? (noteType as (typeof NOTE_TYPES)[number]) : undefined,
        photoPath1: path1,
        photoPath2: path2,
      });

      // Persister le dernier contexte (FR-29)
      localStorage.setItem(LAST_CONTEXT_KEY, condition);
    } finally {
      setIsUploading(false);
    }
  };

  const isPending = isUploading || createEntry.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Horodatage + bouton rafraîchissement (FR-28) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="timestamp" className="text-sm font-medium text-brand-marine">
          Date et heure
        </label>
        <div className="flex gap-2">
          <input
            id="timestamp"
            type="datetime-local"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            required
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
          <button
            type="button"
            onClick={() => setTimestamp(formatDatetimeLocal(new Date()))}
            className="rounded border border-gray-300 px-2 py-1 text-xs text-gray-500 hover:bg-gray-50"
            title="Actualiser à maintenant"
          >
            ↺ Maintenant
          </button>
        </div>
      </div>

      {/* Condition de prise (FR-4) — obligatoire */}
      <div className="flex flex-col gap-1">
        <label htmlFor="condition" className="text-sm font-medium text-brand-marine">
          Contexte <span className="text-red-500">*</span>
        </label>
        <select
          id="condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        >
          <option value="">Choisir…</option>
          {ENTRY_CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {ENTRY_CONDITION_LABELS[c]}
            </option>
          ))}
        </select>
      </div>

      {/* Description (FR-3) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-brand-marine">
          Description{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <input
          id="description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ex : salade niçoise, cappuccino…"
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        />
      </div>

      {/* Quantité + unité (FR-30) */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="quantity" className="text-sm font-medium text-brand-marine">
            Quantité{" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <input
            id="quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            placeholder="0"
            className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="unit" className="text-sm font-medium text-brand-marine">
            Unité{" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <select
            id="unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          >
            <option value="">—</option>
            {ENTRY_UNITS.map((u) => (
              <option key={u} value={u}>{u}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Calories */}
      <div className="flex flex-col gap-1">
        <label htmlFor="calories" className="text-sm font-medium text-brand-marine">
          Calories (kcal){" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <input
          id="calories"
          type="number"
          min="0"
          step="any"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          placeholder="0"
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        />
      </div>

      {/* Note + type de note (FR-31) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-sm font-medium text-brand-marine">
          Note{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Remarques libres…"
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        />
        <select
          id="noteType"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-500"
        >
          <option value="">Type de note (optionnel)</option>
          {NOTE_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Photo 1 + Photo 2 (FR-33) */}
      <PhotoWidget label="Photo 1" slot={photo1} onChangeSlot={setPhoto1} />
      <PhotoWidget label="Photo 2" slot={photo2} onChangeSlot={setPhoto2} />

      <button
        type="submit"
        disabled={isPending || !condition}
        className="mt-2 rounded bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isPending ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer"}
      </button>

      {createEntry.isError && (
        <p className="text-sm text-red-600">
          Erreur lors de l&apos;enregistrement. Réessayez.
        </p>
      )}
    </form>
  );
}

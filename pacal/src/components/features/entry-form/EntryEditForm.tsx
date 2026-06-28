"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";
import {
  ENTRY_CONDITION_LABELS,
  ENTRY_CONDITIONS,
  ENTRY_UNITS,
  NOTE_TYPES,
} from "~/server/db/schema";

const formatDatetimeLocal = (date: Date): string => {
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};

const extractFilename = (p: string): string => p.split("/").pop() ?? "";

async function uploadPhoto(file: File): Promise<string | undefined> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/photos", { method: "POST", body: fd });
  if (!res.ok) return undefined;
  const data = (await res.json()) as { path: string };
  return data.path;
}

type SlotState = {
  existingPath: string | null; // null = supprimée ou absente
  newFile: File | null;
  newPreviewUrl: string | null;
};

function emptySlot(existing: string | null = null): SlotState {
  return { existingPath: existing, newFile: null, newPreviewUrl: null };
}

function PhotoWidget({
  label,
  slot,
  onUpdate,
}: {
  label: string;
  slot: SlotState;
  onUpdate: (s: SlotState) => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);

  const handleNewFile = (file: File | null) => {
    if (slot.newPreviewUrl) URL.revokeObjectURL(slot.newPreviewUrl);
    if (file) {
      onUpdate({ ...slot, newFile: file, newPreviewUrl: URL.createObjectURL(file) });
    } else {
      onUpdate({ ...slot, newFile: null, newPreviewUrl: null });
    }
  };

  const handleRemove = () => {
    if (slot.newPreviewUrl) URL.revokeObjectURL(slot.newPreviewUrl);
    onUpdate({ existingPath: null, newFile: null, newPreviewUrl: null });
  };

  const existingFilename = slot.existingPath ? extractFilename(slot.existingPath) : null;

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
        onChange={(e) => handleNewFile(e.target.files?.[0] ?? null)}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleNewFile(e.target.files?.[0] ?? null)}
      />

      {slot.newPreviewUrl ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={slot.newPreviewUrl} alt="Nouvelle photo" className="h-32 w-full rounded border border-gray-200 object-cover" />
          <div className="flex gap-2">
            <button type="button" onClick={() => galleryRef.current?.click()} className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm">Changer</button>
            <button type="button" onClick={handleRemove} className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600">Retirer</button>
          </div>
        </div>
      ) : existingFilename ? (
        <div className="flex flex-col gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/api/photos/${existingFilename}`} alt="Photo existante" className="h-32 w-full rounded border border-gray-200 object-cover" />
          <div className="flex gap-2">
            <button type="button" onClick={() => galleryRef.current?.click()} className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm">Remplacer</button>
            <button type="button" onClick={handleRemove} className="rounded border border-red-200 px-3 py-1.5 text-sm text-red-600">Supprimer</button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button type="button" onClick={() => cameraRef.current?.click()} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm">📷 Prendre</button>
          <button type="button" onClick={() => galleryRef.current?.click()} className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm">🖼 Galerie</button>
        </div>
      )}
    </div>
  );
}

async function resolveSlot(slot: SlotState): Promise<string | null> {
  if (slot.newFile) {
    return (await uploadPhoto(slot.newFile)) ?? slot.existingPath;
  }
  return slot.existingPath;
}

export function EntryEditForm({ id }: { id: number }) {
  const { data: entry, isPending, isError } = api.entries.getById.useQuery({ id });

  const [timestamp, setTimestamp] = useState("");
  const [condition, setCondition] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("");
  const [calories, setCalories] = useState("");
  const [note, setNote] = useState("");
  const [noteType, setNoteType] = useState("");
  const [slot1, setSlot1] = useState<SlotState>(emptySlot());
  const [slot2, setSlot2] = useState<SlotState>(emptySlot());
  const [isUploading, setIsUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!entry) return;
    setTimestamp(formatDatetimeLocal(new Date(entry.timestamp)));
    setCondition(entry.condition);
    setDescription(entry.description ?? "");
    setQuantity(entry.quantity != null ? String(entry.quantity) : "");
    setUnit(entry.unit ?? "");
    setCalories(entry.calories != null ? String(entry.calories) : "");
    setNote(entry.note ?? "");
    setNoteType(entry.noteType ?? "");
    setSlot1(emptySlot(entry.photoPath1 ?? null));
    setSlot2(emptySlot(entry.photoPath2 ?? null));
  }, [entry]);

  const updateEntry = api.entries.update.useMutation({
    onSuccess: () => {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!condition) return;

    setIsUploading(true);
    try {
      const [finalPath1, finalPath2] = await Promise.all([
        resolveSlot(slot1),
        resolveSlot(slot2),
      ]);

      await updateEntry.mutateAsync({
        id,
        timestamp: new Date(timestamp),
        condition: condition as (typeof ENTRY_CONDITIONS)[number],
        description: description.trim() || undefined,
        quantity: quantity !== "" ? parseInt(quantity, 10) : undefined,
        unit: unit !== "" ? (unit as (typeof ENTRY_UNITS)[number]) : undefined,
        calories: calories !== "" ? parseFloat(calories) : undefined,
        note: note.trim() || undefined,
        noteType: noteType !== "" ? (noteType as (typeof NOTE_TYPES)[number]) : undefined,
        photoPath1: finalPath1,
        photoPath2: finalPath2,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (isError) return <p className="text-sm text-red-600">Entrée introuvable.</p>;

  const isBusy = isUploading || updateEntry.isPending;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Horodatage + bouton rafraîchissement (FR-28) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-timestamp" className="text-sm font-medium text-brand-marine">
          Date et heure
        </label>
        <div className="flex gap-2">
          <input
            id="edit-timestamp"
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

      {/* Condition */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-condition" className="text-sm font-medium text-brand-marine">
          Contexte <span className="text-red-500">*</span>
        </label>
        <select
          id="edit-condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        >
          <option value="">Choisir…</option>
          {ENTRY_CONDITIONS.map((c) => (
            <option key={c} value={c}>{ENTRY_CONDITION_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-description" className="text-sm font-medium text-brand-marine">
          Description{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <input
          id="edit-description"
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        />
      </div>

      {/* Quantité + unité (FR-30) */}
      <div className="flex gap-3">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="edit-quantity" className="text-sm font-medium text-brand-marine">
            Quantité{" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <input
            id="edit-quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="edit-unit" className="text-sm font-medium text-brand-marine">
            Unité{" "}
            <span className="text-xs font-normal text-gray-500">(optionnel)</span>
          </label>
          <select
            id="edit-unit"
            value={unit}
            onChange={(e) => setUnit(e.target.value)}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          >
            <option value="">—</option>
            {ENTRY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Calories */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-calories" className="text-sm font-medium text-brand-marine">
          Calories (kcal){" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <input
          id="edit-calories"
          type="number"
          min="0"
          step="any"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        />
      </div>

      {/* Note + type de note (FR-31) */}
      <div className="flex flex-col gap-1">
        <label htmlFor="edit-note" className="text-sm font-medium text-brand-marine">
          Note{" "}
          <span className="text-xs font-normal text-gray-500">(optionnel)</span>
        </label>
        <textarea
          id="edit-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
        />
        <select
          id="edit-noteType"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm text-gray-500"
        >
          <option value="">Type de note (optionnel)</option>
          {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Deux photos (FR-33) */}
      <PhotoWidget label="Photo 1" slot={slot1} onUpdate={setSlot1} />
      <PhotoWidget label="Photo 2" slot={slot2} onUpdate={setSlot2} />

      <button
        type="submit"
        disabled={isBusy || !condition}
        className="mt-2 rounded bg-brand-orange px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {isBusy ? "Enregistrement…" : saved ? "✓ Enregistré" : "Enregistrer les modifications"}
      </button>

      {updateEntry.isError && (
        <p className="text-sm text-red-600">
          Erreur lors de l&apos;enregistrement. Réessayez.
        </p>
      )}
    </form>
  );
}

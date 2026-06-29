"use client";

import { useEffect, useRef, useState } from "react";

import { api } from "~/trpc/react";
import {
  ENTRY_CONDITION_LABELS,
  ENTRY_CONDITIONS,
  ENTRY_UNITS,
  NOTE_TYPES,
} from "~/server/db/schema";
import { BarcodeScanner } from "./BarcodeScanner";
import { NutriscoreDisplay } from "./NutriscoreDisplay";
import type { OFFProduct } from "~/lib/openfoodfacts";
import { computeKcal, isKcalUnavailable } from "~/lib/kcal";

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
  existingPath: string | null;
  newFile: File | null;
  newPreviewUrl: string | null;
};

function emptySlot(existing: string | null = null): SlotState {
  return { existingPath: existing, newFile: null, newPreviewUrl: null };
}

// 4 boutons compacts sur une ligne, previews existantes ou nouvelles en dessous
function PhotosEditWidget({
  slot1,
  slot2,
  onUpdate1,
  onUpdate2,
}: {
  slot1: SlotState;
  slot2: SlotState;
  onUpdate1: (s: SlotState) => void;
  onUpdate2: (s: SlotState) => void;
}) {
  const cam1Ref = useRef<HTMLInputElement>(null);
  const gal1Ref = useRef<HTMLInputElement>(null);
  const cam2Ref = useRef<HTMLInputElement>(null);
  const gal2Ref = useRef<HTMLInputElement>(null);

  const handleNew = (slot: SlotState, onUpdate: (s: SlotState) => void, file: File | null) => {
    if (slot.newPreviewUrl) URL.revokeObjectURL(slot.newPreviewUrl);
    if (file) onUpdate({ ...slot, newFile: file, newPreviewUrl: URL.createObjectURL(file) });
    else onUpdate({ ...slot, newFile: null, newPreviewUrl: null });
  };
  const handleRemove = (slot: SlotState, onUpdate: (s: SlotState) => void) => {
    if (slot.newPreviewUrl) URL.revokeObjectURL(slot.newPreviewUrl);
    onUpdate({ existingPath: null, newFile: null, newPreviewUrl: null });
  };

  const preview1 = slot1.newPreviewUrl ?? (slot1.existingPath ? `/api/photos/${extractFilename(slot1.existingPath)}` : null);
  const preview2 = slot2.newPreviewUrl ?? (slot2.existingPath ? `/api/photos/${extractFilename(slot2.existingPath)}` : null);

  return (
    <div className="flex flex-col gap-2">
      <input ref={cam1Ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleNew(slot1, onUpdate1, e.target.files?.[0] ?? null)} />
      <input ref={gal1Ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleNew(slot1, onUpdate1, e.target.files?.[0] ?? null)} />
      <input ref={cam2Ref} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handleNew(slot2, onUpdate2, e.target.files?.[0] ?? null)} />
      <input ref={gal2Ref} type="file" accept="image/*" className="hidden" onChange={(e) => handleNew(slot2, onUpdate2, e.target.files?.[0] ?? null)} />
      <div className="grid grid-cols-4 gap-1.5">
        <button type="button" onClick={() => cam1Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>📷</span><span>Photo 1</span>
        </button>
        <button type="button" onClick={() => gal1Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>🖼</span><span>Galerie 1</span>
        </button>
        <button type="button" onClick={() => cam2Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>📷</span><span>Photo 2</span>
        </button>
        <button type="button" onClick={() => gal2Ref.current?.click()} className="flex flex-col items-center gap-0.5 rounded border border-brand-marine px-1 py-2 text-xs text-brand-marine hover:bg-blue-50">
          <span>🖼</span><span>Galerie 2</span>
        </button>
      </div>
      {(preview1 ?? preview2) && (
        <div className="flex gap-2">
          {preview1 && (
            <div className="flex flex-1 flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview1} alt="Photo 1" className="h-24 w-full rounded border border-gray-200 object-cover" />
              <button type="button" onClick={() => handleRemove(slot1, onUpdate1)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600">Retirer 1</button>
            </div>
          )}
          {preview2 && (
            <div className="flex flex-1 flex-col gap-1">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview2} alt="Photo 2" className="h-24 w-full rounded border border-gray-200 object-cover" />
              <button type="button" onClick={() => handleRemove(slot2, onUpdate2)} className="rounded border border-red-200 px-2 py-1 text-xs text-red-600">Retirer 2</button>
            </div>
          )}
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
  const [barcode, setBarcode] = useState("");
  const [offData, setOffData] = useState<OFFProduct | null>(null);
  const [offError, setOffError] = useState<string | null>(null);
  const [ofIncomplete, setOfIncomplete] = useState(false);
  const [kcalManual, setKcalManual] = useState(true); // true par défaut en edit (valeur existante)
  const [lookupBarcode, setLookupBarcode] = useState("");
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
    setBarcode(entry.barcode ?? "");
    if (entry.nutriscore ?? entry.nova ?? entry.greenscore) {
      setOffData({
        name: entry.description ?? null,
        nutriscore: entry.nutriscore ?? null,
        nova: entry.nova ?? null,
        greenscore: entry.greenscore ?? null,
        kcalPer100g: entry.kcalPer100g ?? null,
        kcalPerPortion: entry.kcalPerPortion ?? null,
      });
    }
    setOfIncomplete(entry.ofIncomplete ?? false);
    setSlot1(emptySlot(entry.photoPath1 ?? null));
    setSlot2(emptySlot(entry.photoPath2 ?? null));
  }, [entry]);

  const lookup = api.products.lookup.useQuery(
    { barcode: lookupBarcode },
    { enabled: lookupBarcode.length > 0, retry: false }
  );

  useEffect(() => {
    if (!lookup.data && !lookup.isError && !lookup.isFetching) return;
    if (lookup.isFetching) return;
    if (lookup.isError || lookup.data === null || lookup.data === undefined) {
      setOffData(null);
      setOfIncomplete(true);
      setOffError("Produit non trouvé dans OpenFoodFacts.");
      return;
    }
    const d = lookup.data;
    setOffData(d);
    setOfIncomplete(false);
    setOffError(null);
    if (d.name) setDescription(d.name); // toujours écraser avec le nom produit OFF
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lookup.data, lookup.isError, lookup.isFetching]);

  const triggerLookup = (code: string) => {
    const trimmed = code.trim();
    if (trimmed.length < 4) return;
    setKcalManual(false); // nouveau barcode = recalcul kcal autorisé
    setLookupBarcode(trimmed);
  };

  // Calcul automatique des kcal depuis données OFF (FR-39)
  useEffect(() => {
    if (!offData || kcalManual) return;
    const qty = quantity !== "" ? parseFloat(quantity) : null;
    const computed = computeKcal(qty, unit || null, offData.kcalPer100g, offData.kcalPerPortion);
    if (computed !== null) {
      setCalories(String(computed));
    } else if (isKcalUnavailable(unit || null, offData.kcalPerPortion, true)) {
      setCalories("");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quantity, unit, offData, kcalManual]);

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
        barcode: barcode.trim() || undefined,
        nutriscore: offData?.nutriscore ?? undefined,
        nova: offData?.nova ?? undefined,
        greenscore: offData?.greenscore ?? undefined,
        kcalPer100g: offData?.kcalPer100g ?? undefined,
        kcalPerPortion: offData?.kcalPerPortion ?? undefined,
        ofIncomplete: ofIncomplete || undefined,
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (isPending) return <p className="text-sm text-gray-500">Chargement…</p>;
  if (isError) return <p className="text-sm text-red-600">Entrée introuvable.</p>;

  const isBusy = isUploading || updateEntry.isPending;

  const noteRef = useRef<HTMLTextAreaElement>(null);
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value);
    const rows = e.target.value.split("\n").length;
    if (noteRef.current) noteRef.current.rows = rows >= 2 ? 3 : 1;
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Ligne 1 : Date + ↺ + Contexte */}
      <div className="flex items-end gap-2">
        <input
          id="edit-timestamp"
          type="datetime-local"
          value={timestamp}
          onChange={(e) => setTimestamp(e.target.value)}
          required
          className="rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
          style={{ width: "11rem" }}
        />
        <button
          type="button"
          onClick={() => setTimestamp(formatDatetimeLocal(new Date()))}
          className="shrink-0 rounded border border-gray-300 px-2 py-2 text-base text-gray-500 hover:bg-gray-50"
          title="Actualiser à maintenant"
        >
          ↺
        </button>
        <select
          id="edit-condition"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
          required
          className="flex-1 rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
        >
          <option value="">Contexte…</option>
          {ENTRY_CONDITIONS.map((c) => (
            <option key={c} value={c}>{ENTRY_CONDITION_LABELS[c]}</option>
          ))}
        </select>
      </div>

      {/* Description */}
      <input
        id="edit-description"
        type="text"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description…"
        className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
      />

      {/* Code-barres + Scan + scores inline */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <input
            id="edit-barcode"
            type="text"
            value={barcode}
            onChange={(e) => setBarcode(e.target.value)}
            onBlur={() => triggerLookup(barcode)}
            placeholder="Code-barres EAN"
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
          <BarcodeScanner onDetected={(code) => { setBarcode(code); triggerLookup(code); }} />
          {offData && (
            <NutriscoreDisplay
              nutriscore={offData.nutriscore}
              nova={offData.nova}
              greenscore={offData.greenscore}
            />
          )}
        </div>
        {lookup.isFetching && <p className="text-xs text-gray-400">Recherche OpenFoodFacts…</p>}
        {offError && <p className="text-xs text-orange-500">{offError}</p>}
      </div>

      {/* Quantité + Unité + Calories */}
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1">
          <label htmlFor="edit-quantity" className="text-xs text-gray-500">Quantité</label>
          <input
            id="edit-quantity"
            type="number"
            min="0"
            step="1"
            value={quantity}
            onChange={(e) => { setQuantity(e.target.value); if (offData) setKcalManual(false); }}
            className="rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          />
        </div>
        <div className="flex flex-col gap-1" style={{ width: "5.5rem" }}>
          <label htmlFor="edit-unit" className="text-xs text-gray-500">Unité</label>
          <select
            id="edit-unit"
            value={unit}
            onChange={(e) => { setUnit(e.target.value); if (offData) setKcalManual(false); }}
            className="rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
          >
            <option value="">—</option>
            {ENTRY_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1" style={{ width: "5.5rem" }}>
          <label htmlFor="edit-calories" className="flex items-center gap-1 text-xs text-gray-500">
            Kcal {kcalManual && offData && <span className="text-orange-400">✎</span>}
          </label>
          {isKcalUnavailable(unit || null, offData?.kcalPerPortion ?? null, offData !== null) ? (
            <div className="rounded border border-gray-200 bg-gray-50 px-2 py-2 text-sm text-gray-400">---</div>
          ) : (
            <input
              id="edit-calories"
              type="number"
              min="0"
              step="any"
              value={calories}
              onChange={(e) => { setCalories(e.target.value); if (offData) setKcalManual(true); }}
              className="rounded border border-gray-300 px-2 py-2 text-sm text-brand-marine"
            />
          )}
        </div>
      </div>

      {/* Note auto-expand + type */}
      <div className="flex gap-2">
        <textarea
          ref={noteRef}
          id="edit-note"
          value={note}
          onChange={handleNoteChange}
          rows={1}
          placeholder="Note (optionnel)…"
          className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm text-brand-marine"
          style={{ resize: "none" }}
        />
        <select
          id="edit-noteType"
          value={noteType}
          onChange={(e) => setNoteType(e.target.value)}
          className="rounded border border-gray-300 px-2 py-2 text-sm text-gray-500"
          style={{ width: "7.5rem" }}
        >
          <option value="">Type…</option>
          {NOTE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {/* Photos 4 boutons compacts */}
      <PhotosEditWidget slot1={slot1} slot2={slot2} onUpdate1={setSlot1} onUpdate2={setSlot2} />

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

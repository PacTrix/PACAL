import { env } from "~/env";

// Versions lues depuis package.json au build (Server Component)
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pkg = require("../../../package.json") as Record<string, Record<string, string>>;
const deps = { ...pkg.dependencies, ...pkg.devDependencies } as Record<string, string>;

const STACK = [
  { name: "Next.js", key: "next" },
  { name: "React", key: "react" },
  { name: "tRPC", key: "@trpc/server" },
  { name: "Drizzle ORM", key: "drizzle-orm" },
  { name: "Tailwind CSS", key: "tailwindcss" },
  { name: "@react-pdf/renderer", key: "@react-pdf/renderer" },
  { name: "fflate", key: "fflate" },
  { name: "PostgreSQL", key: null }, // runtime externe, pas dans package.json
];

const CHANGELOG = [
  {
    version: "V1.2",
    date: "2026-06-28",
    items: [
      "Bouton de rafraîchissement de la date/heure (saisie + édition)",
      "Pré-remplissage automatique du dernier contexte",
      "Quantité + unité remplace le champ poids",
      "Type de note (aliment, médicament, sommeil, autre)",
      "Deux photos par fiche (indépendantes et optionnelles)",
      "Duplication → formulaire prérempli au lieu de création directe",
      "Charte graphique (orange + bleu marine) et logo",
      "Menu « À propos » (ce menu)",
    ],
  },
  {
    version: "V1.1",
    date: "2026-06-26",
    items: [
      "Affichage de la version et de la date de build dans l'en-tête",
      "Suppression et duplication d'entrée depuis l'historique",
      "Vignette photo dans le rapport PDF (layout 3 colonnes)",
    ],
  },
  {
    version: "V1.0",
    date: "2026-06-18",
    items: [
      "Saisie d'une prise avec horodatage et contexte",
      "Photo (caméra ou galerie)",
      "Historique des prises",
      "Modification d'une entrée",
      "Export ZIP (CSV + photos)",
      "Rapport PDF journalier",
    ],
  },
];

export default function AProposPage() {
  return (
    <main className="mx-auto max-w-md px-4 py-6">
      <h1 className="mb-6 text-xl font-bold text-brand-orange">À propos</h1>

      {/* Version et build */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-orange">
          Version
        </h2>
        <div className="rounded border border-gray-200 px-4 py-3 text-sm text-brand-marine">
          {env.NEXT_PUBLIC_APP_VERSION ? (
            <>
              <p className="font-medium">v{env.NEXT_PUBLIC_APP_VERSION}</p>
              {env.NEXT_PUBLIC_BUILD_DATE && (
                <p className="text-gray-500">Build : {env.NEXT_PUBLIC_BUILD_DATE}</p>
              )}
            </>
          ) : (
            <p className="text-gray-400 italic">Version non renseignée (développement local)</p>
          )}
        </div>
      </section>

      {/* Stack technique */}
      <section className="mb-6">
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-orange">
          Stack technique
        </h2>
        <ul className="rounded border border-gray-200 divide-y divide-gray-100">
          {STACK.map(({ name, key }) => (
            <li key={name} className="flex items-center justify-between px-4 py-2 text-sm">
              <span className="text-brand-marine">{name}</span>
              <span className="text-gray-400">
                {key && deps[key] ? deps[key].replace(/^\^/, "") : "runtime"}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* Changelog */}
      <section>
        <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-brand-orange">
          Changelog
        </h2>
        <div className="flex flex-col gap-4">
          {CHANGELOG.map(({ version, date, items }) => (
            <div key={version}>
              <p className="text-sm font-semibold text-brand-marine">
                {version} <span className="font-normal text-gray-400">— {date}</span>
              </p>
              <ul className="mt-1 flex flex-col gap-0.5">
                {items.map((item) => (
                  <li key={item} className="text-sm text-gray-600 before:mr-1 before:content-['·']">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Saisie" },
  { href: "/historique", label: "Historique" },
  { href: "/export", label: "Export" },
  { href: "/rapport", label: "Rapport" },
  { href: "/a-propos", label: "À propos" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200">
      {/* Barre titre : fond orange, texte bleu */}
      <div className="bg-brand-orange px-4 py-2">
        <div className="mx-auto flex max-w-md items-center gap-2">
          <Image
            src="/logo.png"
            alt="PACAL"
            width={32}
            height={32}
            className="shrink-0"
          />
          <span className="text-base font-bold text-brand-marine">PACAL</span>
        </div>
      </div>
      {/* Barre menu */}
      <div className="bg-white px-4 py-1">
        <div className="mx-auto flex max-w-md flex-wrap gap-1">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`rounded px-3 py-1.5 text-sm font-medium ${
                pathname === href
                  ? "bg-orange-50 text-brand-orange"
                  : "text-brand-marine hover:text-gray-900"
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

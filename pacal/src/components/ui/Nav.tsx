"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Saisie" },
  { href: "/historique", label: "Historique" },
  { href: "/export", label: "Export" },
  { href: "/rapport", label: "Rapport" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-md gap-1 px-4 py-2">
        {LINKS.map(({ href, label }) => (
          <Link
            key={href}
            href={href}
            className={`rounded px-3 py-1.5 text-sm font-medium ${
              pathname === href
                ? "bg-blue-50 text-blue-700"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

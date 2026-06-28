"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { env } from "~/env";

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
      <div className="mx-auto max-w-md px-4 pt-2 pb-1">
        <div className="mb-1">
          <span className="text-base font-bold text-gray-900">PACAL</span>
          {env.NEXT_PUBLIC_APP_VERSION && (
            <p className="text-xs italic text-gray-400">
              v{env.NEXT_PUBLIC_APP_VERSION}
              {env.NEXT_PUBLIC_BUILD_DATE && ` — ${env.NEXT_PUBLIC_BUILD_DATE}`}
            </p>
          )}
        </div>
        <div className="flex gap-1">
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
      </div>
    </nav>
  );
}

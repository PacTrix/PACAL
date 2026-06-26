import "~/styles/globals.css";

import { Geist } from "next/font/google";
import { type Metadata } from "next";

import { TRPCReactProvider } from "~/trpc/react";
import { Nav } from "~/components/ui/Nav";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PACAL",
  description: "Journal alimentaire personnel",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className={geist.className}>
        <TRPCReactProvider>
          <Nav />
          {children}
        </TRPCReactProvider>
      </body>
    </html>
  );
}

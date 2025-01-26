import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";

const inter = Manrope({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Gib Work Explorer",
  description: "Gib Work Explorer",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-br" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background", inter.className)}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

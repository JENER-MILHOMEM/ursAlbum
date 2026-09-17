import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UrsAlbum — Votação de Imagens",
  description:
    "Sistema de votação de imagens. Visualize, vote e acompanhe o ranking das propostas.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-primary)] text-[var(--text-primary)]">
        <div className="bg-radial-glow" />
        <div className="bg-grid relative z-10 flex flex-col min-h-dvh">
          {children}
        </div>
      </body>
    </html>
  );
}

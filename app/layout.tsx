import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Folkes Tangentbords Träning",
  description: "Folkes webbaserade tangentbordsträningsspel med progressiv träning och gamification",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv">
      <body className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="min-h-screen flex flex-col">
          <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-center">
                🎯 Folkes Tangentbords Träning
              </h1>
              <p className="text-center text-blue-200 mt-2">
                Träna dina fingrar med Folke!
              </p>
            </div>
          </header>
          <main className="flex-1 p-4">
            <div className="max-w-6xl mx-auto">
              {children}
            </div>
          </main>
          <footer className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-4 text-center text-sm text-blue-200">
            <p>© 2026 Folkes Tangentbords Träning - Byggd med Next.js och TypeScript</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
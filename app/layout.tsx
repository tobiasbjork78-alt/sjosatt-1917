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
      <body
        className="min-h-screen text-white relative"
        style={{
          backgroundImage: "url('/images/backgrounds/Generated Image February 02, 2026 - 8_59PM.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundAttachment: 'fixed'
        }}
      >
        {/* Background overlay for better text readability */}
        <div className="fixed inset-0 bg-black/40 z-0"></div>
        <div className="min-h-screen flex flex-col relative z-10">
          <header className="bg-black/20 backdrop-blur-sm border-b border-white/10 p-4">
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl md:text-3xl font-bold text-center">
                🎯 Folkes Tangentbords Träning
              </h1>
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
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "../components/layout/Sidebar"
import Topbar from "../components/layout/Topbar"
import { Toaster } from "sonner"

const inter = Inter({ subsets: ["latin", "latin-ext"] })

export const metadata: Metadata = {
  title: "BLOCK STORAGE | Přehled a správa externího skladu",
  description: "Přehled a správa externího skladu — Handling Units, bloky, přesuny, inventury",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="cs" className="dark">
      <body className={`${inter.className} min-h-screen flex bg-[#050a18] text-slate-100 antialiased`}>
        
        {/* Levý pevný navigační panel */}
        <Sidebar />

        {/* Hlavní obsahová část, odsazená o šířku sidebaru (pl-60 = 240px) */}
        <div className="flex-1 flex flex-col pl-60 min-h-screen">
          
          {/* Pevná horní lišta */}
          <Topbar />
          
          {/* Prostor pro samotnou stránku */}
          <main className="flex-1 w-full p-6">
            {children}
          </main>
        </div>
        
        <Toaster theme="dark" position="bottom-right" richColors closeButton />
      </body>
    </html>
  )
}

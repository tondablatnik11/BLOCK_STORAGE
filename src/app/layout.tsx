import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "sonner"
import Providers from "./providers"
import LayoutShell from "./LayoutShell"

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
        <Providers>
          <LayoutShell>
            {children}
          </LayoutShell>
          <Toaster theme="dark" position="bottom-right" richColors closeButton />
        </Providers>
      </body>
    </html>
  )
}

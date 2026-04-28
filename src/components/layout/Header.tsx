import Link from 'next/link'
import { Package, History } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-primary text-primary-foreground shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <Package className="h-6 w-6 text-accent" />
            <span className="font-bold text-xl tracking-tight">BLOCK WMS</span>
          </div>
          
          <nav className="flex space-x-6">
            <Link 
              href="/" 
              className="flex items-center gap-2 hover:text-accent transition-colors text-sm font-medium"
            >
              <Package className="h-4 w-4" />
              Aktivní Sklad
            </Link>
            <Link 
              href="/history" 
              className="flex items-center gap-2 hover:text-accent transition-colors text-sm font-medium"
            >
              <History className="h-4 w-4" />
              Historie pohybů
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}

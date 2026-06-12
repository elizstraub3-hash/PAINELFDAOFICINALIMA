'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Wrench,
  Users,
  UserCog,
  TrendingUp,
  Download,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/servicos', label: 'Serviços', icon: Wrench },
  { href: '/clientes', label: 'Clientes', icon: Users },
  { href: '/mecanicos', label: 'Mecânicos', icon: UserCog },
  { href: '/fluxo-caixa', label: 'Fluxo de Caixa', icon: TrendingUp },
  { href: '/exportar', label: 'Exportar', icon: Download },
]

function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white z-30 transform transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div>
            <h1 className="text-lg font-bold leading-tight">Painel da</h1>
            <h1 className="text-lg font-bold leading-tight text-blue-300">Oficina Lima</h1>
          </div>
          <button onClick={onClose} className="lg:hidden text-blue-300 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <nav className="mt-4 px-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg mb-1 transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  return (
    <div className="bg-gray-100 min-h-screen">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="lg:ml-64 min-h-screen flex flex-col">
        <header className="bg-white shadow-sm px-4 py-3 flex items-center gap-3 lg:hidden sticky top-0 z-10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-600 hover:text-gray-900"
          >
            <Menu size={24} />
          </button>
          <span className="font-semibold text-gray-800">Painel da Oficina Lima</span>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

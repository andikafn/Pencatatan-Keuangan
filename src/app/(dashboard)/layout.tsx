"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Button from "@/components/ui/Button"
import NotificationBell from "@/components/NotificationBell"
import ThemeToggle from "@/components/ThemeToggle"
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  PieChart,
  Target,
  BarChart3,
  Tags,
  Bell,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ArrowLeftRight, label: "Transaksi", href: "/transaksi" },
  { icon: Wallet, label: "Dompet", href: "/dompet" },
  { icon: PieChart, label: "Anggaran", href: "/anggaran" },
  { icon: Target, label: "Tabungan", href: "/tabungan" },
  { icon: BarChart3, label: "Laporan", href: "/laporan" },
  { icon: Tags, label: "Kategori", href: "/kategori" },
  { icon: Bell, label: "Pengingat", href: "/pengingat" },
  { icon: Settings, label: "Profil", href: "/profil" },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="md:hidden flex items-center justify-between h-14 px-4 border-b bg-background">
        <button onClick={() => setSidebarOpen(!sidebarOpen)} className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 w-10 hover:bg-accent">
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold text-lg text-primary">Keuanganku</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <NotificationBell />
        </div>
      </div>

      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 bg-black/80 z-40" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        "fixed top-0 left-0 h-screen w-64 border-r bg-background flex flex-col z-50 transition-transform duration-200",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "md:translate-x-0"
      )}>
        <div className="flex h-14 items-center justify-between border-b px-6">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold text-lg">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground text-xs font-bold">K</div>
            <span className="text-primary">Keuanganku</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden rounded-md h-8 w-8 flex items-center justify-center hover:bg-accent">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-auto py-4 px-3">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </div>
        </nav>

        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive" onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        </div>
      </aside>

      <main className="md:ml-64 min-h-screen">
        <header className="hidden md:flex h-14 items-center justify-end gap-1 border-b bg-background px-6">
          <ThemeToggle />
          <NotificationBell />
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}

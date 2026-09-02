"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Bell, AlertCircle, Calendar, CheckCircle2 } from "lucide-react"
import { formatRupiah } from "@/lib/utils"

interface Reminder {
  id: string
  title: string
  amount: number | null
  dueDate: string
  isPaid: boolean
}

export default function NotificationBell() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/reminders")
      if (res.ok) {
        const data = await res.json()
        setReminders(data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
    const interval = setInterval(fetchReminders, 5000)
    window.addEventListener("focus", fetchReminders)
    return () => {
      clearInterval(interval)
      window.removeEventListener("focus", fetchReminders)
    }
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleMarkPaid = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const res = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: true }),
      })
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const unpaidCount = reminders.length

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Notifikasi"
      >
        <Bell className="h-5 w-5" />
        {unpaidCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unpaidCount > 9 ? "9+" : unpaidCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-background shadow-lg z-50 overflow-hidden">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/30">
            <h4 className="font-semibold text-sm flex items-center gap-1.5"><Bell className="h-4 w-4" /> Pengingat & Tagihan</h4>
            <span className="text-xs text-muted-foreground font-medium">
              {unpaidCount} Belum Bayar
            </span>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {loading && reminders.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">Memuat...</div>
            ) : reminders.length === 0 ? (
              <div className="p-6 text-center text-xs text-muted-foreground">
                Tidak ada pengingat pending
              </div>
            ) : (
              reminders.map((rem) => {
                const isOverdue = new Date(rem.dueDate) < new Date()
                return (
                  <div
                    key={rem.id}
                    className="p-3 hover:bg-accent/50 transition-colors flex items-start justify-between gap-2"
                  >
                    <div className="space-y-1">
                      <p className="text-xs font-medium leading-none flex items-center gap-1">
                        {isOverdue && <AlertCircle className="h-3 w-3 text-red-500 shrink-0" />}
                        {rem.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-0.5">
                          <Calendar className="h-3 w-3" /> {new Date(rem.dueDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                        {isOverdue && (
                          <span className="text-red-500 font-semibold">Lewat Jatuh Tempo</span>
                        )}
                      </div>
                      {rem.amount !== null && (
                        <p className="text-xs font-semibold text-primary">
                          {formatRupiah(rem.amount)}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => handleMarkPaid(rem.id, e)}
                      title="Tandai Selesai"
                      className="p-1 rounded-md text-muted-foreground hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  </div>
                )
              })
            )}
          </div>

          <div className="border-t p-2 bg-muted/20 text-center">
            <Link
              href="/pengingat"
              onClick={() => setIsOpen(false)}
              className="text-xs font-medium text-primary hover:underline block py-1"
            >
              Lihat Semua Pengingat
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Card, CardContent } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Plus, Bell, CheckCircle2, Trash2, Calendar } from "lucide-react"

interface Reminder {
  id: string
  title: string
  amount: number | null
  dueDate: string
  type: string
  isPaid: boolean
}

export default function RemindersPage() {
  const [reminders, setReminders] = useState<Reminder[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [dueDate, setDueDate] = useState("")
  const [type, setType] = useState("BILL")
  const [isSaving, setIsSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchReminders = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/reminders?all=${showAll}`)
      if (res.ok) {
        setReminders(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReminders()
  }, [showAll])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/reminders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          amount: amount ? Number(amount) : null,
          dueDate,
          type
        })
      })

      if (res.ok) {
        setIsModalOpen(false)
        setTitle("")
        setAmount("")
        setDueDate("")
        toast.success("Pengingat berhasil ditambahkan")
        fetchReminders()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menambahkan pengingat")
      }
    } catch {
      toast.error("Gagal menambahkan pengingat")
    } finally {
      setIsSaving(false)
    }
  }

  const handleTogglePaid = async (id: string, currentIsPaid: boolean) => {
    try {
      const res = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: !currentIsPaid })
      })

      if (res.ok) {
        toast.success(!currentIsPaid ? "Pengingat ditandai selesai" : "Pengingat ditandai belum selesai")
        fetchReminders()
      }
    } catch {
      toast.error("Gagal memperbarui status pengingat")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/reminders", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      })

      if (res.ok) {
        toast.success("Pengingat berhasil dihapus")
        fetchReminders()
      } else {
        toast.error("Gagal menghapus pengingat")
      }
    } catch {
      toast.error("Gagal menghapus pengingat")
    } finally {
      setDeleteId(null)
    }
  }

  const typeOptions = [
    { value: "BILL", label: "Tagihan Bulanan" },
    { value: "DAILY_LOG", label: "Pencatatan Keuangan" },
    { value: "OTHER", label: "Lainnya" }
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pengingat & Tagihan</h1>
          <p className="text-muted-foreground">Kelola pengingat tagihan dan jadwal pencatatan harian Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Pengingat
        </Button>
      </div>

      <div className="flex items-center justify-between">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showAll}
            onChange={(e) => setShowAll(e.target.checked)}
            className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
          />
          <span className="text-sm font-medium">Tampilkan yang sudah selesai</span>
        </label>
      </div>

      {loading ? (
        <Card><CardContent className="py-12 text-center">Memuat pengingat...</CardContent></Card>
      ) : reminders.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Bell className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Belum ada pengingat</h3>
            <p className="text-sm text-muted-foreground mt-1">Buat pengingat pertama untuk membantu kedisiplinan keuangan Anda.</p>
            <Button className="mt-4" onClick={() => setIsModalOpen(true)}>Tambah Pengingat</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {reminders.map(rem => {
            const isExpired = new Date(rem.dueDate) < new Date() && !rem.isPaid
            return (
              <Card key={rem.id} className={rem.isPaid ? "opacity-60 bg-muted/30" : ""}>
                <CardContent className="flex items-center justify-between py-4 px-6">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleTogglePaid(rem.id, rem.isPaid)}
                      className={`h-6 w-6 rounded-full flex items-center justify-center border transition-colors ${
                        rem.isPaid
                          ? "bg-emerald-500 border-emerald-500 text-white"
                          : "border-input hover:border-primary"
                      }`}
                    >
                      {rem.isPaid && <CheckCircle2 className="h-4 w-4" />}
                    </button>
                    <div>
                      <p className={`font-semibold text-sm ${rem.isPaid ? "line-through" : ""}`}>
                        {rem.title}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(rem.dueDate).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric"
                          })}
                        </span>
                        {isExpired && (
                          <span className="text-red-500 font-medium">Jatuh Tempo!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {rem.amount !== null && (
                      <span className="font-bold text-sm">
                        {formatRupiah(rem.amount)}
                      </span>
                    )}
                    <button
                      onClick={() => setDeleteId(rem.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Pengingat">
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Judul Pengingat / Tagihan"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="misal: Bayar Listrik / Wifi"
          />

          <Select
            label="Tipe Pengingat"
            value={type}
            onChange={(e) => setType(e.target.value)}
            options={typeOptions}
          />

          <Input
            type="number"
            label="Nominal Tagihan (Opsional)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0"
          />

          <Input
            type="date"
            label="Tanggal Jatuh Tempo"
            required
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />

          <Button type="submit" loading={isSaving} className="w-full">Simpan</Button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Pengingat">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus pengingat ini? Tindakan ini tidak dapat dibatalkan.
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>Batal</Button>
            <Button variant="destructive" onClick={handleDelete}>Hapus</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Plus, Trash2, Target } from "lucide-react"

interface Goal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
}

export default function TabunganPage() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [openAdd, setOpenAdd] = useState(false)
  const [openFund, setOpenFund] = useState(false)
  const [name, setName] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [targetDate, setTargetDate] = useState("")
  const [selectedId, setSelectedId] = useState("")
  const [fundAmount, setFundAmount] = useState("")

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/api/saving-goals")
    const data = await res.json()
    setGoals(data)
  }

  useEffect(() => { load() }, [])

  const addGoal = async () => {
    const res = await fetch("/api/saving-goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, targetAmount: Number(targetAmount), targetDate })
    })
    if (res.ok) {
      toast.success("Target tabungan berhasil ditambahkan")
      setOpenAdd(false)
      setName("")
      setTargetAmount("")
      setTargetDate("")
      load()
    } else {
      toast.error("Gagal menambahkan target")
    }
  }

  const addFund = async () => {
    const numAmount = Number(fundAmount)
    const res = await fetch("/api/saving-goals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selectedId, addAmount: numAmount })
    })
    if (res.ok) {
      toast.success(`Dana ${formatRupiah(numAmount)} berhasil ditambahkan`)
      setOpenFund(false)
      setSelectedId("")
      setFundAmount("")
      load()
    } else {
      toast.error("Gagal menambahkan dana")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/saving-goals", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      })
      if (res.ok) {
        toast.success("Target tabungan berhasil dihapus")
        load()
      } else {
        toast.error("Gagal menghapus target tabungan")
      }
    } catch {
      toast.error("Gagal menghapus target tabungan")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tabungan</h1>
          <p className="text-muted-foreground">Pantau progres target tabungan Anda.</p>
        </div>
        <Button onClick={() => setOpenAdd(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Target
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Target className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Belum ada target tabungan</h3>
            <p className="text-sm text-muted-foreground mt-1">Buat target untuk memulai menabung.</p>
            <Button className="mt-4" onClick={() => setOpenAdd(true)}>Tambah Target</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {goals.map(g => {
            const pct = g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0
            const isComplete = pct >= 100
            return (
              <Card key={g.id} className="group relative">
                <button
                  onClick={() => setDeleteId(g.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base font-medium">{g.name}</CardTitle>
                  {isComplete && (
                    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                      Tercapai
                    </span>
                  )}
                </CardHeader>
                <CardContent className="space-y-3">
                  {g.targetDate && (
                    <p className="text-xs text-muted-foreground">
                      Target: {new Date(g.targetDate).toLocaleDateString("id-ID")}
                    </p>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Terkumpul</span>
                    <span className="font-medium">{formatRupiah(g.currentAmount)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full transition-all ${isComplete ? "bg-emerald-500" : "bg-primary"}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{pct.toFixed(1)}%</span>
                    <span>Target: {formatRupiah(g.targetAmount)}</span>
                  </div>
                  {!isComplete && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => { setSelectedId(g.id); setFundAmount(""); setOpenFund(true) }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Tambah Dana
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={openAdd} onClose={() => setOpenAdd(false)} title="Tambah Target">
        <div className="space-y-4">
          <Input label="Nama Goal" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Dana Darurat, Liburan" />
          <Input label="Target Jumlah" type="number" placeholder="0" value={targetAmount} onChange={e => setTargetAmount(e.target.value)} />
          <Input label="Tanggal Target (Opsional)" type="date" value={targetDate} onChange={e => setTargetDate(e.target.value)} />
          <Button onClick={addGoal} disabled={!name || Number(targetAmount) <= 0} className="w-full">Simpan</Button>
        </div>
      </Modal>

      <Modal isOpen={openFund} onClose={() => setOpenFund(false)} title="Tambah Dana">
        <div className="space-y-4">
          <Input label="Jumlah Tambahan" type="number" placeholder="0" value={fundAmount} onChange={e => setFundAmount(e.target.value)} />
          <Button onClick={addFund} disabled={Number(fundAmount) <= 0} className="w-full">Simpan</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Target Tabungan">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus target tabungan ini? Tindakan ini tidak dapat dibatalkan.
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

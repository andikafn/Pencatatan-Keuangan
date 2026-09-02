"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Plus, Trash2, PieChart } from "lucide-react"

interface Budget {
  id: string
  categoryId: string
  categoryName: string
  amount: number
  spent: number
}

interface Category {
  id: string
  name: string
  type: string
}

export default function AnggaranPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [month, setMonth] = useState(new Date().getMonth() + 1)
  const [year, setYear] = useState(new Date().getFullYear())
  const [open, setOpen] = useState(false)
  const [categoryId, setCategoryId] = useState("")
  const [amount, setAmount] = useState("")

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("id-ID", { month: "long" })
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }))

  const load = async () => {
    const resB = await fetch(`/api/budgets?month=${month}&year=${year}`)
    const dataB = await resB.json()
    setBudgets(dataB)
    const resC = await fetch("/api/categories")
    const dataC = await resC.json()
    setCategories(dataC.filter((c: Category) => c.type === "EXPENSE"))
  }

  useEffect(() => { load() }, [month, year])

  const addBudget = async () => {
    const res = await fetch("/api/budgets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ categoryId, amount: Number(amount), month, year })
    })
    if (res.ok) {
      toast.success("Anggaran berhasil disimpan")
      setOpen(false)
      setCategoryId("")
      setAmount("")
      load()
    } else {
      toast.error("Gagal menyimpan anggaran")
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/budgets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      })
      if (res.ok) {
        toast.success("Anggaran berhasil dihapus")
        load()
      } else {
        toast.error("Gagal menghapus anggaran")
      }
    } catch {
      toast.error("Gagal menghapus anggaran")
    } finally {
      setDeleteId(null)
    }
  }

  const availableCategories = categories.filter(c => !budgets.find(b => b.categoryId === c.id))

  useEffect(() => {
    if (open && availableCategories.length > 0 && !categoryId) {
      setCategoryId(availableCategories[0].id)
    }
  }, [open, availableCategories, categoryId])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Anggaran</h1>
          <p className="text-muted-foreground">Kelola anggaran bulanan per kategori.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Anggaran
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select options={months} value={month.toString()} onChange={e => setMonth(Number(e.target.value))} />
            <Select options={years} value={year.toString()} onChange={e => setYear(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <PieChart className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Belum ada anggaran</h3>
            <p className="text-sm text-muted-foreground mt-1">Buat anggaran untuk mengontrol pengeluaran Anda.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>Tambah Anggaran</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {budgets.map(b => {
            const pct = b.amount > 0 ? (b.spent / b.amount) * 100 : 0
            let barColor = "bg-emerald-500"
            if (pct >= 80 && pct <= 100) barColor = "bg-amber-500"
            if (pct > 100) barColor = "bg-red-500"
            return (
              <Card key={b.id} className="group relative">
                <button
                  onClick={() => setDeleteId(b.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{b.categoryName}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Terpakai: {formatRupiah(b.spent)}</span>
                    <span className="text-muted-foreground">Sisa: {formatRupiah(b.amount - b.spent)}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div className={`h-full transition-all ${barColor}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                  <p className="text-right text-xs text-muted-foreground">
                    {pct.toFixed(1)}% dari {formatRupiah(b.amount)}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Tambah Anggaran">
        <div className="space-y-4">
          <Select label="Kategori" value={categoryId} onChange={e => setCategoryId(e.target.value)} options={availableCategories.map(c => ({ value: c.id, label: c.name }))} placeholder="Pilih Kategori" />
          <Input label="Jumlah Anggaran" type="number" placeholder="0" value={amount} onChange={e => setAmount(e.target.value)} />
          <Button onClick={addBudget} disabled={!categoryId || Number(amount) <= 0} className="w-full">Simpan</Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Anggaran">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus anggaran ini? Tindakan ini tidak dapat dibatalkan.
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

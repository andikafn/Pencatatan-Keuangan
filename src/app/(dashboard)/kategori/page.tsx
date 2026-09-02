"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { Plus, Trash2, Tag } from "lucide-react"

interface Category {
  id: string
  name: string
  type: "INCOME" | "EXPENSE"
  icon: string | null
  color: string | null
  isDefault: boolean
}

const COMMON_ICONS = [
  "🍔", "🍕", "🍜", "☕", "🛒", "🛍️", "🚗", "🛵", "⛽", "🚌", "🏠", "⚡", "💧", "📶", "🏥", "💊",
  "🎬", "🎮", "📚", "✈️", "👔", "👗", "💰", "📈", "🎁", "💼", "💵", "💳", "🏦", "👶", "🐾", "📁"
]

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE")
  const [icon, setIcon] = useState("📁")
  const [isSaving, setIsSaving] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const res = await fetch("/api/categories")
      if (res.ok) {
        setCategories(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCategories()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, icon })
      })

      if (res.ok) {
        setIsModalOpen(false)
        setName("")
        setIcon("📁")
        toast.success("Kategori berhasil ditambahkan")
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menambahkan kategori")
      }
    } catch {
      toast.error("Gagal menambahkan kategori")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/categories", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      })

      if (res.ok) {
        toast.success("Kategori berhasil dihapus")
        fetchCategories()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus kategori")
      }
    } catch {
      toast.error("Gagal menghapus kategori")
    } finally {
      setDeleteId(null)
    }
  }

  const expenseCategories = categories.filter(c => c.type === "EXPENSE")
  const incomeCategories = categories.filter(c => c.type === "INCOME")

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategori</h1>
          <p className="text-muted-foreground">Kelola kategori pengeluaran dan pemasukan Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kategori
        </Button>
      </div>

      {loading ? (
        <div className="grid gap-6 md:grid-cols-2">
          <Card><CardContent className="py-8 text-center">Memuat kategori...</CardContent></Card>
          <Card><CardContent className="py-8 text-center">Memuat kategori...</CardContent></Card>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori Pengeluaran
              </CardTitle>
              <CardDescription>Kategori yang digunakan untuk mencatat pengeluaran</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {expenseCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada kategori pengeluaran</p>
              ) : (
                expenseCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon || "📁"}</span>
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-emerald-600 flex items-center gap-2">
                <Tag className="h-5 w-5" />
                Kategori Pemasukan
              </CardTitle>
              <CardDescription>Kategori yang digunakan untuk mencatat pemasukan</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {incomeCategories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">Belum ada kategori pemasukan</p>
              ) : (
                incomeCategories.map(cat => (
                  <div key={cat.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{cat.icon || "📁"}</span>
                      <span className="font-medium text-sm">{cat.name}</span>
                    </div>
                    <button
                      onClick={() => setDeleteId(cat.id)}
                      className="p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Kategori">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex rounded-md border p-1">
            {(["EXPENSE", "INCOME"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition-colors ${
                  type === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </button>
            ))}
          </div>

          <Input
            label="Nama Kategori"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="misal: Makanan & Minuman"
          />

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Ikon</label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md max-h-32 overflow-y-auto">
              {COMMON_ICONS.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIcon(i)}
                  className={`h-9 w-9 rounded text-lg flex items-center justify-center transition-colors ${
                    icon === i ? "bg-primary/20 border-2 border-primary" : "hover:bg-accent"
                  }`}
                >
                  {i}
                </button>
              ))}
            </div>
          </div>

          <Button type="submit" loading={isSaving} className="w-full">Simpan</Button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Kategori">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan.
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

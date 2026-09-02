"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Modal from "@/components/ui/Modal"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Plus, Trash2, Search } from "lucide-react"

interface Wallet {
  id: string
  name: string
}

interface Category {
  id: string
  name: string
  icon: string
  type: string
}

interface Transaction {
  id: string
  amount: number
  type: "INCOME" | "EXPENSE" | "TRANSFER"
  date: string
  notes: string | null
  wallet: Wallet
  category: Category | null
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  const [filterMonth, setFilterMonth] = useState((new Date().getMonth() + 1).toString())
  const [filterYear, setFilterYear] = useState(new Date().getFullYear().toString())
  const [filterType, setFilterType] = useState("")
  const [searchQuery, setSearchQuery] = useState("")

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [txType, setTxType] = useState<"INCOME" | "EXPENSE" | "TRANSFER">("EXPENSE")
  const [amount, setAmount] = useState("")
  const [walletId, setWalletId] = useState("")
  const [toWalletId, setToWalletId] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [notes, setNotes] = useState("")
  const [isRecurring, setIsRecurring] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const query = new URLSearchParams()
      if (filterMonth) query.append("month", filterMonth)
      if (filterYear) query.append("year", filterYear)
      if (filterType) query.append("type", filterType)
      const res = await fetch(`/api/transactions?${query.toString()}`)
      if (res.ok) setTransactions(await res.json())
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTransactions() }, [filterMonth, filterYear, filterType])

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [wRes, cRes] = await Promise.all([fetch("/api/wallets"), fetch("/api/categories")])
        if (wRes.ok) setWallets(await wRes.json())
        if (cRes.ok) setCategories(await cRes.json())
      } catch (error) {
        console.error(error)
      }
    }
    fetchInitialData()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId,
          toWalletId: txType === "TRANSFER" ? toWalletId : undefined,
          categoryId: txType !== "TRANSFER" ? categoryId : undefined,
          type: txType,
          amount: Number(amount),
          date,
          notes,
          isRecurring
        })
      })
      if (res.ok) {
        setIsModalOpen(false)
        setAmount("")
        setNotes("")
        toast.success("Transaksi berhasil disimpan")
        fetchTransactions()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menyimpan transaksi")
      }
    } catch {
      toast.error("Gagal menyimpan transaksi")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/transactions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      })
      if (res.ok) {
        toast.success("Transaksi berhasil dihapus")
        fetchTransactions()
      } else {
        toast.error("Gagal menghapus transaksi")
      }
    } catch {
      toast.error("Gagal menghapus transaksi")
    } finally {
      setDeleteId(null)
    }
  }

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: (i + 1).toString(),
    label: new Date(0, i).toLocaleString("id-ID", { month: "long" })
  }))

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => ({
    value: (currentYear - i).toString(),
    label: (currentYear - i).toString()
  }))

  const types = [
    { value: "", label: "Semua Tipe" },
    { value: "INCOME", label: "Pemasukan" },
    { value: "EXPENSE", label: "Pengeluaran" },
    { value: "TRANSFER", label: "Transfer" }
  ]

  const filteredCategories = categories.filter(c => c.type === txType)

  const filteredTransactions = transactions.filter(tx => {
    if (!searchQuery) return true
    const q = searchQuery.toLowerCase()
    const catName = tx.category?.name?.toLowerCase() || ""
    const walletName = tx.wallet?.name?.toLowerCase() || ""
    const notes = tx.notes?.toLowerCase() || ""
    return catName.includes(q) || walletName.includes(q) || notes.includes(q)
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi</h1>
          <p className="text-muted-foreground">Riwayat transaksi keuangan Anda.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari transaksi berdasarkan kategori, catatan, dompet..."
              className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Select options={months} value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} />
            <Select options={years} value={filterYear} onChange={(e) => setFilterYear(e.target.value)} />
            <Select options={types} value={filterType} onChange={(e) => setFilterType(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="py-4 px-6">
                <div className="flex items-center gap-4 animate-pulse">
                  <div className="h-10 w-10 rounded-full bg-muted" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="h-3 w-48 bg-muted rounded" />
                  </div>
                  <div className="h-4 w-24 bg-muted rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredTransactions.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              {searchQuery ? <Search className="h-6 w-6 text-muted-foreground" /> : <Plus className="h-6 w-6 text-muted-foreground" />}
            </div>
            <h3 className="font-medium">{searchQuery ? "Tidak ada hasil" : "Belum ada transaksi"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? `Tidak ditemukan transaksi untuk "${searchQuery}"` : "Mulai catat transaksi pertama Anda."}
            </p>
            {!searchQuery && <Button className="mt-4" onClick={() => setIsModalOpen(true)}>Tambah Transaksi</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredTransactions.map(tx => (
            <Card key={tx.id} className="group">
              <CardContent className="flex items-center justify-between py-4 px-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-lg">
                    {tx.type !== "TRANSFER" && tx.category ? tx.category.icon : "~"}
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {tx.type === "TRANSFER" ? "Transfer" : tx.category?.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tx.wallet.name} &middot; {new Date(tx.date).toLocaleDateString("id-ID")}
                    </p>
                    {tx.notes && <p className="text-xs text-muted-foreground mt-0.5">{tx.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-semibold text-sm ${
                    tx.type === "INCOME" ? "text-emerald-600" : tx.type === "EXPENSE" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                    {formatRupiah(tx.amount)}
                  </span>
                  <button
                    onClick={() => setDeleteId(tx.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Tambah Transaksi">
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex rounded-md border p-1">
            {(["EXPENSE", "INCOME", "TRANSFER"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTxType(t)}
                className={`flex-1 rounded-sm py-1.5 text-sm font-medium transition-colors ${
                  txType === t ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "EXPENSE" ? "Pengeluaran" : t === "INCOME" ? "Pemasukan" : "Transfer"}
              </button>
            ))}
          </div>
          <Input type="number" label="Jumlah" required value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0" />
          <Select label="Dompet" required value={walletId} onChange={(e) => setWalletId(e.target.value)} options={wallets.map(w => ({ value: w.id, label: w.name }))} placeholder="Pilih dompet..." />
          {txType === "TRANSFER" && (
            <Select label="Dompet Tujuan" required value={toWalletId} onChange={(e) => setToWalletId(e.target.value)} options={wallets.map(w => ({ value: w.id, label: w.name }))} placeholder="Pilih dompet tujuan..." />
          )}
          {txType !== "TRANSFER" && (
            <Select label="Kategori" required value={categoryId} onChange={(e) => setCategoryId(e.target.value)} options={filteredCategories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))} placeholder="Pilih kategori..." />
          )}
          <Input type="date" label="Tanggal" required value={date} onChange={(e) => setDate(e.target.value)} />
          <div className="grid w-full gap-1.5">
            <label className="text-sm font-medium leading-none">Catatan</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Catatan opsional..."
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="h-4 w-4 rounded border-input text-primary focus:ring-primary" />
            <span className="text-sm">Transaksi berulang</span>
          </label>
          <Button type="submit" loading={isSaving} className="w-full">Simpan</Button>
        </form>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Transaksi">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus transaksi ini? Saldo dompet akan dikembalikan. Tindakan ini tidak dapat dibatalkan.
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

"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import Modal from "@/components/ui/Modal"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Plus, Trash2, Wallet as WalletIcon, Banknote, Smartphone, CreditCard, HelpCircle } from "lucide-react"

interface Wallet {
  id: string
  name: string
  type: string
  balance: number
}

const walletIcon = (t: string) => {
  switch (t) {
    case "CASH": return <Banknote className="h-5 w-5" />
    case "BANK": return <WalletIcon className="h-5 w-5" />
    case "EWALLET": return <Smartphone className="h-5 w-5" />
    case "CREDIT": return <CreditCard className="h-5 w-5" />
    default: return <HelpCircle className="h-5 w-5" />
  }
}

const walletLabel = (t: string) => {
  switch (t) {
    case "CASH": return "Tunai"
    case "BANK": return "Bank"
    case "EWALLET": return "E-Wallet"
    case "CREDIT": return "Kartu Kredit"
    default: return t
  }
}

export default function DompetPage() {
  const [wallets, setWallets] = useState<Wallet[]>([])
  const [total, setTotal] = useState(0)
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [type, setType] = useState("CASH")
  const [balance, setBalance] = useState<string>("")

  const [openTopUp, setOpenTopUp] = useState(false)
  const [selectedWallet, setSelectedWallet] = useState<Wallet | null>(null)
  const [topUpAmount, setTopUpAmount] = useState<string>("")
  const [topUpNotes, setTopUpNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  const [deleteId, setDeleteId] = useState<string | null>(null)

  const load = async () => {
    const res = await fetch("/api/wallets")
    const data: Wallet[] = await res.json()
    setWallets(data)
    setTotal(data.reduce((a, w) => a + w.balance, 0))
  }

  useEffect(() => { load() }, [])

  const addWallet = async () => {
    const res = await fetch("/api/wallets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, balance: Number(balance) || 0 })
    })
    if (res.ok) {
      toast.success("Dompet berhasil ditambahkan")
      setOpen(false)
      setName("")
      setType("CASH")
      setBalance("")
      load()
    } else {
      toast.error("Gagal menambahkan dompet")
    }
  }

  const handleTopUp = async () => {
    const numAmount = Number(topUpAmount)
    if (!selectedWallet || numAmount <= 0) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          walletId: selectedWallet.id,
          type: "INCOME",
          amount: numAmount,
          date: new Date().toISOString().split("T")[0],
          notes: topUpNotes || `Tambah dana ke ${selectedWallet.name}`,
          isRecurring: false,
        })
      })
      if (res.ok) {
        toast.success(`Dana ${formatRupiah(numAmount)} berhasil ditambahkan`)
        setOpenTopUp(false)
        setSelectedWallet(null)
        setTopUpAmount("")
        setTopUpNotes("")
        load()
      } else {
        toast.error("Gagal menambahkan dana")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return
    try {
      const res = await fetch("/api/wallets", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deleteId })
      })
      if (res.ok) {
        toast.success("Dompet berhasil dihapus")
        load()
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal menghapus dompet")
      }
    } catch {
      toast.error("Gagal menghapus dompet")
    } finally {
      setDeleteId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dompet</h1>
          <p className="text-muted-foreground">Kelola semua dompet dan saldo Anda.</p>
        </div>
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Dompet
        </Button>
      </div>

      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium opacity-80">Total Saldo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{formatRupiah(total)}</div>
        </CardContent>
      </Card>

      {wallets.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <WalletIcon className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="font-medium">Belum ada dompet</h3>
            <p className="text-sm text-muted-foreground mt-1">Tambahkan dompet pertama Anda.</p>
            <Button className="mt-4" onClick={() => setOpen(true)}>Tambah Dompet</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {wallets.map(w => (
            <Card key={w.id} className="group relative">
              <button
                onClick={() => setDeleteId(w.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                    {walletIcon(w.type)}
                  </div>
                  <div>
                    <CardTitle className="text-sm font-medium">{w.name}</CardTitle>
                    <p className="text-xs text-muted-foreground">{walletLabel(w.type)}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-2xl font-bold">{formatRupiah(w.balance)}</div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedWallet(w)
                    setTopUpAmount("")
                    setTopUpNotes("")
                    setOpenTopUp(true)
                  }}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Tambah Dana
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Tambah Dompet">
        <div className="space-y-4">
          <Input label="Nama" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: BCA, Tunai, GoPay" />
          <Select label="Tipe" value={type} onChange={e => setType(e.target.value)} options={[
            { value: "CASH", label: "Tunai" },
            { value: "BANK", label: "Bank" },
            { value: "EWALLET", label: "E-Wallet" },
            { value: "CREDIT", label: "Kartu Kredit" },
          ]} />
          <Input label="Saldo Awal" type="number" placeholder="0" value={balance} onChange={e => setBalance(e.target.value)} />
          <Button onClick={addWallet} disabled={!name} className="w-full">Simpan</Button>
        </div>
      </Modal>

      <Modal isOpen={openTopUp} onClose={() => setOpenTopUp(false)} title={`Tambah Dana \u2014 ${selectedWallet?.name}`}>
        <div className="space-y-4">
          <div className="rounded-md bg-muted p-3 text-sm">
            Saldo saat ini: <span className="font-semibold">{formatRupiah(selectedWallet?.balance ?? 0)}</span>
          </div>
          <Input label="Jumlah Dana" type="number" value={topUpAmount} onChange={e => setTopUpAmount(e.target.value)} placeholder="0" />
          <div className="grid w-full gap-1.5">
            <label className="text-sm font-medium leading-none">Catatan (opsional)</label>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 resize-none"
              value={topUpNotes}
              onChange={e => setTopUpNotes(e.target.value)}
              placeholder={`Tambah dana ke ${selectedWallet?.name}`}
            />
          </div>
          <Button onClick={handleTopUp} disabled={!topUpAmount || Number(topUpAmount) <= 0} loading={isSaving} className="w-full">
            Simpan
          </Button>
        </div>
      </Modal>

      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Hapus Dompet">
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Apakah Anda yakin ingin menghapus dompet ini? Semua transaksi terkait juga akan dihapus. Tindakan ini tidak dapat dibatalkan.
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

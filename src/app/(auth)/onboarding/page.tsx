"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import Select from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"

const WALLET_TYPES = [
  { value: "CASH", label: "💵 Tunai" },
  { value: "BANK", label: "🏦 Rekening Bank" },
  { value: "EWALLET", label: "📱 E-Wallet" },
  { value: "CREDIT", label: "💳 Kartu Kredit" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [walletName, setWalletName] = useState("")
  const [walletType, setWalletType] = useState("CASH")
  const [walletBalance, setWalletBalance] = useState("")
  const [loading, setLoading] = useState(false)

  const handleCreateWallet = async () => {
    if (!walletName) {
      toast.error("Nama dompet wajib diisi")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/wallets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: walletName,
          type: walletType,
          balance: Number(walletBalance) || 0,
        }),
      })

      if (res.ok) {
        setStep(3)
      } else {
        const data = await res.json()
        toast.error(data.error || "Gagal membuat dompet")
      }
    } catch {
      toast.error("Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  const handleFinish = () => {
    router.push("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 flex items-center gap-2">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">K</div>
        <h1 className="text-3xl font-bold text-primary">Keuanganku</h1>
      </div>

      <div className="flex items-center gap-2 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold ${
              step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}>
              {step > s ? "✓" : s}
            </div>
            {s < 3 && <div className={`w-12 h-0.5 ${step > s ? "bg-primary" : "bg-muted"}`} />}
          </div>
        ))}
      </div>

      {step === 1 && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">👋</div>
            <CardTitle className="text-2xl">Selamat Datang!</CardTitle>
            <CardDescription>
              Mari siapkan akun keuangan Anda dalam beberapa langkah sederhana.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <span className="text-lg">📝</span>
                <span>Catat transaksi pemasukan & pengeluaran harian</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">📊</span>
                <span>Lihat laporan visual untuk memahami arus kas</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🎯</span>
                <span>Buat anggaran dan target tabungan</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">🔔</span>
                <span>Terima pengingat tagihan dan jadwal pembayaran</span>
              </div>
            </div>
            <Button className="w-full" onClick={() => setStep(2)}>
              Mulai Sekarang
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 2 && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">💰</div>
            <CardTitle className="text-2xl">Buat Dompet Pertama</CardTitle>
            <CardDescription>
              Tambahkan dompet atau rekening yang ingin Anda kelola.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Nama Dompet"
              value={walletName}
              onChange={(e) => setWalletName(e.target.value)}
              placeholder="misal: Tunai, BCA, GoPay"
              required
            />
            <Select
              label="Tipe Dompet"
              value={walletType}
              onChange={(e) => setWalletType(e.target.value)}
              options={WALLET_TYPES}
            />
            <Input
              label="Saldo Awal (Opsional)"
              type="number"
              value={walletBalance}
              onChange={(e) => setWalletBalance(e.target.value)}
              placeholder="0"
            />
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setStep(1)}>
                Kembali
              </Button>
              <Button className="flex-1" onClick={handleCreateWallet} loading={loading}>
                Buat Dompet
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 3 && (
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="text-5xl mb-4">🎉</div>
            <CardTitle className="text-2xl">Semua Siap!</CardTitle>
            <CardDescription>
              Akun Anda sudah siap digunakan. Mulailah mencatat keuangan Anda sekarang.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" onClick={handleFinish}>
              Masuk ke Dashboard
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

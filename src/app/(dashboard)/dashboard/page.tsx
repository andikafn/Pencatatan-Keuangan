"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Wallet, TrendingUp, TrendingDown, DollarSign, Target, Bell, AlertCircle, CheckCircle2, Calendar } from "lucide-react"

interface WalletData {
  id: string
  name: string
  balance: number
}

interface ReportData {
  income?: number
  expense?: number
  totalIncome?: number
  totalExpense?: number
}

interface Transaction {
  id: string
  title?: string
  amount: number
  type: "INCOME" | "EXPENSE" | "TRANSFER" | string
  date: string
  category?: { name: string; icon?: string } | string
  wallet?: { name: string }
  notes?: string | null
}

interface SavingGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate?: string
}

interface Reminder {
  id: string
  title: string
  amount: number | null
  dueDate: string
  isPaid: boolean
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [totalBalance, setTotalBalance] = useState(0)
  const [income, setIncome] = useState(0)
  const [expense, setExpense] = useState(0)
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([])
  const [savingGoals, setSavingGoals] = useState<SavingGoal[]>([])
  const [reminders, setReminders] = useState<Reminder[]>([])

  const handleMarkPaid = async (id: string) => {
    try {
      const res = await fetch("/api/reminders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isPaid: true }),
      })
      if (res.ok) {
        setReminders((prev) => prev.filter((r) => r.id !== id))
        toast.success("Tagihan ditandai selesai")
      }
    } catch {
      toast.error("Gagal memperbarui tagihan")
    }
  }

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const now = new Date()
        const currentMonth = now.getMonth() + 1
        const currentYear = now.getFullYear()

        const [walletsRes, reportsRes, transactionsRes, savingsRes, remindersRes] = await Promise.all([
          fetch("/api/wallets"),
          fetch(`/api/reports?month=${currentMonth}&year=${currentYear}`),
          fetch("/api/transactions"),
          fetch("/api/saving-goals"),
          fetch("/api/reminders")
        ])

        if (remindersRes.ok) {
          const remindersData: Reminder[] = await remindersRes.json()
          setReminders(remindersData)

          const overdue = remindersData.filter(r => new Date(r.dueDate) <= new Date())
          if (overdue.length > 0) {
            toast.warning(`Ada ${overdue.length} pengingat/tagihan yang telah atau jatuh tempo hari ini!`, {
              duration: 6000,
            })
          }
        }

        if (savingsRes.ok) {
          const savingsData = await savingsRes.json()
          setSavingGoals(Array.isArray(savingsData) ? savingsData : [])
        }

        if (walletsRes.ok) {
          const walletsData = await walletsRes.json()
          const total = Array.isArray(walletsData)
            ? walletsData.reduce((acc: number, w: WalletData) => acc + (w.balance || 0), 0)
            : walletsData.totalBalance || 0
          setTotalBalance(total)
        }

        if (reportsRes.ok) {
          const reportsData: ReportData = await reportsRes.json()
          setIncome(reportsData.income ?? reportsData.totalIncome ?? 0)
          setExpense(reportsData.expense ?? reportsData.totalExpense ?? 0)
        }

        if (transactionsRes.ok) {
          const txData = await transactionsRes.json()
          const list = Array.isArray(txData) ? txData : txData.transactions || []
          setRecentTransactions(list.slice(0, 5))
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-muted-foreground">Memuat data...</div>
      </div>
    )
  }

  const netBalance = income - expense

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Ringkasan keuangan Anda bulan ini.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Saldo</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatRupiah(totalBalance)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pemasukan Bulan Ini</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupiah(income)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pengeluaran Bulan Ini</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(expense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netBalance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatRupiah(netBalance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">Belum ada transaksi.</p>
            ) : (
              <div className="space-y-4">
                {recentTransactions.map((tx) => {
                  let catName = ""
                  let catIcon = ""
                  if (typeof tx.category === "object" && tx.category !== null) {
                    catName = tx.category.name
                    catIcon = tx.category.icon || ""
                  } else if (tx.type === "TRANSFER") {
                    catName = "Transfer"
                  } else if (tx.type === "INCOME") {
                    catName = tx.notes || "Pemasukan"
                  } else if (tx.type === "EXPENSE") {
                    catName = tx.notes || "Pengeluaran"
                  } else {
                    catName = tx.title || tx.notes || "Transaksi"
                  }
                  return (
                    <div key={tx.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm">
                          {catIcon || (tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : "~")}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{catName}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {tx.wallet?.name && <>{tx.wallet.name} &middot; </>}
                            {new Date(tx.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-sm font-medium ${
                        tx.type === "INCOME" ? "text-emerald-600" : tx.type === "EXPENSE" ? "text-red-600" : "text-blue-600"
                      }`}>
                        {tx.type === "INCOME" ? "+" : tx.type === "EXPENSE" ? "-" : ""}
                        {formatRupiah(Math.abs(tx.amount))}
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Tagihan Mendatang</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {reminders.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Tidak ada tagihan tertunda.</p>
              ) : (
                <div className="space-y-3">
                  {reminders.slice(0, 4).map((rem) => {
                    const isOverdue = new Date(rem.dueDate) < new Date()
                    return (
                      <div key={rem.id} className="flex items-center justify-between group">
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none flex items-center gap-1.5">
                            {isOverdue && <AlertCircle className="h-3.5 w-3.5 text-red-500" />}
                            {rem.title}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(rem.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                            {rem.amount !== null && (
                              <span className="font-semibold text-primary">{formatRupiah(rem.amount)}</span>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleMarkPaid(rem.id)}
                          className="h-8 w-8 flex items-center justify-center rounded-md border bg-background hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-colors opacity-0 group-hover:opacity-100"
                          title="Tandai Selesai"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    )
                  })}
                  {reminders.length > 4 && (
                    <Link href="/pengingat" className="text-xs font-medium text-primary hover:underline block text-center pt-2">
                      Lihat {reminders.length - 4} tagihan lainnya...
                    </Link>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">Target Tabungan</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {savingGoals.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">Belum ada target tabungan.</p>
              ) : (
                <div className="space-y-4">
                  {savingGoals.map((g) => {
                    const pct = g.targetAmount > 0 ? Math.min((g.currentAmount / g.targetAmount) * 100, 100) : 0
                    return (
                      <div key={g.id} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{g.name}</span>
                          <span className="text-xs text-muted-foreground">{pct.toFixed(0)}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                          <div className="h-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{formatRupiah(g.currentAmount)}</span>
                          <span>{formatRupiah(g.targetAmount)}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

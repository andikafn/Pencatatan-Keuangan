"use client"

import { useEffect, useState } from "react"
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts"
import Button from "@/components/ui/Button"
import Select from "@/components/ui/Select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { formatRupiah } from "@/lib/utils"
import { Download, FileText, TrendingUp, TrendingDown, DollarSign } from "lucide-react"

interface ReportData {
  totalIncome: number
  totalExpense: number
  balance: number
  categoryBreakdown: {
    categoryId: string
    categoryName: string
    categoryColor: string
    total: number
  }[]
  dailyTrend: {
    date: string
    income: number
    expense: number
  }[]
}

interface Transaction {
  date: string
  type: string
  category?: { name: string }
  wallet: { name: string }
  amount: number
  notes?: string
}

export default function LaporanPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)

  const months = [
    "Januari","Februari","Maret","April","Mei","Juni",
    "Juli","Agustus","September","Oktober","November","Desember",
  ]

  const monthOptions = months.map((m, i) => ({ value: (i + 1).toString(), label: m }))
  const yearOptions = [2024, 2025, 2026, 2027].map(y => ({ value: y.toString(), label: y.toString() }))

  const load = async () => {
    setLoading(true)
    const res = await fetch(`/api/reports?month=${month}&year=${year}`)
    const d = await res.json()
    setData(d)
    setLoading(false)
  }

  useEffect(() => { load() }, [month, year])

  const exportCsv = async () => {
    const res = await fetch(`/api/transactions?month=${month}&year=${year}`)
    const txs: Transaction[] = await res.json()
    const escape = (val: string) => `"${val.replace(/"/g, '""')}"`
    const tipeLabel = (t: string) => t === "INCOME" ? "Pemasukan" : t === "EXPENSE" ? "Pengeluaran" : "Transfer"
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
    const header = ["Tanggal", "Tipe", "Kategori", "Dompet", "Jumlah (Rp)", "Catatan"].map(escape).join(",")
    const rows = txs.map((t) => [
      escape(fmtDate(t.date)), escape(tipeLabel(t.type)), escape(t.category?.name || "-"),
      escape(t.wallet.name), t.amount.toString(), escape(t.notes || "-"),
    ].join(","))
    const jumlahTotal = txs.reduce((acc, t) => {
      if (t.type === "INCOME") return acc + t.amount
      if (t.type === "EXPENSE") return acc - t.amount
      return acc
    }, 0)
    const summary = ["", "", escape(`Total Transaksi: ${txs.length}`), "", jumlahTotal.toString(), ""].join(",")
    const BOM = "\uFEFF"
    const csv = BOM + [header, ...rows, "", summary].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `laporan_${months[month - 1]}_${year}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = async () => {
    const res = await fetch(`/api/transactions?month=${month}&year=${year}`)
    const txs: Transaction[] = await res.json()
    const tipeLabel = (t: string) => t === "INCOME" ? "Pemasukan" : t === "EXPENSE" ? "Pengeluaran" : "Transfer"
    const fmtDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })

    const totalIncome = txs.filter(t => t.type === "INCOME").reduce((a, t) => a + t.amount, 0)
    const totalExpense = txs.filter(t => t.type === "EXPENSE").reduce((a, t) => a + t.amount, 0)

    const rowsHtml = txs.map(t => `
      <tr>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${fmtDate(t.date)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${tipeLabel(t.type)}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${t.category?.name || "-"}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${t.wallet.name}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb;text-align:right;color:${t.type === "INCOME" ? "#16a34a" : t.type === "EXPENSE" ? "#dc2626" : "#2563eb"}">${t.type === "INCOME" ? "+" : t.type === "EXPENSE" ? "-" : ""}Rp ${t.amount.toLocaleString("id-ID")}</td>
        <td style="padding:6px 10px;border-bottom:1px solid #e5e7eb">${t.notes || "-"}</td>
      </tr>
    `).join("")

    const html = `
      <!DOCTYPE html>
      <html><head><title>Laporan Keuangan - ${months[month - 1]} ${year}</title>
      <style>
        body{font-family:system-ui,sans-serif;margin:40px;color:#1f2937}
        h1{font-size:22px;margin-bottom:4px}
        .sub{color:#6b7280;font-size:13px;margin-bottom:24px}
        .summary{display:flex;gap:24px;margin-bottom:24px}
        .summary-item{padding:12px 16px;border-radius:8px;border:1px solid #e5e7eb;min-width:160px}
        .summary-item .label{font-size:12px;color:#6b7280}
        .summary-item .value{font-size:18px;font-weight:700;margin-top:2px}
        table{width:100%;border-collapse:collapse;font-size:13px}
        th{text-align:left;padding:8px 10px;border-bottom:2px solid #d1d5db;font-weight:600;font-size:12px;color:#6b7280;text-transform:uppercase}
        @media print{body{margin:20px}}
      </style></head><body>
        <h1>Laporan Keuangan</h1>
        <p class="sub">${months[month - 1]} ${year} &middot; ${txs.length} transaksi</p>
        <div class="summary">
          <div class="summary-item"><div class="label">Pemasukan</div><div class="value" style="color:#16a34a">Rp ${totalIncome.toLocaleString("id-ID")}</div></div>
          <div class="summary-item"><div class="label">Pengeluaran</div><div class="value" style="color:#dc2626">Rp ${totalExpense.toLocaleString("id-ID")}</div></div>
          <div class="summary-item"><div class="label">Saldo Bersih</div><div class="value" style="color:${totalIncome - totalExpense >= 0 ? "#16a34a" : "#dc2626"}">Rp ${(totalIncome - totalExpense).toLocaleString("id-ID")}</div></div>
        </div>
        <table><thead><tr>
          <th>Tanggal</th><th>Tipe</th><th>Kategori</th><th>Dompet</th><th style="text-align:right">Jumlah</th><th>Catatan</th>
        </tr></thead><tbody>${rowsHtml}</tbody></table>
        <script>window.onload=function(){window.print()}</script>
      </body></html>
    `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(html)
      printWindow.document.close()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Memuat data...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Tidak ada data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan</h1>
          <p className="text-muted-foreground">Analisis keuangan Anda.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCsv}>
            <Download className="mr-2 h-4 w-4" />
            CSV
          </Button>
          <Button variant="outline" onClick={exportPdf}>
            <FileText className="mr-2 h-4 w-4" />
            PDF
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <Select options={monthOptions} value={month.toString()} onChange={(e) => setMonth(Number(e.target.value))} />
            <Select options={yearOptions} value={year.toString()} onChange={(e) => setYear(Number(e.target.value))} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemasukan</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupiah(data.totalIncome)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengeluaran</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupiah(data.totalExpense)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Bersih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {formatRupiah(data.balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Pengeluaran per Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            {data.categoryBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={data.categoryBreakdown}
                    dataKey="total"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ categoryName, percent }) => `${categoryName} ${(percent * 100).toFixed(0)}%`}
                  >
                    {data.categoryBreakdown.map((entry, index) => (
                      <Cell key={index} fill={entry.categoryColor || "#6b7280"} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10 text-sm">Belum ada data pengeluaran</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Tren Harian</CardTitle>
          </CardHeader>
          <CardContent>
            {data.dailyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.dailyTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
                  <Tooltip formatter={(value: number) => formatRupiah(value)} />
                  <Legend />
                  <Bar dataKey="income" name="Pemasukan" fill="hsl(142.1, 76.2%, 36.3%)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expense" name="Pengeluaran" fill="hsl(0, 84.2%, 60.2%)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-muted-foreground text-center py-10 text-sm">Belum ada data transaksi</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

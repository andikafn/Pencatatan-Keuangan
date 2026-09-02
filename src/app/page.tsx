import Link from "next/link"
import { ArrowRight, BarChart3, Wallet, PieChart, Shield } from "lucide-react"
import ThemeToggle from "@/components/ThemeToggle"

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between mx-auto px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-bold">K</div>
            <span className="font-semibold text-lg">Keuanganku</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
              Masuk
            </Link>
            <Link href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-9 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
              Daftar
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto px-4 py-24 md:py-32 text-center">
          <div className="mx-auto max-w-2xl space-y-6">
            <div className="inline-flex items-center rounded-full border px-3 py-1 text-sm text-muted-foreground">
              Kelola keuangan lebih mudah
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
              Catat keuanganmu dengan{" "}
              <span className="text-primary">mudah & cepat</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Kelola pemasukan, pengeluaran, anggaran, dan tabungan dalam satu tempat yang sederhana dan aman.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
                Mulai Gratis
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link href="/login" className="inline-flex items-center justify-center rounded-md text-sm font-medium h-11 px-8 border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors">
                Masuk
              </Link>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Wallet, title: "Multi Dompet", desc: "Kelola tunai, bank, dan e-wallet dalam satu tempat" },
              { icon: BarChart3, title: "Laporan Visual", desc: "Grafik dan analitik untuk memahami arus kas" },
              { icon: PieChart, title: "Anggaran", desc: "Buat anggaran bulanan per kategori dan pantau progres" },
              { icon: Shield, title: "Aman", desc: "Data terenkripsi dan dilindungi autentikasi" },
            ].map((f) => (
              <div key={f.title} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <f.icon className="h-10 w-10 text-primary mb-4" />
                <h3 className="font-semibold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          &copy; 2026 Keuanganku. Hak cipta dilindungi.
        </div>
      </footer>
    </div>
  )
}

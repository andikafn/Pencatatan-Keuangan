"use client"

import { useState } from "react"
import Link from "next/link"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [resetToken, setResetToken] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Gagal memproses permintaan")
      
      setMessage(data.message)
      if (data.token) {
        setResetToken(data.token)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Lupa Password</CardTitle>
        <CardDescription>Masukkan email Anda untuk menyetel ulang password</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}
          {message && (
            <div className="space-y-3 rounded-md bg-emerald-500/10 p-3 text-sm text-emerald-600">
              <p>{message}</p>
              {resetToken && (
                <div className="pt-2 border-t border-emerald-500/20">
                  <p className="font-semibold text-xs text-foreground mb-1">Mode Lokal Test Fast-Link:</p>
                  <Link 
                    href={`/reset-password?token=${resetToken}`}
                    className="text-xs font-bold underline text-primary break-all"
                  >
                    Klik di sini untuk langsung reset password
                  </Link>
                </div>
              )}
            </div>
          )}
          <Input 
            label="Email" 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="nama@email.com" 
            required 
          />
          <Button type="submit" className="w-full" loading={loading}>
            Kirim Tautan Reset
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <p className="text-sm text-muted-foreground">
          Ingat password Anda?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">Masuk</Link>
        </p>
      </CardFooter>
    </Card>
  )
}

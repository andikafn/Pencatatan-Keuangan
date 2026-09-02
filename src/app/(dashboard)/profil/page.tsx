"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import Button from "@/components/ui/Button"
import Input from "@/components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card"
import { User, Lock, Mail } from "lucide-react"

export default function ProfilePage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSavingProfile, setIsSavingProfile] = useState(false)
  const [isSavingPassword, setIsSavingPassword] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await fetch("/api/user/profile")
        if (res.ok) {
          const data = await res.json()
          setName(data.name || "")
          setEmail(data.email || "")
        }
      } catch (error) {
        console.error("Failed to fetch profile", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchProfile()
  }, [])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSavingProfile(true)
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success("Profil berhasil diperbarui")
      } else {
        toast.error(data.error || "Gagal memperbarui profil")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsSavingProfile(false)
    }
  }

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("Konfirmasi password tidak cocok")
      return
    }
    
    setIsSavingPassword(true)
    
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        toast.success("Password berhasil diperbarui")
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
      } else {
        toast.error(data.error || "Gagal memperbarui password")
      }
    } catch (error) {
      toast.error("Terjadi kesalahan")
    } finally {
      setIsSavingPassword(false)
    }
  }

  if (isLoading) {
    return <div className="flex h-[50vh] items-center justify-center">Memuat data profil...</div>
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pengaturan Profil</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan keamanan akun Anda.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informasi Profil
            </CardTitle>
            <CardDescription>Perbarui nama tampilan Anda.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="space-y-4">
                <Input
                  label="Email (Tidak dapat diubah)"
                  type="email"
                  value={email}
                  disabled
                />
                <Input
                  label="Nama Tampilan"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Masukkan nama Anda"
                />
              </div>
              <Button type="submit" loading={isSavingProfile}>
                Simpan Profil
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Ubah Password
            </CardTitle>
            <CardDescription>Pastikan akun Anda menggunakan password yang kuat.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div className="space-y-4">
                <Input
                  label="Password Saat Ini"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <Input
                  label="Password Baru"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <Input
                  label="Konfirmasi Password Baru"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <Button type="submit" loading={isSavingPassword}>
                Perbarui Password
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

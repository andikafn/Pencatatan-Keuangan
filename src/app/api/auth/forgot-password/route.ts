import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Kita kembalikan sukses agar tidak mengungkap email yang terdaftar atau tidak
      return NextResponse.json({ 
        message: "Jika email tersebut terdaftar, tautan reset password akan dikirim (Simulasi: token berhasil digenerate)" 
      }, { status: 200 });
    }

    // Generate random token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 jam

    // Simpan ke DB
    await prisma.passwordReset.create({
      data: {
        email,
        token,
        expiresAt,
      },
    });

    // Simulasi pengiriman email untuk versi lokal
    // (Dalam produksi, gunakan Resend / Nodemailer dll)
    console.log(`\n\n=== SIMULASI EMAIL RESET PASSWORD ===\nToken untuk ${email}: ${token}\nURL: http://localhost:3000/reset-password?token=${token}\n====================================\n\n`);

    return NextResponse.json({ 
      message: "Tautan reset password berhasil dibuat (Cek console backend untuk URL-nya dalam mode lokal)",
      token // Kita kembalikan tokennya khusus untuk keperluan testing di UI
    }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

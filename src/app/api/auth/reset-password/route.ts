import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json({ error: "Token dan password baru wajib diisi" }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: "Password minimal 6 karakter" }, { status: 400 });
    }

    // Cari token reset
    const resetRecord = await prisma.passwordReset.findUnique({
      where: { token },
    });

    if (!resetRecord) {
      return NextResponse.json({ error: "Token reset password tidak valid atau sudah kedaluwarsa" }, { status: 400 });
    }

    if (new Date() > resetRecord.expiresAt) {
      // Hapus token expired
      await prisma.passwordReset.delete({ where: { token } });
      return NextResponse.json({ error: "Token reset password telah kedaluwarsa" }, { status: 400 });
    }

    // Hash password baru
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password user
    await prisma.user.update({
      where: { email: resetRecord.email },
      data: { password: hashedPassword },
    });

    // Hapus token yang telah digunakan
    await prisma.passwordReset.delete({ where: { token } });

    return NextResponse.json({ message: "Password berhasil diperbarui, silakan masuk" }, { status: 200 });

  } catch (error) {
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const wallets = await prisma.wallet.findMany({ where: { userId } });
  return NextResponse.json(wallets);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, type, balance } = await request.json();

  if (!name || !type) {
    return NextResponse.json({ error: "Nama dan tipe wajib diisi" }, { status: 400 });
  }

  const wallet = await prisma.wallet.create({ data: { name, type, balance: Number(balance) || 0, userId } });
  return NextResponse.json(wallet);
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();

    const existing = await prisma.wallet.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Dompet tidak ditemukan" }, { status: 404 });

    await prisma.wallet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Wallet DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus dompet. Pastikan tidak ada transaksi terkait." }, { status: 500 });
  }
}

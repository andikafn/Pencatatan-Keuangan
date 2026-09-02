import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");
  const type = searchParams.get("type");
  const walletId = searchParams.get("walletId");

  const where: Record<string, unknown> = { userId };
  if (type) where.type = type;
  if (walletId) where.walletId = walletId;
  if (month && year) {
    const start = new Date(Number(year), Number(month) - 1, 1);
    const end = new Date(Number(year), Number(month), 1);
    where.date = { gte: start, lt: end };
  } else if (year) {
    const start = new Date(Number(year), 0, 1);
    const end = new Date(Number(year) + 1, 0, 1);
    where.date = { gte: start, lt: end };
  }

  const transactions = await prisma.transaction.findMany({
    where,
    include: { wallet: true, category: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(transactions);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { walletId, toWalletId, categoryId, type, amount, date, notes, isRecurring } = await request.json();
    const numAmount = Number(amount);

    if (!walletId || !type || numAmount <= 0) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const transaction = await prisma.$transaction(async (tx) => {
      const newTransaction = await tx.transaction.create({
        data: {
          walletId,
          toWalletId: toWalletId || null,
          categoryId: categoryId || null,
          type,
          amount: numAmount,
          date: new Date(date),
          notes: notes || null,
          isRecurring: isRecurring || false,
          userId,
        },
      });

      if (type === "INCOME") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { increment: numAmount } } });
      } else if (type === "EXPENSE") {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: numAmount } } });
      } else if (type === "TRANSFER" && toWalletId) {
        await tx.wallet.update({ where: { id: walletId }, data: { balance: { decrement: numAmount } } });
        await tx.wallet.update({ where: { id: toWalletId }, data: { balance: { increment: numAmount } } });
      }

      return newTransaction;
    });

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Transaction POST error:", error);
    return NextResponse.json({ error: "Gagal menyimpan transaksi" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();

    const existing = await prisma.transaction.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });

    await prisma.$transaction(async (tx) => {
      if (existing.type === "INCOME") {
        await tx.wallet.update({ where: { id: existing.walletId }, data: { balance: { decrement: existing.amount } } });
      } else if (existing.type === "EXPENSE") {
        await tx.wallet.update({ where: { id: existing.walletId }, data: { balance: { increment: existing.amount } } });
      } else if (existing.type === "TRANSFER" && existing.toWalletId) {
        await tx.wallet.update({ where: { id: existing.walletId }, data: { balance: { increment: existing.amount } } });
        await tx.wallet.update({ where: { id: existing.toWalletId }, data: { balance: { decrement: existing.amount } } });
      }

      await tx.transaction.delete({ where: { id } });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Transaction DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus transaksi" }, { status: 500 });
  }
}

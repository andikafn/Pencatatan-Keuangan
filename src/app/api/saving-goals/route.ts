import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const goals = await prisma.savingGoal.findMany({ where: { userId } });
  return NextResponse.json(goals);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, targetAmount, currentAmount, targetDate } = await request.json();

  if (!name || !targetAmount) {
    return NextResponse.json({ error: "Nama dan target jumlah wajib diisi" }, { status: 400 });
  }

  const goal = await prisma.savingGoal.create({
    data: {
      name,
      targetAmount: Number(targetAmount),
      currentAmount: currentAmount ? Number(currentAmount) : 0,
      targetDate: targetDate ? new Date(targetDate) : null,
      userId,
    },
  });
  return NextResponse.json(goal);
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, addAmount, currentAmount } = await request.json();

  const existing = await prisma.savingGoal.findFirst({ where: { id, userId } });
  if (!existing) return NextResponse.json({ error: "Target tidak ditemukan" }, { status: 404 });

  if (addAmount) {
    const goal = await prisma.savingGoal.update({
      where: { id },
      data: { currentAmount: { increment: Number(addAmount) } },
    });
    return NextResponse.json(goal);
  }

  const goal = await prisma.savingGoal.update({
    where: { id },
    data: { currentAmount: Number(currentAmount) },
  });
  return NextResponse.json(goal);
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();

    const existing = await prisma.savingGoal.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Target tidak ditemukan" }, { status: 404 });

    await prisma.savingGoal.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("SavingGoal DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus target tabungan" }, { status: 500 });
  }
}

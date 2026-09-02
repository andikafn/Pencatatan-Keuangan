import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const showAll = searchParams.get("all") === "true";

  const where: { userId: string; isPaid?: boolean } = { userId };
  if (!showAll) {
    where.isPaid = false;
  }

  const reminders = await prisma.reminder.findMany({
    where,
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(reminders);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { title, amount, dueDate, type } = await request.json();
  if (!title || !dueDate) {
    return NextResponse.json({ error: "Judul dan tanggal jatuh tempo wajib diisi" }, { status: 400 });
  }

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      title,
      amount: amount ? Number(amount) : null,
      dueDate: new Date(dueDate),
      type: type || "BILL",
    },
  });

  return NextResponse.json(reminder);
}

export async function PATCH(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, isPaid } = await request.json();

  const reminder = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!reminder) {
    return NextResponse.json({ error: "Pengingat tidak ditemukan" }, { status: 404 });
  }

  const updated = await prisma.reminder.update({
    where: { id },
    data: { isPaid },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await request.json();
  const reminder = await prisma.reminder.findFirst({ where: { id, userId } });
  if (!reminder) {
    return NextResponse.json({ error: "Pengingat tidak ditemukan" }, { status: 404 });
  }

  await prisma.reminder.delete({ where: { id } });

  return NextResponse.json({ message: "Pengingat berhasil dihapus" });
}

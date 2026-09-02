import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  const where: Record<string, unknown> = { userId };
  if (month) where.month = Number(month);
  if (year) where.year = Number(year);

  const budgets = await prisma.budget.findMany({
    where,
    include: { category: true },
  });

  const budgetsWithSpent = await Promise.all(
    budgets.map(async (budget) => {
      const start = new Date(budget.year, budget.month - 1, 1);
      const end = new Date(budget.year, budget.month, 1);
      const aggregate = await prisma.transaction.aggregate({
        where: {
          userId,
          categoryId: budget.categoryId,
          type: "EXPENSE",
          date: { gte: start, lt: end },
        },
        _sum: { amount: true },
      });
      return {
        ...budget,
        categoryName: budget.category.name,
        spent: aggregate._sum.amount || 0,
      };
    })
  );

  return NextResponse.json(budgetsWithSpent);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { categoryId, amount, month, year } = await request.json();

    if (!categoryId || !amount || !month || !year) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const category = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 400 });
    }

    const existing = await prisma.budget.findUnique({
      where: {
        userId_categoryId_month_year: {
          userId,
          categoryId,
          month: Number(month),
          year: Number(year),
        },
      },
    });

    let budget;
    if (existing) {
      budget = await prisma.budget.update({
        where: { id: existing.id },
        data: { amount: Number(amount) },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          user: { connect: { id: userId } },
          category: { connect: { id: categoryId } },
          amount: Number(amount),
          month: Number(month),
          year: Number(year),
        },
      });
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Budget POST error:", error);
    return NextResponse.json({ error: "Gagal menyimpan anggaran" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const { id } = await request.json();

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) return NextResponse.json({ error: "Anggaran tidak ditemukan" }, { status: 404 });

    await prisma.budget.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Budget DELETE error:", error);
    return NextResponse.json({ error: "Gagal menghapus anggaran" }, { status: 500 });
  }
}

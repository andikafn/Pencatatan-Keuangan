import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const month = Number(searchParams.get("month"));
  const year = Number(searchParams.get("year"));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const transactions = await prisma.transaction.findMany({
    where: { userId, date: { gte: start, lt: end } },
    include: { category: true },
  });

  let totalIncome = 0;
  let totalExpense = 0;
  const categoryBreakdownMap = new Map();
  const dailyTrendMap = new Map();

  for (let d = 1; d <= new Date(year, month, 0).getDate(); d++) {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    dailyTrendMap.set(dateStr, { date: dateStr, income: 0, expense: 0 });
  }

  transactions.forEach((t) => {
    const amount = Number(t.amount);
    const dateStr = t.date.toISOString().split("T")[0];
    const trend = dailyTrendMap.get(dateStr) || { date: dateStr, income: 0, expense: 0 };

    if (t.type === "INCOME") {
      totalIncome += amount;
      trend.income += amount;
    } else if (t.type === "EXPENSE") {
      totalExpense += amount;
      trend.expense += amount;

      if (t.categoryId && t.category) {
        const cat = categoryBreakdownMap.get(t.categoryId) || {
          categoryId: t.categoryId,
          categoryName: t.category.name,
          categoryColor: t.category.color,
          total: 0,
        };
        cat.total += amount;
        categoryBreakdownMap.set(t.categoryId, cat);
      }
    }
    dailyTrendMap.set(dateStr, trend);
  });

  return NextResponse.json({
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categoryBreakdown: Array.from(categoryBreakdownMap.values()),
    dailyTrend: Array.from(dailyTrendMap.values()),
  });
}

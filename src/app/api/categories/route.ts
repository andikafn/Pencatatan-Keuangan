import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserId } from "@/lib/auth";

export async function GET(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const categories = await prisma.category.findMany({ 
    where: { userId },
    orderBy: { createdAt: "desc" }
  });
  return NextResponse.json(categories);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { name, type, icon, color } = await request.json();
  if (!name || !type) {
    return NextResponse.json({ error: "Nama dan tipe kategori wajib diisi" }, { status: 400 });
  }
  const category = await prisma.category.create({ 
    data: { 
      name, 
      type, 
      icon: icon || "📁", 
      color: color || "#3b82f6", 
      userId 
    } 
  });
  return NextResponse.json(category);
}

export async function DELETE(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  
  try {
    const { id } = await request.json();
    const category = await prisma.category.findFirst({ where: { id, userId } });
    if (!category) {
      return NextResponse.json({ error: "Kategori tidak ditemukan" }, { status: 404 });
    }
    
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ message: "Kategori berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus kategori (kategori mungkin digunakan dalam transaksi)" }, { status: 400 });
  }
}


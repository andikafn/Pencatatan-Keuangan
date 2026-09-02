export const DEFAULT_CATEGORIES = [
  { name: "Gaji", type: "INCOME", icon: "💼", color: "#22c55e" },
  { name: "Freelance", type: "INCOME", icon: "💻", color: "#16a34a" },
  { name: "Investasi", type: "INCOME", icon: "📈", color: "#15803d" },
  { name: "Hadiah", type: "INCOME", icon: "🎁", color: "#4ade80" },
  { name: "Lainnya (Masuk)", type: "INCOME", icon: "💰", color: "#86efac" },
  { name: "Makan & Minum", type: "EXPENSE", icon: "🍽️", color: "#f97316" },
  { name: "Transportasi", type: "EXPENSE", icon: "🚗", color: "#3b82f6" },
  { name: "Belanja", type: "EXPENSE", icon: "🛒", color: "#a855f7" },
  { name: "Tagihan & Utilitas", type: "EXPENSE", icon: "💡", color: "#eab308" },
  { name: "Kesehatan", type: "EXPENSE", icon: "🏥", color: "#ef4444" },
  { name: "Hiburan", type: "EXPENSE", icon: "🎬", color: "#ec4899" },
  { name: "Pendidikan", type: "EXPENSE", icon: "📚", color: "#06b6d4" },
  { name: "Rumah", type: "EXPENSE", icon: "🏠", color: "#f59e0b" },
  { name: "Pakaian", type: "EXPENSE", icon: "👕", color: "#8b5cf6" },
  { name: "Lainnya (Keluar)", type: "EXPENSE", icon: "💸", color: "#6b7280" },
];

export const WALLET_TYPES = [
  { value: "CASH", label: "Tunai", icon: "💵" },
  { value: "BANK", label: "Rekening Bank", icon: "🏦" },
  { value: "EWALLET", label: "E-Wallet", icon: "📱" },
  { value: "CREDIT", label: "Kartu Kredit", icon: "💳" },
];

export const TRANSACTION_TYPES = {
  INCOME: { label: "Pemasukan", color: "text-green-600", bg: "bg-green-50" },
  EXPENSE: { label: "Pengeluaran", color: "text-red-600", bg: "bg-red-50" },
  TRANSFER: { label: "Transfer", color: "text-blue-600", bg: "bg-blue-50" },
};

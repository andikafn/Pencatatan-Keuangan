# Keuanganku - Aplikasi Pencatatan Keuangan Pribadi

Aplikasi web pencatatan keuangan pribadi yang membantu pengguna mencatat, mengelola, dan menganalisis arus kas pribadi — pemasukan, pengeluaran, tabungan, dan anggaran — dalam satu tempat yang sederhana dan mudah digunakan.

## Tech Stack

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Bahasa**: TypeScript
- **Database**: SQLite (via Prisma ORM)
- **Styling**: Tailwind CSS
- **Autentikasi**: JWT (JSON Web Token) dengan jose
- **Grafik**: Recharts
- **UI Icons**: Lucide React
- **Tema**: next-themes (Light/Dark Mode)

## Fitur Lengkap

### Autentikasi & Keamanan
- Registrasi dan login dengan email & password
- Lupa password & reset password via token
- Sesi menggunakan JWT (HTTP-only cookie)
- Middleware proteksi route

### Onboarding
- Wizard 3 langkah saat pertama kali mendaftar
- Panduan membuat dompet pertama

### Manajemen Transaksi
- Tambah, hapus transaksi (pemasukan, pengeluaran, transfer antar dompet)
- Kategori transaksi (default + kustom)
- Filter berdasarkan bulan, tahun, dan tipe transaksi
- Pencarian transaksi berdasarkan kategori, catatan, atau nama dompet
- Dukungan transaksi berulang (recurring)

### Multi-Dompet / Akun
- Kelola beberapa dompet (Tunai, Rekening Bank, E-Wallet, Kartu Kredit)
- Saldo otomatis terupdate per dompet
- Transfer antar dompet

### Anggaran (Budgeting)
- Buat anggaran bulanan per kategori
- Indikator progres (persentase terpakai)

### Laporan & Analitik
- Ringkasan bulanan: total pemasukan, pengeluaran, saldo bersih
- Grafik pie pengeluaran per kategori
- Grafik bar tren harian (pemasukan vs pengeluaran)
- Ekspor data ke CSV
- Ekspor laporan ke PDF (print-friendly)

### Target Tabungan
- Buat target tabungan dengan nominal dan tenggat waktu
- Progress bar dan persentase pencapaian

### Kategori Kustom
- Tambah dan hapus kategori pemasukan/pengeluaran
- Pilihan ikon emoji untuk setiap kategori
- Kategori default otomatis dibuat saat registrasi

### Pengingat & Notifikasi
- Buat pengingat tagihan bulanan dengan tanggal jatuh tempo
- Ikon lonceng dengan badge jumlah tagihan belum bayar
- Dropdown notifikasi dengan aksi cepat (tandai selesai)
- Widget "Tagihan Mendatang" di dashboard
- Toast otomatis saat ada tagihan jatuh tempo

### Profil & Pengaturan
- Ubah nama tampilan
- Ubah password (dengan verifikasi password lama)

### Dark Mode
- Toggle tema Terang/Gelap di semua halaman
- Deteksi otomatis preferensi sistem

## Struktur Halaman

| Route | Deskripsi |
|---|---|
| `/` | Landing page |
| `/login` | Halaman masuk |
| `/register` | Halaman daftar |
| `/lupa-password` | Halaman lupa password |
| `/reset-password` | Halaman reset password |
| `/onboarding` | Wizard onboarding setelah daftar |
| `/dashboard` | Dashboard ringkasan keuangan |
| `/transaksi` | Daftar & pencarian transaksi |
| `/dompet` | Kelola dompet/akun |
| `/anggaran` | Kelola anggaran bulanan |
| `/tabungan` | Target tabungan |
| `/laporan` | Laporan & grafik analitik |
| `/kategori` | Kelola kategori kustom |
| `/pengingat` | Kelola pengingat & tagihan |
| `/profil` | Pengaturan profil & password |

## API Endpoints

| Method | Endpoint | Deskripsi |
|---|---|---|
| POST | `/api/auth/register` | Registrasi user baru |
| POST | `/api/auth/login` | Login user |
| POST | `/api/auth/logout` | Logout user |
| POST | `/api/auth/forgot-password` | Request reset password |
| POST | `/api/auth/reset-password` | Reset password dengan token |
| GET/PUT | `/api/user/profile` | Profil user |
| GET/POST | `/api/wallets` | Daftar & tambah dompet |
| GET/POST/DELETE | `/api/categories` | Daftar, tambah, hapus kategori |
| GET/POST/DELETE | `/api/transactions` | Daftar, tambah, hapus transaksi |
| GET/POST | `/api/budgets` | Daftar & tambah anggaran |
| GET/POST | `/api/saving-goals` | Daftar & tambah target tabungan |
| GET/POST/PATCH/DELETE | `/api/reminders` | CRUD pengingat & tagihan |
| GET | `/api/reports` | Data laporan bulanan |

## Instalasi & Menjalankan

### Prasyarat

- [Node.js](https://nodejs.org/) versi 18 atau lebih baru
- npm (sudah termasuk dalam Node.js)

### Langkah-langkah

1. **Clone repository**

   ```bash
   git clone <url-repository>
   cd aplikasi-keuangan
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Konfigurasi environment**

   Buat file `.env` di root project:

   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="ganti_dengan_secret_key_anda"
   ```

4. **Setup database**

   ```bash
   npx prisma db push
   npx prisma generate
   ```

5. **Jalankan aplikasi (mode development)**

   ```bash
   npm run dev
   ```

   Buka [http://localhost:3000](http://localhost:3000) di browser.

6. **Build untuk production**

   ```bash
   npm run build
   npm start
   ```

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/              # Halaman autentikasi
│   │   ├── login/
│   │   ├── register/
│   │   ├── lupa-password/
│   │   ├── reset-password/
│   │   ├── onboarding/
│   │   └── layout.tsx
│   ├── (dashboard)/         # Halaman dashboard (protected)
│   │   ├── dashboard/
│   │   ├── transaksi/
│   │   ├── dompet/
│   │   ├── anggaran/
│   │   ├── tabungan/
│   │   ├── laporan/
│   │   ├── kategori/
│   │   ├── pengingat/
│   │   ├── profil/
│   │   └── layout.tsx
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Landing page
│   └── globals.css          # Global styles & tema
├── components/
│   ├── ui/                  # Komponen UI reusable
│   ├── NotificationBell.tsx # Komponen notifikasi lonceng
│   └── ThemeToggle.tsx      # Komponen toggle dark mode
├── lib/
│   ├── auth.ts              # Helper autentikasi JWT
│   ├── prisma.ts            # Prisma client instance
│   ├── constants.ts         # Kategori & tipe dompet default
│   └── utils.ts             # Utility functions
└── middleware.ts             # Middleware proteksi route
```

## Database Schema

Aplikasi menggunakan SQLite dengan model berikut:

- **User** — Data pengguna
- **Wallet** — Dompet/akun keuangan
- **Category** — Kategori transaksi
- **Transaction** — Catatan transaksi
- **Budget** — Anggaran bulanan per kategori
- **SavingGoal** — Target tabungan
- **Reminder** — Pengingat tagihan
- **PasswordReset** — Token reset password

## Lisensi

Hak cipta &copy; 2026 Keuanganku. Seluruh hak dilindungi.

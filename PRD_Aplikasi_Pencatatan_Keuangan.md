# Product Requirements Document (PRD)
## Aplikasi Pencatatan Keuangan Pribadi

**Versi:** 1.0
**Tanggal:** 1 September 2026
**Status:** Draft

---

## 1. Ringkasan Eksekutif

Aplikasi pencatatan keuangan pribadi adalah aplikasi mobile (dan web) yang membantu pengguna mencatat, mengelola, dan menganalisis arus kas pribadi mereka — pemasukan, pengeluaran, tabungan, dan anggaran — dalam satu tempat yang sederhana dan mudah digunakan.

---

## 2. Latar Belakang & Masalah

Banyak individu kesulitan mengelola keuangan pribadi karena:
- Pencatatan transaksi manual (buku/Excel) yang merepotkan dan sering terlewat.
- Tidak ada gambaran jelas ke mana uang dihabiskan setiap bulan.
- Sulit membuat dan mematuhi anggaran (budget).
- Tidak ada pengingat tagihan atau target menabung.
- Data keuangan tersebar di banyak rekening/e-wallet sehingga sulit dipantau secara terpusat.

---

## 3. Tujuan Produk (Goals)

1. Memudahkan pengguna mencatat transaksi keuangan harian dalam waktu <10 detik.
2. Memberikan visibilitas atas pola pengeluaran melalui laporan dan grafik.
3. Membantu pengguna membuat dan mematuhi anggaran bulanan.
4. Mendorong kebiasaan menabung melalui target dan pengingat.
5. Meningkatkan retensi pengguna melalui pengalaman yang cepat, ringan, dan personal.

### Non-Goals (Di Luar Cakupan v1)
- Integrasi otomatis dengan rekening bank (open banking) — dipertimbangkan untuk versi mendatang.
- Fitur investasi/trading.
- Multi-currency lanjutan (fokus awal: IDR).
- Fitur kolaborasi keuangan keluarga/tim (dipertimbangkan fase 2).

---

## 4. Target Pengguna & Persona

| Persona | Deskripsi | Kebutuhan Utama |
|---|---|---|
| Pekerja Muda (22–30) | Baru mulai kerja, gaji bulanan, ingin mulai menabung | Pencatatan cepat, kategori otomatis, target tabungan |
| Ibu Rumah Tangga | Mengelola pengeluaran rumah tangga harian | Kategori belanja rumah, laporan bulanan, pengingat tagihan |
| Freelancer/UMKM Kecil | Pemasukan tidak tetap, banyak transaksi kecil | Pemisahan uang pribadi vs usaha, laporan arus kas |
| Mahasiswa | Uang saku terbatas | Anggaran ketat, notifikasi pengeluaran berlebih |

---

## 5. User Stories (Prioritas Utama)

- Sebagai pengguna, saya ingin **mencatat transaksi** (pemasukan/pengeluaran) dengan cepat agar tidak malas mencatat.
- Sebagai pengguna, saya ingin **mengkategorikan transaksi** agar tahu ke mana uang saya pergi.
- Sebagai pengguna, saya ingin **melihat ringkasan bulanan** (grafik pemasukan vs pengeluaran) agar bisa mengevaluasi keuangan saya.
- Sebagai pengguna, saya ingin **membuat anggaran per kategori** agar pengeluaran tidak berlebihan.
- Sebagai pengguna, saya ingin **menerima notifikasi** saat mendekati/melebihi batas anggaran.
- Sebagai pengguna, saya ingin **mencatat banyak dompet/akun** (tunai, bank, e-wallet) agar saldo tetap akurat.
- Sebagai pengguna, saya ingin **membuat target tabungan** dan memantau progresnya.
- Sebagai pengguna, saya ingin **mengekspor data** (CSV/PDF) untuk kebutuhan pribadi/pajak.
- Sebagai pengguna, saya ingin **data saya aman** dan bisa dikunci dengan PIN/biometrik.

---

## 6. Ruang Lingkup Fitur (Functional Requirements)

### 6.1 Fitur Inti (MVP)
1. **Autentikasi & Onboarding**
   - Daftar/masuk via email, Google, Apple.
   - Onboarding singkat: pilih mata uang, buat dompet pertama.
2. **Manajemen Transaksi**
   - Tambah/edit/hapus transaksi (pemasukan, pengeluaran, transfer antar dompet).
   - Kategori transaksi (default + custom).
   - Input cepat (quick add) dengan jumlah, kategori, tanggal, catatan, foto struk (opsional).
   - Transaksi berulang (recurring), misal langganan bulanan.
3. **Multi-Dompet/Akun**
   - Tambah beberapa dompet (tunai, rekening bank, e-wallet, kartu kredit).
   - Saldo otomatis terupdate per dompet dan total keseluruhan.
4. **Anggaran (Budgeting)**
   - Buat anggaran bulanan per kategori.
   - Indikator progres (persentase terpakai) dan notifikasi saat mendekati/melebihi batas.
5. **Laporan & Analitik**
   - Ringkasan bulanan/mingguan: total pemasukan, pengeluaran, saldo bersih.
   - Grafik pie/bar per kategori.
   - Tren pengeluaran per bulan (line chart).
6. **Target Tabungan (Savings Goals)**
   - Buat target dengan nominal dan tenggat waktu.
   - Progress bar dan estimasi tercapai.
7. **Notifikasi & Pengingat**
   - Pengingat mencatat transaksi harian.
   - Pengingat tagihan/transaksi berulang.
   - Peringatan anggaran.
8. **Keamanan**
   - Kunci aplikasi dengan PIN/biometrik (fingerprint/Face ID).
   - Enkripsi data di penyimpanan lokal dan server.
9. **Ekspor Data**
   - Ekspor transaksi ke CSV/PDF.

### 6.2 Fitur Fase 2 (Pasca-MVP)
- Integrasi open banking / scan mutasi rekening otomatis.
- Fitur keuangan bersama (keluarga/pasangan) dengan berbagi akses.
- Scan struk otomatis (OCR) untuk isi transaksi otomatis.
- Insight & rekomendasi berbasis AI (misal: "pengeluaran makan naik 30% bulan ini").
- Widget home screen.
- Mode multi-currency penuh.
- Sinkronisasi lintas perangkat secara real-time.

---

## 7. Non-Functional Requirements

| Aspek | Kebutuhan |
|---|---|
| Performa | Waktu buka aplikasi <2 detik; input transaksi tersimpan <1 detik |
| Ketersediaan | Uptime backend 99.5% |
| Keamanan | Enkripsi data at-rest & in-transit (TLS), autentikasi 2FA opsional |
| Skalabilitas | Mendukung hingga 100rb pengguna aktif tanpa degradasi performa |
| Kompatibilitas | Android 9+, iOS 14+, serta versi web responsif |
| Offline Mode | Pencatatan transaksi tetap bisa dilakukan offline, sinkron saat online |
| Aksesibilitas | Mendukung text scaling dan kontras warna sesuai standar WCAG AA |
| Lokalisasi | Bahasa Indonesia (default) dan Inggris |

---

## 8. Alur Pengguna Utama (User Flow Singkat)

**Flow: Mencatat Transaksi Baru**
1. Buka aplikasi → tekan tombol "+" (tambah transaksi).
2. Pilih jenis: Pemasukan / Pengeluaran / Transfer.
3. Masukkan nominal.
4. Pilih kategori dan dompet.
5. (Opsional) tambahkan catatan/foto struk.
6. Simpan → saldo dompet & anggaran otomatis terupdate.

**Flow: Melihat Laporan Bulanan**
1. Buka tab "Laporan".
2. Pilih periode (minggu/bulan/tahun).
3. Lihat grafik ringkasan pemasukan vs pengeluaran per kategori.
4. Tap kategori untuk melihat detail transaksi.

---

## 9. Metrik Keberhasilan (Success Metrics / KPI)

| Metrik | Target (6 bulan pasca-launch) |
|---|---|
| Jumlah pengguna aktif bulanan (MAU) | 50.000 |
| Retensi 30 hari | ≥ 35% |
| Rata-rata transaksi dicatat per pengguna/bulan | ≥ 20 |
| Rating aplikasi di App Store/Play Store | ≥ 4.5 |
| Persentase pengguna yang membuat anggaran | ≥ 40% |
| Churn rate bulanan | < 8% |

---

## 10. Pertimbangan Teknis (High-Level)

- **Platform:** Aplikasi mobile native/hybrid (Android & iOS) + versi web responsif.
- **Backend:** REST/GraphQL API, database relasional (transaksi terstruktur) + cache untuk laporan.
- **Autentikasi:** OAuth2 (Google/Apple), JWT session.
- **Notifikasi:** Push notification service (FCM/APNs).
- **Penyimpanan Media:** Cloud storage untuk foto struk.
- **Analitik Produk:** Event tracking untuk mengukur engagement fitur.

---

## 11. Risiko & Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Pengguna malas mencatat transaksi secara manual | Rendahnya engagement | Sediakan quick-add, reminder, dan (fase 2) OCR struk |
| Data keuangan sensitif rentan kebocoran | Kepercayaan pengguna turun | Enkripsi data, audit keamanan berkala |
| Kompetitor sudah mapan (mis. aplikasi finansial lain) | Sulit akuisisi pengguna | Diferensiasi lewat UX sederhana & insight personal |
| Ketergantungan pada integrasi bank pihak ketiga (fase 2) | Risiko downtime/API berubah | Fallback ke input manual, monitoring API vendor |

---

## 12. Roadmap Rilis (Indikatif)

| Fase | Fokus | Estimasi Durasi |
|---|---|---|
| Fase 1 – MVP | Pencatatan transaksi, multi-dompet, anggaran dasar, laporan sederhana | 3 bulan |
| Fase 2 – Enhancement | Target tabungan, notifikasi lanjutan, ekspor data | 2 bulan |
| Fase 3 – Growth | OCR struk, insight AI, integrasi bank (opsional) | 3–4 bulan |

---

## 13. Lampiran / Open Questions

- Apakah aplikasi akan freemium (fitur premium seperti laporan lanjutan/OCR berbayar) atau sepenuhnya gratis?
- Apakah perlu dukungan multi-bahasa selain Indonesia & Inggris di tahap awal?
- Apakah diperlukan kepatuhan regulasi khusus (misalnya terkait data keuangan) di wilayah target?

---

*Dokumen ini adalah draft awal dan dapat direvisi seiring masukan dari tim produk, desain, engineering, dan riset pengguna.*

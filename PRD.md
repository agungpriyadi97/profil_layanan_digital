# 📑 PRODUCT REQUIREMENT DOCUMENT (PRD)

## Metadata Dokumen
| Parameter | Detail |
| :--- | :--- |
| **Nama Proyek** | Website Profil & Layanan Digital RW 01 Bencongan Indah |
| **Cakupan Wilayah** | RW 01 (Membawahi 8 RT: RT 01 s/d RT 08) |
| **Versi Dokumen** | v1.0.0 (Production Ready) |
| **Status** | Approved / Ready for Development |
| **Target Platform** | Web App (Responsive Mobile, Tablet, & Desktop) |
| **Tech Stack** | Stitch (Frontend UI), Google Apps Script (Backend API), Google Sheets (Database) |

---

## 1. Executive Summary & Objective

### 1.1 Latar Belakang
RW 01 Bencongan Indah menaungi 8 Rukun Tetangga (RT 01 sampai RT 08). Pengelolaan informasi administrasi, pengajuan surat pengantar, jadwal kegiatan (Posyandu, kerja bakti, siskamling), serta promosi UMKM warga saat ini masih mengandalkan grup percakapan pesan instan yang sering tertimbun dan tidak terdokumentasi rapi.

### 1.2 Tujuan Sistem
1. **Pusat Informasi Terpadu:** Menyajikan profil wilayah, struktur kepengurusan RW, dan kontak pengurus 8 RT yang mudah diakses warga.
2. **Layanan Mandiri Warga:** Memfasilitasi permohonan surat pengantar secara online dan panduan persyaratan dokumen.
3. **Pemberdayaan Ekonomi Lokal:** Menyediakan etalase digital gratis untuk produk dan jasa UMKM milik warga dari RT 01 hingga RT 08.
4. **Kanal Pengaduan & Keamanan:** Menyediakan fitur pelaporan keluhan lingkungan (*Lapor RW*) dan daftar hotline darurat cepat.
5. **Zero Infrastructure Cost:** Memanfaatkan Google Sheets dan Google Apps Script sehingga tidak memerlukan biaya sewa server dan database.

---

## 2. User Roles & Access Control

| Role | Akses & Wewenang |
| :--- | :--- |
| **Warga / Publik (Tanpa Login)** | - Melihat profil RW, sejarah, visi misi, dan direktori 8 RT.<br>- Membaca agenda, pengumuman, dan jadwal ronda/posyandu.<br>- Melihat katalog direktori UMKM warga & menghubungi penjual.<br>- Mengisi form permohonan surat pengantar online.<br>- Mengirimkan laporan keluhan/aspirasi warga.<br>- Mengakses daftar nomor kontak darurat. |
| **Pengurus / Admin RW (Login Kredensial)** | - Memvalidasi dan mengubah status permohonan surat pengantar.<br>- Meninjau, merespons, dan menyelesaikan tiket aduan warga.<br>- Menambah, mengedit, atau menghapus agenda & pengumuman.<br>- Memvalidasi pendaftaran UMKM warga baru agar tampil di web.<br>- Memperbarui kontak dan informasi ketua RT 01–08. |

---

## 3. Spesifikasi Modul & Fitur Utama

### Modul 1: Beranda (Home Page)
- **Hero Section:** Banner foto lingkungan RW 01, sambutan singkat Ketua RW, dan tombol CTA utama (*"Ajukan Surat Pengantar"* & *"Kontak Darurat"*).
- **Statistik Wilayah:** Kartu ringkasan jumlah RT (8 RT), estimasi jumlah KK, fasilitas balai warga, posyandu, dan pos keamanan.
- **Agenda & Pengumuman Terkini:** Menampilkan 3 kegiatan terdekat (Posyandu, kerja bakti, pengajian, senam).
- **Akses Cepat (Quick Links):** Tombol pintas menuju form surat, lapor warga, katalog UMKM, dan kontak RT.

### Modul 2: Profil Wilayah & Direktori 8 RT
- **Visi & Misi:** Paparan visi kepengurusan RW 01 Bencongan Indah.
- **Struktur Organisasi:** Bagan nama pengurus (Ketua RW, Sekretaris, Bendahara, Seksi Keamanan, Tim Penggerak PKK, Karang Taruna).
- **Direktori 8 RT (RT 01 - RT 08):**
  - Kartu identitas untuk tiap RT: Nomor RT, Nama Ketua RT, Batas Wilayah/Blok Jalan, Lokasi Pos Ronda.
  - Tombol aksi: *"Hubungi via WhatsApp"* langsung ke nomor Ketua RT terkait.

### Modul 3: Layanan Administrasi & Surat Pengantar
- **Panduan Syarat Dokumen:** Informasi berkas yang dibutuhkan (KTP, KK, Domisili, SKTM, Keterangan Usaha, Pengantar Nikah).
- **Formulir Permohonan Surat Online:**
  - Input: Nama Lengkap, NIK (16 digit), Pilihan RT Domisili (RT 01–08), No. WhatsApp, Jenis Surat, Keperluan Pengajuan.
  - Notifikasi konfirmasi dan nomor tiket pengajuan (`SRT-YYYYMM-XXX`).
  - Status tersimpan ke sheet `Pengajuan_Surat` dengan status awal `PENDING`.

### Modul 4: Agenda, Berita & Jadwal Ronda
- **Kalender Agenda:** Jadwal kegiatan rutin dan insidental.
- **Jadwal Ronda Siskamling:** Informasi giliran ronda per malam per RT.
- **Galeri Dokumentasi:** Dokumentasi foto kegiatan gotong royong dan peringatan hari besar warga.

### Modul 5: Direktori UMKM Warga (8 RT)
- **Katalog Produk:** Daftar usaha kuliner, sembako, jasa servis, laundry, dan kerajinan warga.
- **Filter Pencarian:** Filter berdasarkan kategori usaha dan filter asal RT (misal: hanya menampilkan UMKM di RT 04).
- **Direct WhatsApp Order:** Tombol di tiap kartu produk yang langsung mengarah ke chat WhatsApp pemilik usaha dengan pesan otomatis.
- **Form Pendaftaran UMKM:** Formulir pendaftaran usaha mandiri oleh warga (status awal: `PENDING` verifikasi admin).

### Modul 6: Lapor RW & Hotline Darurat
- **Form Aduan Warga:** Input kategori (Kebersihan/Sampah, Penerangan Jalan, Keamanan, Fasilitas Umum), lokasi kejadian, deskripsi masalah, opsi pelapor anonim/cantumkan nomor HP.
- **Hotline Cepat:** Tombol panggilan darurat ke Pos Satpam Utama, Bhabinkamtibmas, Babinsa, Puskesmas terdekat, dan Pemadam Kebakaran.

### Modul 7: Panel Dashboard Pengurus (Admin RW)
- Autentikasi berbasis Username & Password.
- Manajemen Permohonan Surat: Tabel verifikasi dengan opsi ubah status (`PENDING` -> `DIPROSES` -> `SELESAI` / `DITOLAK`) dan catatan pengurus.
- Manajemen Aduan Warga: Tabel aduan masuk untuk dipantau dan ditandai selesai.
- Manajemen Agenda: Form penambahan pengumuman baru yang langsung tampil di Beranda.

---

## 4. Struktur Database (Google Sheets)

Nama File: **`DB_RW01_BENCONGAN_INDAH`**

### Tab 1: `Direktori_RT`
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `no_rt` | String | PK, Unique | Contoh: "RT 01", "RT 02", ..., "RT 08" |
| `nama_ketua_rt` | String | Non-Null | Nama lengkap Ketua RT |
| `wilayah_blok` | String | Non-Null | Contoh: "Blok A1 - A4 & Jl. Kenanga" |
| `no_whatsapp` | String | Non-Null | Format: 6281234567890 |
| `lokasi_pos_rt` | String | Nullable | Lokasi pos siskamling RT |

### Tab 2: `Pengajuan_Surat`
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id_pengajuan` | String | PK, Unique | Format: `SRT-202608-001` |
| `timestamp` | Datetime | Non-Null | Waktu warga mengisi form |
| `nama_pemohon` | String | Non-Null | Nama lengkap pemohon |
| `nik` | String | Non-Null (16 digit) | NIK pemohon |
| `rt_domisili` | String | Non-Null | Pilihan: RT 01 s/d RT 08 |
| `no_wa` | String | Non-Null | Nomor WhatsApp aktif |
| `jenis_surat` | String | Non-Null | Domisili / SKTM / Pengantar KTP / Usaha |
| `keperluan` | String | Non-Null | Deskripsi tujuan surat |
| `status` | Enum | Default: `PENDING` | `PENDING` / `DIPROSES` / `SELESAI` / `DITOLAK` |
| `catatan_admin` | String | Nullable | Catatan/keterangan dari pengurus RW |

### Tab 3: `Lapor_Warga`
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id_laporan` | String | PK, Unique | Format: `LAP-001` |
| `timestamp` | Datetime | Non-Null | Waktu laporan masuk |
| `nama_pelapor` | String | Non-Null | Nama warga atau "Anonim" |
| `rt_pelapor` | String | Non-Null | Pilihan: RT 01 s/d RT 08 |
| `kategori` | Enum | Non-Null | `Keamanan` / `Kebersihan` / `Lampu Jalan` / `Fasilitas` / `Lainnya` |
| `lokasi_kejadian` | String | Non-Null | Titik lokasi masalah |
| `isi_laporan` | String | Non-Null | Rincian keluhan atau aspirasi |
| `status` | Enum | Default: `TERKIRIM` | `TERKIRIM` / `DITINJAU` / `SELESAI` |

### Tab 4: `Pengumuman_Agenda`
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id_agenda` | String | PK, Unique | Format: `AGD-001` |
| `judul` | String | Non-Null | Judul kegiatan |
| `kategori` | Enum | Non-Null | `Kesehatan` / `Kerja Bakti` / `Keamanan` / `Pengumuman` |
| `tanggal_kegiatan` | Date | Non-Null | Tanggal pelaksanaan |
| `waktu_lokasi` | String | Non-Null | Contoh: "08:00 WIB - Balai Warga RW 01" |
| `deskripsi` | String | Non-Null | Detail isi pengumuman |
| `status_tampil` | Boolean | Default: `TRUE` | `TRUE` (tampil) / `FALSE` (arsip) |

### Tab 5: `UMKM_Warga`
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `id_usaha` | String | PK, Unique | Format: `UMKM-001` |
| `nama_usaha` | String | Non-Null | Nama toko / produk / jasa |
| `kategori` | Enum | Non-Null | `Kuliner` / `Jasa & Servis` / `Sembako` / `Fashion` |
| `asal_rt` | String | Non-Null | Pilihan: RT 01 s/d RT 08 |
| `nama_pemilik` | String | Non-Null | Nama warga pemilik usaha |
| `deskripsi_produk`| String | Non-Null | Menu, produk unggulan, atau harga |
| `no_whatsapp` | String | Non-Null | Nomor WA untuk transaksi/order |
| `status_verifikasi`| Enum | Default: `PENDING`| `APPROVED` / `PENDING` / `REJECTED` |

### Tab 6: `Users_Admin`
| Nama Kolom | Tipe Data | Constraint | Deskripsi |
| :--- | :--- | :--- | :--- |
| `username` | String | PK, Unique | Username login pengurus |
| `password_hash` | String | Non-Null | Hash password admin |
| `nama_pengurus` | String | Non-Null | Nama lengkap pengurus |
| `jabatan` | String | Non-Null | Contoh: "Sekretaris RW 01" |
| `role` | String | Default: `ADMIN` | `SUPER_ADMIN` / `ADMIN` |

---

## 5. Spesifikasi API Google Apps Script (`Code.gs`)

Seluruh komunikasi frontend Stitch ke backend Google Apps Script menggunakan request HTTP `POST` dengan format data JSON.

### Struktur Permintaan Umum:
```json
{
  "action": "NAMA_ACTION",
  "payload": { ... }
}
# 🔌 Panduan Integrasi API Google Apps Script & Frontend Stitch
## Website Profil & Layanan Digital RW 01 Bencongan Indah

Dokumen ini menjelaskan cara menggunakan backend Google Apps Script ([`Code.gs`](file:///d:/Pembuatan%20Website/profil_layanan_digital_rw_01_bencongan_indah/Code.gs)) yang terhubung ke Google Sheets **`DB_RW01_BENCONGAN_INDAH`**.

---

## 🚀 Langkah Deploy Backend Google Apps Script

1. **Buka Google Sheets**
   - Buat Google Sheets baru dengan nama **`DB_RW01_BENCONGAN_INDAH`**.
2. **Buka Editor Apps Script**
   - Klik menu **Ekstensi (Extensions)** ➔ **Apps Script**.
3. **Salin Kode**
   - Salin seluruh isi dari file [`Code.gs`](file:///d:/Pembuatan%20Website/profil_layanan_digital_rw_01_bencongan_indah/Code.gs) ke editor Apps Script.
4. **Jalankan Inisialisasi Database**
   - Pilih fungsi `setupDatabase` dari dropdown fungsi di bagian atas editor.
   - Klik **Jalankan (Run)** dan izinkan otorisasi akses Google Sheets.
   - Fungsi ini secara otomatis membuat 6 Tab Sheet (`Direktori_RT`, `Pengajuan_Surat`, `Lapor_Warga`, `Pengumuman_Agenda`, `UMKM_Warga`, `Users_Admin`) beserta header dan data awal (seed data 8 RT & akun admin default).
5. **Deploy sebagai Web App**
   - Klik **Terapkan (Deploy)** ➔ **Terapkan sebagai aplikasi web (New deployment)**.
   - **Jalankan sebagai (Execute as):** `Saya (Me)`
   - **Yang memiliki akses (Who has access):** `Siapa saja (Anyone)`
   - Klik **Deploy** dan salin **URL Web App** (contoh: `https://script.google.com/macros/s/AKfycbx.../exec`).

---

## 📡 Cara Pemanggilan API dari JavaScript (Frontend Stitch)

Gunakan perintah HTTP `POST` dengan format JSON ke URL Web App Google Apps Script.

### Contoh Universal Fetch Helper (JavaScript):
```javascript
const SCRIPT_URL = "URL_WEB_APP_GOOGLE_APPS_SCRIPT_ANDA";

async function callAPI(action, payload = {}) {
  try {
    const response = await fetch(SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8" // Menghindari CORS preflight issue pada Apps Script
      },
      body: JSON.stringify({ action: action, payload: payload })
    });
    return await response.json();
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, message: error.toString() };
  }
}
```

---

## 🛠️ Daftar Endpoint & Action API

### 1. Modul Layanan Surat Pengantar
- **Kirim Permohonan Surat (`submitSurat`)**
  ```javascript
  const res = await callAPI("submitSurat", {
    nama_pemohon: "Ahmad Warga",
    nik: "3671012345670001",
    rt_domisili: "RT 03", // Bisa "03" atau "RT 03"
    no_wa: "081234567890",
    jenis_surat: "Surat Keterangan Domisili",
    keperluan: "Persyaratan melamar pekerjaan"
  });
  // Output: { success: true, message: "...", data: { id_pengajuan: "SRT-202608-001", status: "PENDING" } }
  ```

- **Ambil Daftar / Status Surat (`getSuratList`)**
  ```javascript
  const res = await callAPI("getSuratList", { nik: "3671012345670001" });
  ```

- **Ubah Status Surat [Admin] (`updateSuratStatus`)**
  ```javascript
  const res = await callAPI("updateSuratStatus", {
    id_pengajuan: "SRT-202608-001",
    status: "SELESAI", // PENDING / DIPROSES / SELESAI / DITOLAK
    catatan_admin: "Surat telah ditandatangani Ketua RW dan dapat diambil di Balai Warga."
  });
  ```

---

### 2. Modul Lapor RW & Aduan Warga
- **Kirim Aduan/Laporan Warga (`submitLaporan`)**
  ```javascript
  const res = await callAPI("submitLaporan", {
    nama_pelapor: "Budi Santoso",
    is_anonim: false, // Set true jika ingin anonim
    rt_pelapor: "RT 01",
    kategori: "Lampu Jalan", // Keamanan / Kebersihan / Lampu Jalan / Fasilitas / Lainnya
    lokasi_kejadian: "Depan Blok A4 No. 12",
    isi_laporan: "Lampu penerangan jalan mati sejak 2 hari lalu."
  });
  // Output: { success: true, message: "...", data: { id_laporan: "LAP-001", status: "TERKIRIM" } }
  ```

- **Ambil Daftar Laporan Warga (`getLaporanList`)**
  ```javascript
  const res = await callAPI("getLaporanList", { status: "TERKIRIM" });
  ```

- **Ubah Status Laporan [Admin] (`updateLaporanStatus`)**
  ```javascript
  const res = await callAPI("updateLaporanStatus", {
    id_laporan: "LAP-001",
    status: "SELESAI" // TERKIRIM / DITINJAU / SELESAI
  });
  ```

---

### 3. Modul Agenda & Pengumuman
- **Ambil Agenda / Pengumuman (`getAgendaList`)**
  ```javascript
  // Untuk Publik (hanya yang aktif)
  const res = await callAPI("getAgendaList");

  // Untuk Admin (semua agenda termasuk arsip)
  const resAdmin = await callAPI("getAgendaList", { include_archived: true });
  ```

- **Tambah Agenda Baru [Admin] (`addAgenda`)**
  ```javascript
  const res = await callAPI("addAgenda", {
    judul: "Posyandu Balita Rutin",
    kategori: "Kesehatan",
    tanggal_kegiatan: "2026-08-25",
    waktu_lokasi: "08:00 WIB @ Balai Warga RW 01",
    deskripsi: "Pemeriksaan kesehatan gratis dan imunisasi balita."
  });
  ```

---

### 4. Modul Direktori 8 RT
- **Ambil Data Direktori 8 RT (`getDirektoriRT`)**
  ```javascript
  const res = await callAPI("getDirektoriRT");
  // Output data: Array 8 RT (RT 01 s/d RT 08)
  ```

- **Perbarui Data RT [Admin] (`updateDirektoriRT`)**
  ```javascript
  const res = await callAPI("updateDirektoriRT", {
    no_rt: "RT 01",
    nama_ketua_rt: "Bpk. Ahmad Subandi",
    no_whatsapp: "6281234567801",
    wilayah_blok: "Blok A1 - A4 & Jl. Kenanga 1",
    lokasi_pos_rt: "Depan Pos Ronda RT 01"
  });
  ```

---

### 5. Modul UMKM Warga
- **Ambil Katalog UMKM (`getUMKMList`)**
  ```javascript
  const res = await callAPI("getUMKMList", { asal_rt: "RT 02" });
  ```

- **Daftar UMKM Baru (`submitUMKM`)**
  ```javascript
  const res = await callAPI("submitUMKM", {
    nama_usaha: "Keripik Singkong Gurih",
    kategori: "Kuliner",
    asal_rt: "RT 04",
    nama_pemilik: "Ibu Siti",
    deskripsi_produk: "Keripik singkong aneka rasa: Balado, Keju, Original.",
    no_whatsapp: "6289876543210"
  });
  ```

---

### 6. Login Admin Pengurus (`loginAdmin`)
```javascript
const res = await callAPI("loginAdmin", {
  username: "admin",
  password: "admin123"
});
// Kredensial default: admin / admin123
```

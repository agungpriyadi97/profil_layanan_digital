# DOKUMENTASI FITUR PORTAL LAYANAN DIGITAL RW 01 BENCONGAN INDAH

**Dokumen Spesifikasi & Panduan Layanan Digital**  
*Dibuat untuk: Pengurus & Warga RW 01 Bencongan Indah*  
*Versi: 2.0 (Arsitektur MVC & Integrasi Google Sheets)*

---

## 📌 Ringkasan Eksekutif
Website **Portal Layanan Digital RW 01 Bencongan Indah** dirancang sebagai pusat pelayanan masyarakat berbasis web yang efisien, transparan, dan mudah diakses dari perangkat HP maupun Laptop. Sistem ini terintegrasi secara otomatis dengan **Google Sheets** dan **Google Drive** sebagai database backend, sehingga Pengurus RW tidak memerlukan server berbayar yang mahal.

---

## 📋 Breakdown Seluruh Fitur Website

### 1. Layanan Aspirasi & Pengaduan Warga
* **Fungsi & Cara Kerja:**
  Warga mengisi formulir online di website (nama, RT, kategori laporan, deskripsi, dan upload foto bukti jika ada). Laporan ini langsung masuk ke database Google Sheets admin dan mengirimkan notifikasi otomatis. Admin RW dapat memperbarui status penanganan (*Pending*, *Diproses*, *Selesai*).
* **Manfaat Nyata:**
  * **Warga:** Menyampaikan keluhan atau saran kapan saja tanpa harus datang langsung ke rumah Pengurus RW, serta bisa memantau tindak lanjut laporan.
  * **Pengurus RW:** Memiliki catatan pengaduan yang rapi, terarsip otomatis, dan tidak tercecer di grup WhatsApp, memudahkan evaluasi kinerja lingkungan.

---

### 2. Pendaftaran UMKM Warga & Promosi Usaha
* **Fungsi & Cara Kerja:**
  Warga pemilik usaha mengisi formulir pendaftaran UMKM yang mencakup Nama Usaha, Pemilik, Kontak WhatsApp, Deskripsi Produk, Kategori, serta **Upload Foto Produk**. Foto otomatis diunggah ke Google Drive dan link gambarnya disimpan di Google Sheets, lalu ditampilkan secara dinamis di katalog "UMKM Warga".
* **Manfaat Nyata:**
  * **Warga / Pelaku UMKM:** Memiliki wadah promosi gratis yang profesional untuk menjangkau pembeli sesama warga RW 01.
  * **Pengurus RW:** Mendukung pemberdayaan ekonomi lokal dan memiliki pendataan unit usaha warga yang valid dan terstruktur.

---

### 3. Permohonan Surat Pengantar Online
* **Fungsi & Cara Kerja:**
  Warga yang membutuhkan Surat Pengantar (Domisili, SKTM, Pengurusan KTP/KK, dll) mengisi formulir pengajuan dengan melampirkan data diri dan dokumen pendukung. Sistem mencatat waktu pengajuan dan memberikan nomor resi/tracking status.
* **Manfaat Nyata:**
  * **Warga:** Menghemat waktu tanpa perlu bolak-balik mencari Ketua RT/RW hanya untuk minta formulir blanko.
  * **Pengurus RW:** Verifikasi data warga menjadi lebih cepat, akurat, dan dapat disiapkan sebelum warga mengambil dokumen fisik.

---

### 4. Admin Dashboard (Manajemen Data & Keamanan Action Status)
* **Fungsi & Cara Kerja:**
  Halaman khusus pengurus untuk melihat seluruh rekap aspirasi, pendaftaran UMKM, dan permohonan surat. Dilengkapi fitur ubah status penanganan (*Pending* -> *Diproses* -> *Selesai*). Ketika status diubah menjadi **"Selesai"**, tombol aksi otomatis **Terkunci (Locked)** demi keamanan data agar tidak disalahgunakan atau diubah secara tidak sengaja.
* **Manfaat Nyata:**
  * **Pengurus RW:** Pengelolaan data menjadi aman, transparan, dan tidak ada risiko data yang sudah selesai diubah kembali secara sengaja maupun tidak sengaja.

---

### 5. Informasi Profil RW, Visi Misi & Pengumuman
* **Fungsi & Cara Kerja:**
  Menampilkan profil singkat RW 01 Bencongan Indah, daftar pengurus, visi & misi lingkungan, serta papan pengumuman/agenda kegiatan publik yang diperbarui secara berkala.
* **Manfaat Nyata:**
  * **Warga:** Mendapatkan informasi resmi, akurat, dan terpercaya langsung dari pengurus tanpa terpengaruh isu/hoaks.
  * **Pengurus RW:** Membangun citra kepengurusan yang modern, terbuka, dan akuntabel.

---

### 6. Arsitektur Modern (MVC & Responsive Mobile Friendly)
* **Fungsi & Cara Kerja:**
  Sistem dibangun menggunakan standar **MVC (Model-View-Controller)** yang memisahkan antara tampilan (UI), logika bisnis, dan data. Desain disesuaikan agar sangat ringan dan nyaman dibuka dari layar smartphone.
* **Manfaat Nyata:**
  * **Pengguna:** Tampilan sangat cepat diproses di HP warga, tidak patah-patah, serta tombol aksi memiliki respon visual (hover & micro-interactions) yang jelas.
  * **Pengembang / RW:** Kode rapi dan mudah dirawat atau ditambah fitur baru di masa mendatang tanpa merusak sistem yang ada.

---

## 🛠️ Spesifikasi Teknis Ringkas
* **Frontend:** HTML5, CSS3 (Modern Responsive Flex/Grid), Pure JavaScript (MVC Architecture)
* **Backend Database:** Google Apps Script (`Code.gs`), Google Sheets API, Google Drive Storage
* **Keamanan:** Lock Status Mechanism (`🔒 Terkunci`), CORS Handling, Validasi Input Form
* **Hosting:** Vercel / GitHub Pages Ready

---
*Dokumen ini dibuat otomatis oleh Sistem Pengembangan Website Layanan Digital RW 01 Bencongan Indah.*

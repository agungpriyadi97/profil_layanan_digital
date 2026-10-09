/**
 * ==============================================================================
 * BACKEND GOOGLE APPS SCRIPT (Code.gs) - INDEPENDENT & AUTO-LINKING SPREADSHEET
 * Website Profil & Layanan Digital RW 01 Bencongan Indah
 * ==============================================================================
 */

const SHEET_NAMES = {
  DIREKTORI_RT: "Direktori_RT",
  PENGAJUAN_SURAT: "Pengajuan_Surat",
  LAPOR_WARGA: "Lapor_Warga",
  PENGUMUMAN_AGENDA: "Pengumuman_Agenda",
  UMKM_WARGA: "UMKM_Warga",
  USERS_ADMIN: "Users_Admin",
  KAS_RW: "Kas_RW"
};

const DRIVE_FOLDER_NAME = "BERKAS_RW01_PORTAL";

// Opsional: Masukkan ID Google Sheet jika Anda menggunakan Standalone Script.
// Kosongkan "" jika script ini dibuat langsung dari dalam Google Spreadsheet (Container-bound).
const SPREADSHEET_ID = "10slvt37T_P4cEyIkKINfuX2fPDPzhy10eiznN59xEaA";

/**
 * Mendapatkan instance Spreadsheet baik Container-bound maupun Standalone Script
 */
function getActiveSpreadsheet() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    if (ss) return ss;
  } catch (e) {}

  if (SPREADSHEET_ID && SPREADSHEET_ID.trim() !== "") {
    return SpreadsheetApp.openById(SPREADSHEET_ID.trim());
  }

  const props = PropertiesService.getScriptProperties();
  let savedId = props.getProperty("SPREADSHEET_ID");
  if (savedId) {
    try {
      return SpreadsheetApp.openById(savedId);
    } catch (e) {}
  }

  // Jika standalone dan belum ada ID, buat otomatis Spreadsheet di Google Drive
  const newSs = SpreadsheetApp.create("DB_RW01_BENCONGAN_INDAH");
  props.setProperty("SPREADSHEET_ID", newSs.getId());
  return newSs;
}

function doGet(e) {
  try {
    const params = e ? e.parameter : {};
    const action = params.action;

    if (action) {
      if (action === "healthCheck") {
        return jsonResponse({
          success: true,
          message: "Backend API RW 01 Bencongan Indah is active and running.",
          timestamp: new Date().toISOString()
        });
      }
      const payload = params.payload ? JSON.parse(params.payload) : params;
      const result = handleApiRequest(action, payload);
      return jsonResponse(result);
    }

    return HtmlService.createTemplateFromFile('index')
      .evaluate()
      .setTitle('Portal Layanan Digital RW 01 Bencongan Indah')
      .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
      .addMetaTag('viewport', 'width=device-width, initial-scale=1');

  } catch (error) {
    return HtmlService.createHtmlOutput(
      "<div style='font-family: sans-serif; padding: 20px; color: #b91c1c;'>" +
      "<h2>Gagal Memuat Halaman</h2>" +
      "<p>Pastikan file <b>index.html</b> sudah tersedia.</p>" +
      "<p><small>" + error.toString() + "</small></p>" +
      "</div>"
    );
  }
}

function doPost(e) {
  try {
    let postData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        postData = JSON.parse(e.postData.contents);
      } catch (err) {
        postData = e.parameter || {};
      }
    } else if (e && e.parameter) {
      postData = e.parameter;
    }

    const action = postData.action;
    const payload = postData.payload || postData;

    if (!action) {
      return jsonResponse({
        success: false,
        message: "Parameter 'action' tidak ditemukan dalam payload request."
      });
    }

    const result = handleApiRequest(action, payload);
    return jsonResponse(result);
  } catch (error) {
    return jsonResponse({
      success: false,
      message: "Terjadi kesalahan server: " + error.toString()
    });
  }
}

function handleApiRequest(action, payload) {
  try {
    switch (action) {
      case "getDirektoriRT":
        return getDirektoriRT();
      case "updateDirektoriRT":
        return updateDirektoriRT(payload);

      case "submitSurat":
      case "createSurat":
        return submitSurat(payload);
      case "getSuratList":
        return getSuratList(payload);
      case "updateSuratStatus":
        return updateSuratStatus(payload);

      case "submitLaporan":
      case "createLaporan":
        return submitLaporan(payload);
      case "getLaporanList":
        return getLaporanList(payload);
      case "updateLaporanStatus":
        return updateLaporanStatus(payload);

      case "getAgendaList":
        return getAgendaList(payload);
      case "addAgenda":
      case "createAgenda":
        return addAgenda(payload);
      case "updateAgenda":
        return updateAgenda(payload);
      case "deleteAgenda":
        return deleteAgenda(payload);

      case "getUMKMList":
        return getUMKMList(payload);
      case "submitUMKM":
      case "createUMKM":
        return submitUMKM(payload);
      case "updateUMKMStatus":
        return updateUMKMStatus(payload);

      case "getKasRW":
        return getKasRW();
      case "updateKasRW":
        return updateKasRW(payload);

      case "loginAdmin":
        return loginAdmin(payload);
      case "initDatabase":
      case "setupDatabase":
        return setupDatabase();

      default:
        return { success: false, message: "Action '" + action + "' tidak dikenali." };
    }
  } catch (err) {
    return { success: false, message: "Server Exception: " + err.toString() };
  }
}

/**
 * Helper untuk menyimpan Base64 file ke Google Drive
 */
function saveFileToDrive(base64Data, fileName) {
  if (!base64Data) return "-";
  try {
    const folders = DriveApp.getFoldersByName(DRIVE_FOLDER_NAME);
    let folder = folders.hasNext() ? folders.next() : DriveApp.createFolder(DRIVE_FOLDER_NAME);
    folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    const parts = base64Data.split(",");
    const contentType = parts[0].match(/:(.*?);/)[1];
    const decodedData = Utilities.base64Decode(parts[1]);
    const blob = Utilities.newBlob(decodedData, contentType, fileName);

    const file = folder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    return "https://drive.google.com/thumbnail?id=" + file.getId() + "&sz=w800";
  } catch (err) {
    return "Error Upload: " + err.toString();
  }
}

// ------------------- MODUL PENGAJUAN SURAT -------------------
function submitSurat(payload) {
  if (!payload.nama_pemohon || !payload.nik || !payload.rt_domisili || !payload.no_wa || !payload.jenis_surat) {
    return {
      success: false,
      message: "Lengkapi data wajib: Nama Lengkap, NIK, RT Domisili, No. WhatsApp, dan Jenis Surat."
    };
  }

  const cleanNik = String(payload.nik).trim();
  if (cleanNik.length !== 16 || isNaN(cleanNik)) {
    return { success: false, message: "NIK harus berjumlah 16 digit angka valid." };
  }

  const sheet = getSheet(SHEET_NAMES.PENGAJUAN_SURAT);
  const now = new Date();
  const idPengajuan = generateId("SRT", sheet);
  const timestamp = formatDate(now);

  // Proses Upload Berkas jika ada
  let linkBerkas = "-";
  if (payload.file_data) {
    const fileName = "KTP_KK_" + idPengajuan + "_" + (payload.file_name || "dokumen.jpg");
    linkBerkas = saveFileToDrive(payload.file_data, fileName);
  }

  const newRow = [
    idPengajuan,
    timestamp,
    payload.nama_pemohon.trim(),
    cleanNik,
    formatRtName(payload.rt_domisili),
    payload.no_wa.trim(),
    payload.jenis_surat.trim(),
    payload.keperluan ? payload.keperluan.trim() : "-",
    linkBerkas,
    "PENDING",
    payload.catatan_admin || ""
  ];

  sheet.appendRow(newRow);

  return {
    success: true,
    message: "Permohonan surat pengantar berhasil dikirim! Nomor ID Pengajuan Anda: " + idPengajuan,
    data: {
      id_pengajuan: idPengajuan,
      status: "PENDING",
      timestamp: timestamp,
      link_berkas: linkBerkas
    }
  };
}

function getSuratList(payload) {
  const data = getSheetData(SHEET_NAMES.PENGAJUAN_SURAT);

  if (payload && (payload.nik || payload.query || payload.id_pengajuan)) {
    const q = String(payload.nik || payload.query || payload.id_pengajuan).trim().toLowerCase();
    const filtered = data.filter(item =>
      String(item.nik).toLowerCase().includes(q) ||
      String(item.id_pengajuan).toLowerCase().includes(q) ||
      String(item.nama_pemohon).toLowerCase().includes(q)
    );
    return { success: true, count: filtered.length, data: filtered };
  }

  return { success: true, count: data.length, data: data };
}

function updateSuratStatus(payload) {
  if (!payload.id_pengajuan || !payload.status) {
    return { success: false, message: "id_pengajuan dan status wajib diisi." };
  }

  const sheet = getSheet(SHEET_NAMES.PENGAJUAN_SURAT);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx = headers.indexOf("id_pengajuan");
  const statusIdx = headers.indexOf("status");
  const catatanIdx = headers.indexOf("catatan_admin");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === String(payload.id_pengajuan).trim()) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(payload.status.toUpperCase());
      if (payload.catatan_admin !== undefined && catatanIdx !== -1) {
        sheet.getRange(i + 1, catatanIdx + 1).setValue(payload.catatan_admin);
      }
      return {
        success: true,
        message: "Status pengajuan surat " + payload.id_pengajuan + " berhasil diperbarui menjadi " + payload.status.toUpperCase()
      };
    }
  }

  return { success: false, message: "Data pengajuan surat tidak ditemukan." };
}

// ------------------- MODUL LAPOR WARGA -------------------
function submitLaporan(payload) {
  if (!payload.rt_pelapor || !payload.kategori || !payload.lokasi_kejadian || !payload.isi_laporan) {
    return {
      success: false,
      message: "Lengkapi data wajib aduan: RT Pelapor, Kategori, Lokasi Kejadian, dan Isi Laporan."
    };
  }

  const sheet = getSheet(SHEET_NAMES.LAPOR_WARGA);
  const now = new Date();
  const idLaporan = generateId("LPR", sheet);
  const timestamp = formatDate(now);
  const namaPelapor = payload.is_anonim ? "Anonim" : (payload.nama_pelapor ? payload.nama_pelapor.trim() : "Warga");

  // Upload Foto Bukti jika ada
  let linkFoto = "-";
  if (payload.file_data) {
    const fileName = "ADUAN_" + idLaporan + "_" + (payload.file_name || "foto.jpg");
    linkFoto = saveFileToDrive(payload.file_data, fileName);
  }

  const newRow = [
    idLaporan,
    timestamp,
    namaPelapor,
    formatRtName(payload.rt_pelapor),
    payload.kategori.trim(),
    payload.lokasi_kejadian.trim(),
    payload.isi_laporan.trim(),
    linkFoto,
    "PENDING"
  ];

  sheet.appendRow(newRow);

  return {
    success: true,
    message: "Laporan aduan lingkungan berhasil dikirim dengan ID: " + idLaporan,
    data: {
      id_laporan: idLaporan,
      status: "PENDING",
      timestamp: timestamp,
      link_foto: linkFoto
    }
  };
}

function getLaporanList(payload) {
  const data = getSheetData(SHEET_NAMES.LAPOR_WARGA);
  let filtered = data;

  if (payload && payload.kategori) {
    filtered = filtered.filter(item => String(item.kategori).toLowerCase() === String(payload.kategori).toLowerCase());
  }
  if (payload && payload.rt_pelapor) {
    filtered = filtered.filter(item => String(item.rt_pelapor).trim() === formatRtName(payload.rt_pelapor));
  }

  return { success: true, count: filtered.length, data: filtered };
}

function updateLaporanStatus(payload) {
  if (!payload.id_laporan || !payload.status) {
    return { success: false, message: "id_laporan dan status wajib diisi." };
  }

  const sheet = getSheet(SHEET_NAMES.LAPOR_WARGA);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf("id_laporan");
  const statusIdx = headers.indexOf("status");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === String(payload.id_laporan).trim()) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(payload.status.toUpperCase());
      return {
        success: true,
        message: "Status laporan " + payload.id_laporan + " diperbarui menjadi " + payload.status.toUpperCase()
      };
    }
  }

  return { success: false, message: "Data laporan tidak ditemukan." };
}

// ------------------- DIREKTORI 8 RT -------------------
function getDirektoriRT() {
  const data = getSheetData(SHEET_NAMES.DIREKTORI_RT);
  return { success: true, count: data.length, data: data };
}

function updateDirektoriRT(payload) {
  if (!payload.no_rt) return { success: false, message: "no_rt wajib diisi." };
  const sheet = getSheet(SHEET_NAMES.DIREKTORI_RT);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const noRtIdx = headers.indexOf("no_rt");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][noRtIdx]).trim().toLowerCase() === String(payload.no_rt).trim().toLowerCase()) {
      if (payload.nama_ketua_rt !== undefined) sheet.getRange(i + 1, headers.indexOf("nama_ketua_rt") + 1).setValue(payload.nama_ketua_rt);
      if (payload.wilayah_blok !== undefined) sheet.getRange(i + 1, headers.indexOf("wilayah_blok") + 1).setValue(payload.wilayah_blok);
      if (payload.no_whatsapp !== undefined) sheet.getRange(i + 1, headers.indexOf("no_whatsapp") + 1).setValue(payload.no_whatsapp);
      if (payload.lokasi_pos_rt !== undefined) sheet.getRange(i + 1, headers.indexOf("lokasi_pos_rt") + 1).setValue(payload.lokasi_pos_rt);
      return { success: true, message: "Data RT berhasil diperbarui." };
    }
  }
  return { success: false, message: "RT tidak ditemukan." };
}

// ------------------- AGENDA & PENGUMUMAN -------------------
function getAgendaList(payload) {
  let data = getSheetData(SHEET_NAMES.PENGUMUMAN_AGENDA);
  if (!(payload && payload.include_archived === true)) {
    data = data.filter(item => item.status_tampil === true || String(item.status_tampil).toUpperCase() === "TRUE");
  }
  return { success: true, count: data.length, data: data };
}

function addAgenda(payload) {
  const sheet = getSheet(SHEET_NAMES.PENGUMUMAN_AGENDA);
  const idAgenda = generateId("AGD", sheet);
  sheet.appendRow([idAgenda, payload.judul, payload.kategori, payload.tanggal_kegiatan, payload.waktu_lokasi, payload.deskripsi, true]);
  return { success: true, message: "Agenda baru berhasil disimpan.", data: { id_agenda: idAgenda } };
}

function updateAgenda(payload) {
  const sheet = getSheet(SHEET_NAMES.PENGUMUMAN_AGENDA);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf("id_agenda");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === String(payload.id_agenda).trim()) {
      if (payload.judul) sheet.getRange(i + 1, headers.indexOf("judul") + 1).setValue(payload.judul);
      if (payload.kategori) sheet.getRange(i + 1, headers.indexOf("kategori") + 1).setValue(payload.kategori);
      if (payload.tanggal_kegiatan) sheet.getRange(i + 1, headers.indexOf("tanggal_kegiatan") + 1).setValue(payload.tanggal_kegiatan);
      if (payload.waktu_lokasi) sheet.getRange(i + 1, headers.indexOf("waktu_lokasi") + 1).setValue(payload.waktu_lokasi);
      if (payload.deskripsi) sheet.getRange(i + 1, headers.indexOf("deskripsi") + 1).setValue(payload.deskripsi);
      return { success: true, message: "Agenda berhasil diperbarui." };
    }
  }
  return { success: false, message: "Agenda tidak ditemukan." };
}

function deleteAgenda(payload) {
  const sheet = getSheet(SHEET_NAMES.PENGUMUMAN_AGENDA);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const idIdx = headers.indexOf("id_agenda");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === String(payload.id_agenda).trim()) {
      sheet.deleteRow(i + 1);
      return { success: true, message: "Agenda berhasil dihapus." };
    }
  }
  return { success: false, message: "Agenda tidak ditemukan." };
}

// ------------------- UMKM WARGA -------------------
function getUMKMList(payload) {
  const data = getSheetData(SHEET_NAMES.UMKM_WARGA);
  let filtered = data;

  const includeAll = payload && payload.include_all === true;
  if (!includeAll) {
    filtered = filtered.filter(item => String(item.status_verifikasi).toUpperCase() === "APPROVED");
  }

  if (payload && payload.asal_rt) {
    filtered = filtered.filter(item => String(item.asal_rt).trim() === formatRtName(payload.asal_rt));
  }
  if (payload && payload.kategori) {
    filtered = filtered.filter(item => String(item.kategori).toLowerCase() === String(payload.kategori).toLowerCase());
  }

  return {
    success: true,
    count: filtered.length,
    data: filtered
  };
}

function submitUMKM(payload) {
  if (!payload.nama_usaha || !payload.kategori || !payload.asal_rt || !payload.nama_pemilik || !payload.no_whatsapp) {
    return {
      success: false,
      message: "Lengkapi data wajib UMKM: Nama Usaha, Kategori, Asal RT, Nama Pemilik, dan No. WhatsApp."
    };
  }

  let linkFoto = "-";
  if (payload.file_data && payload.file_name) {
    linkFoto = saveFileToDrive(payload.file_data, payload.file_name, "UMKM_" + payload.nama_usaha);
  }

  const sheet = getSheet(SHEET_NAMES.UMKM_WARGA);
  const idUsaha = generateId("UMKM", sheet);

  const newRow = [
    idUsaha,
    payload.nama_usaha.trim(),
    payload.kategori.trim(),
    formatRtName(payload.asal_rt),
    payload.nama_pemilik.trim(),
    payload.deskripsi_produk ? payload.deskripsi_produk.trim() : "-",
    payload.no_whatsapp.trim(),
    "APPROVED",
    linkFoto
  ];

  sheet.appendRow(newRow);

  return {
    success: true,
    message: "Pendaftaran UMKM berhasil dikirim dan tersimpan.",
    data: {
      id_usaha: idUsaha,
      link_foto: linkFoto,
      status_verifikasi: "APPROVED"
    }
  };
}

function updateUMKMStatus(payload) {
  if (!payload.id_usaha || !payload.status_verifikasi) {
    return { success: false, message: "id_usaha dan status_verifikasi wajib diisi." };
  }

  const sheet = getSheet(SHEET_NAMES.UMKM_WARGA);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];

  const idIdx = headers.indexOf("id_usaha");
  const statusIdx = headers.indexOf("status_verifikasi");

  for (let i = 1; i < data.length; i++) {
    if (String(data[i][idIdx]).trim() === String(payload.id_usaha).trim()) {
      sheet.getRange(i + 1, statusIdx + 1).setValue(payload.status_verifikasi.toUpperCase());
      return {
        success: true,
        message: "Status UMKM " + payload.id_usaha + " berhasil diubah menjadi " + payload.status_verifikasi.toUpperCase()
      };
    }
  }

  return { success: false, message: "Data UMKM tidak ditemukan." };
}

// ------------------- ADMIN LOGIN -------------------
function loginAdmin(payload) {
  if (!payload.username || !payload.password) {
    return { success: false, message: "Username dan password wajib diisi." };
  }

  const data = getSheetData(SHEET_NAMES.USERS_ADMIN);
  const passHash = hashPassword(payload.password);

  const user = data.find(item =>
    String(item.username).trim().toLowerCase() === String(payload.username).trim().toLowerCase() &&
    String(item.password_hash) === passHash
  );

  if (user) {
    return {
      success: true,
      message: "Login berhasil! Selamat datang " + user.nama_pengurus,
      user: {
        username: user.username,
        nama_pengurus: user.nama_pengurus,
        jabatan: user.jabatan,
        role: user.role
      }
    };
  }

  return { success: false, message: "Username atau password salah." };
}

// ------------------- MODUL KAS RW -------------------
function getKasRW() {
  const data = getSheetData(SHEET_NAMES.KAS_RW);
  if (data.length > 0) {
    return { success: true, data: data[0] };
  }
  return {
    success: true,
    data: {
      saldo_kas: 18450000,
      pemasukan_bulan_ini: 4200000,
      pengeluaran_bulan_ini: 1750000,
      update_terakhir: "Oktober 2026"
    }
  };
}

function updateKasRW(payload) {
  const sheet = getSheet(SHEET_NAMES.KAS_RW);
  const data = sheet.getDataRange().getValues();
  if (data.length > 1) {
    if (payload.saldo_kas !== undefined) sheet.getRange(2, 1).setValue(payload.saldo_kas);
    if (payload.pemasukan_bulan_ini !== undefined) sheet.getRange(2, 2).setValue(payload.pemasukan_bulan_ini);
    if (payload.pengeluaran_bulan_ini !== undefined) sheet.getRange(2, 3).setValue(payload.pengeluaran_bulan_ini);
    if (payload.update_terakhir !== undefined) sheet.getRange(2, 4).setValue(payload.update_terakhir);
  } else {
    sheet.appendRow([
      payload.saldo_kas || 18450000,
      payload.pemasukan_bulan_ini || 4200000,
      payload.pengeluaran_bulan_ini || 1750000,
      payload.update_terakhir || "Oktober 2026"
    ]);
  }
  return { success: true, message: "Data kas RW berhasil diperbarui." };
}

// ------------------- SETUP DATABASE -------------------
function setupDatabase() {
  const ss = getActiveSpreadsheet();

  let sheetRT = getOrCreateSheet(ss, SHEET_NAMES.DIREKTORI_RT);
  if (sheetRT.getLastRow() === 0) {
    sheetRT.appendRow(["no_rt", "nama_ketua_rt", "wilayah_blok", "no_whatsapp", "lokasi_pos_rt"]);
    const seedRT = [
      ["RT 01", "Bpk. Agus Riyadi", "Blok A1 - A4 & Jl. Merpati Raya", "6281234567801", "Pos Ronda Blok A2"],
      ["RT 02", "Bpk. Hendra Gunawan", "Blok B1 - B5 & Jl. Kenari", "6281234567802", "Pos Ronda Blok B3"],
      ["RT 03", "Bpk. Candra Wijaya", "Blok C1 - C5 & Jl. Melati", "6281234567803", "Pos Keamanan Blok C1"],
      ["RT 04", "Bpk. Dedi Supriyadi", "Blok D1 - D5 & Jl. Mawar", "6281234567804", "Pos Kamling Utama RT 04"],
      ["RT 05", "Bpk. Eko Prasetyo", "Blok E1 - E4 & Jl. Anggrek", "6281234567805", "Pos Siskamling Blok E2"],
      ["RT 06", "Bpk. Farhan Kurnia", "Blok F1 - F4 & Jl. Flamboyan", "6281234567806", "Pos Warga RT 06"],
      ["RT 07", "Bpk. Gunawan Wibowo", "Blok G1 - G5 & Jl. Cempaka", "6281234567807", "Pos Ronda Blok G2"],
      ["RT 08", "Bpk. Sutrisno", "Blok H1 - H5 & Taman Terbuka", "6281234567808", "Pos Siskamling Taman RT 08"]
    ];
    seedRT.forEach(row => sheetRT.appendRow(row));
  }

  let sheetSurat = getOrCreateSheet(ss, SHEET_NAMES.PENGAJUAN_SURAT);
  if (sheetSurat.getLastRow() === 0) {
    sheetSurat.appendRow(["id_pengajuan", "timestamp", "nama_pemohon", "nik", "rt_domisili", "no_wa", "jenis_surat", "keperluan", "link_berkas", "status", "catatan_admin"]);
  }

  let sheetLapor = getOrCreateSheet(ss, SHEET_NAMES.LAPOR_WARGA);
  if (sheetLapor.getLastRow() === 0) {
    sheetLapor.appendRow(["id_laporan", "timestamp", "nama_pelapor", "rt_pelapor", "kategori", "lokasi_kejadian", "isi_laporan", "link_foto", "status"]);
  }

  let sheetAgenda = getOrCreateSheet(ss, SHEET_NAMES.PENGUMUMAN_AGENDA);
  if (sheetAgenda.getLastRow() === 0) {
    sheetAgenda.appendRow(["id_agenda", "judul", "kategori", "tanggal_kegiatan", "waktu_lokasi", "deskripsi", "status_tampil"]);
    sheetAgenda.appendRow(["AGD-001", "Posyandu Balita & Lansia Rutin", "Kesehatan", "2026-08-25", "08:00 - 11:30 WIB @ Balai Warga", "Pemeriksaan kesehatan gratis dan vitamin.", true]);
  }

  let sheetUMKM = getOrCreateSheet(ss, SHEET_NAMES.UMKM_WARGA);
  if (sheetUMKM.getLastRow() === 0) {
    sheetUMKM.appendRow(["id_usaha", "nama_usaha", "kategori", "asal_rt", "nama_pemilik", "deskripsi_produk", "no_whatsapp", "status_verifikasi"]);
    sheetUMKM.appendRow(["UMKM-001", "Warung Bu Siti - Mie Ayam", "Kuliner", "RT 02", "Ibu Siti", "Mie ayam jamur spesial dan pangsit.", "6281298765432", "APPROVED"]);
  }

  let sheetAdmin = getOrCreateSheet(ss, SHEET_NAMES.USERS_ADMIN);
  if (sheetAdmin.getLastRow() === 0) {
    sheetAdmin.appendRow(["username", "password_hash", "nama_pengurus", "jabatan", "role"]);
    sheetAdmin.appendRow(["admin", hashPassword("admin123"), "Bpk. H. Sudirman", "Ketua RW 01", "SUPER_ADMIN"]);
  }

  let sheetKas = getOrCreateSheet(ss, SHEET_NAMES.KAS_RW);
  if (sheetKas.getLastRow() === 0) {
    sheetKas.appendRow(["saldo_kas", "pemasukan_bulan_ini", "pengeluaran_bulan_ini", "update_terakhir"]);
    sheetKas.appendRow([18450000, 4200000, 1750000, "Oktober 2026"]);
  }

  return { success: true, message: "Database dan tabel siap digunakan." };
}

function getSheet(name) {
  const ss = getActiveSpreadsheet();
  let s = ss.getSheetByName(name);
  if (!s) { setupDatabase(); s = ss.getSheetByName(name); }
  return s;
}

function getOrCreateSheet(ss, name) {
  let s = ss.getSheetByName(name);
  if (!s) s = ss.insertSheet(name);
  return s;
}

function getSheetData(name) {
  const sheet = getSheet(name);
  const data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  const headers = data[0];
  const res = [];
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const item = {};
    for (let j = 0; j < headers.length; j++) {
      let val = row[j];
      if (val instanceof Date) val = formatDate(val);
      item[headers[j]] = val;
    }
    res.push(item);
  }
  return res;
}

function generateId(prefix, sheet) {
  const lastRow = sheet.getLastRow();
  let nextNumber = 1;
  if (lastRow > 1) {
    const lastId = String(sheet.getRange(lastRow, 1).getValue());
    const parts = lastId.split("-");
    const num = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(num)) nextNumber = num + 1;
  }
  const padded = String(nextNumber).padStart(3, "0");
  if (prefix === "SRT") {
    const d = new Date();
    const ym = d.getFullYear().toString() + String(d.getMonth() + 1).padStart(2, "0");
    return "SRT-" + ym + "-" + padded;
  }
  return prefix + "-" + padded;
}

function formatDate(date) {
  if (!(date instanceof Date)) return date;
  const pad = (n) => String(n).padStart(2, "0");
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + " " + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
}

function formatRtName(rt) {
  if (!rt) return "RT 01";
  const num = String(rt).replace(/[^0-9]/g, "");
  return num ? "RT " + String(num).padStart(2, "0") : String(rt);
}

function hashPassword(p) {
  if (!p) return "";
  const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, p, Utilities.Charset.UTF_8);
  return digest.map(b => (b < 0 ? b + 256 : b).toString(16).padStart(2, "0")).join("");
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

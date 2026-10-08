/**
 * ==============================================================================
 * MODEL: API CLIENT (js/models/ApiModel.js)
 * Handles communications between Frontend View and Google Apps Script Backend
 * ==============================================================================
 */

class ApiModel {
  static async call(action, payload = {}) {
    // 1. Native Google Apps Script execution when rendered inside Apps Script iframe
    if (typeof google !== "undefined" && google.script && google.script.run) {
      return new Promise((resolve) => {
        google.script.run
          .withSuccessHandler((res) => {
            resolve(res || { success: false, message: "Tidak ada data dari server" });
          })
          .withFailureHandler((err) => {
            console.error("[Apps Script Native Error]:", err);
            resolve({ success: false, message: "Error Apps Script: " + err.toString() });
          })
          .handleApiRequest(action, payload);
      });
    }

    // 2. HTTP Fetch fallback for standalone HTML / external hosting
    let targetUrl = CONFIG.APPS_SCRIPT_URL;

    try {
      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ action: action, payload: payload })
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.warn(`[API Fallback - ${action}]: Server fetch failed, using local mock data.`, error);
      return ApiModel.getFallbackData(action, payload);
    }
  }

  static getFallbackData(action, payload) {
    if (action === 'getAgendaList') {
      return {
        success: true,
        data: [
          { judul: "Posyandu Balita & Lansia RW 01", kategori: "Kesehatan", deskripsi: "Pemeriksaan kesehatan gratis, penimbangan balita, dan pemberian vitamin bulanan di Balai Warga.", tanggal_kegiatan: "Sabtu, 14 Oktober 2026", waktu_lokasi: "08.00 - 11.30 WIB @ Posyandu RW 01" },
          { judul: "Kerja Bakti & Gotong Royong Serentak 8 RT", kategori: "Lingkungan", deskripsi: "Pembersihan saluran drainase utama menjelang musim hujan dan perapihan lingkungan bersama warga.", tanggal_kegiatan: "Minggu, 22 Oktober 2026", waktu_lokasi: "07.00 - 10.00 WIB @ Lingkungan RT 01-08" },
          { judul: "Musyawarah Warga & Siskamling", kategori: "Rapat Warga", deskripsi: "Rapat koordinasi pengurus RW dan Ketua RT 01 s/d 08 pembahasan jadwal ronda malam.", tanggal_kegiatan: "Jumat, 27 Oktober 2026", waktu_lokasi: "19.30 WIB @ Sekretariat RW 01" }
        ]
      };
    }

    if (action === 'getDirektoriRT') {
      return {
        success: true,
        data: [
          { no_rt: "RT 01", nama_ketua_rt: "Bpk. H. Ahmad Fauzi", wilayah_blok: "Blok A1 - A12", lokasi_pos_rt: "Jl. Taman Bencongan No. 1", no_whatsapp: "081234567801" },
          { no_rt: "RT 02", nama_ketua_rt: "Bpk. Bambang Suherman", wilayah_blok: "Blok B1 - B15", lokasi_pos_rt: "Jl. Bencongan Indah 2", no_whatsapp: "081234567802" },
          { no_rt: "RT 03", nama_ketua_rt: "Bpk. Drs. Supriadi", wilayah_blok: "Blok C1 - C10", lokasi_pos_rt: "Pos Siskamling RT 03", no_whatsapp: "081234567803" },
          { no_rt: "RT 04", nama_ketua_rt: "Bpk. Eko Prasetyo", wilayah_blok: "Blok D1 - D18", lokasi_pos_rt: "Jl. Flamboyan Blok D", no_whatsapp: "081234567804" },
          { no_rt: "RT 05", nama_ketua_rt: "Bpk. Hendra Wijaya", wilayah_blok: "Blok E1 - E14", lokasi_pos_rt: "Pos Kemuning RT 05", no_whatsapp: "081234567805" },
          { no_rt: "RT 06", nama_ketua_rt: "Bpk. M. Ridwan", wilayah_blok: "Blok F1 - F12", lokasi_pos_rt: "Jl. Mawar Raya No. 6", no_whatsapp: "081234567806" },
          { no_rt: "RT 07", nama_ketua_rt: "Bpk. Agus Santoso", wilayah_blok: "Blok G1 - G20", lokasi_pos_rt: "Pos Anggrek RT 07", no_whatsapp: "081234567807" },
          { no_rt: "RT 08", nama_ketua_rt: "Bpk. Tri Cahyono", wilayah_blok: "Blok H1 - H16", lokasi_pos_rt: "Jl. Dahlia Utama RT 08", no_whatsapp: "081234567808" }
        ]
      };
    }

    if (action === 'getUMKMList') {
      return {
        success: true,
        data: [
          { id_umkm: "UMKM-01", nama_usaha: "Dapur Mamah Ani (Nasi Uduk & Katering)", kategori: "Kuliner", deskripsi_produk: "Aneka katering rumahan, nasi uduk lezat khas RW 01, snack box, dan jajanan pasar segar setiap hari.", asal_rt: "RT 02", rt_pemilik: "RT 02", nama_pemilik: "Ibu Ani", no_whatsapp: "081299887701", gambar: "asset/umkm 1.jpg", status: "APPROVED" },
          { id_umkm: "UMKM-02", nama_usaha: "Waroeng Kopi & Minuman Kekinian", kategori: "Kuliner", deskripsi_produk: "Aneka es kopi susu gula aren, boba, thai tea, serta cemilan hangat untuk santai sore di lingkungan RW 01.", asal_rt: "RT 04", rt_pemilik: "RT 04", nama_pemilik: "Mas Budi", no_whatsapp: "081299887702", gambar: "asset/umkm 2.jpg", status: "APPROVED" },
          { id_umkm: "UMKM-03", nama_usaha: "Toko Sembako & Sayur Segar Berkah", kategori: "Retail", deskripsi_produk: "Menyediakan beras kualitas super, minyak goreng, telur, sayur-mayur segar harian dan bumbu dapur lengkap.", asal_rt: "RT 01", rt_pemilik: "RT 01", nama_pemilik: "Bpk. Haji Slamet", no_whatsapp: "081299887703", gambar: "asset/umkm 3.jpg", status: "APPROVED" }
        ]
      };
    }

    if (action === 'adminLogin') {
      if (payload.username === 'admin' && payload.password === 'admin123') {
        return {
          success: true,
          message: "Login Berhasil (Mode Pengurus RW 01)",
          user: { username: "admin", role: "ADMIN_RW", nama_pengurus: "Pengurus RW 01" }
        };
      } else {
        return { success: false, message: "Username atau password salah!" };
      }
    }

    return {
      success: false,
      message: "Gagal terhubung ke server Google Sheets"
    };
  }

  static readFileAsBase64(fileInput) {
    return new Promise((resolve) => {
      if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
        resolve({ file_data: null, file_name: null });
        return;
      }
      const file = fileInput.files[0];
      const reader = new FileReader();
      reader.onload = function(e) {
        resolve({
          file_data: e.target.result,
          file_name: file.name
        });
      };
      reader.onerror = function() {
        resolve({ file_data: null, file_name: null });
      };
      reader.readAsDataURL(file);
    });
  }
}

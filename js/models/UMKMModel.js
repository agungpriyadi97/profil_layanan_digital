/**
 * ==============================================================================
 * MODEL: UMKM DATA MODEL (js/models/UMKMModel.js)
 * Manages UMKM state, local featured asset items, merging, and filtering
 * ==============================================================================
 */

class UMKMModel {
  static featuredItems = [
    { id_umkm: "UMKM-01", nama_usaha: "Dapur Mamah Ani (Nasi Uduk & Katering)", kategori: "Kuliner", deskripsi_produk: "Aneka katering rumahan, nasi uduk lezat khas RW 01, snack box, dan jajanan pasar segar setiap hari.", asal_rt: "RT 02", rt_pemilik: "RT 02", nama_pemilik: "Ibu Ani", no_whatsapp: "081299887701", gambar: "asset/umkm 1.jpg", status_verifikasi: "APPROVED" },
    { id_umkm: "UMKM-02", nama_usaha: "Waroeng Kopi & Minuman Kekinian", kategori: "Kuliner", deskripsi_produk: "Aneka es kopi susu gula aren, boba, thai tea, serta cemilan hangat untuk santai sore di lingkungan RW 01.", asal_rt: "RT 04", rt_pemilik: "RT 04", nama_pemilik: "Mas Budi", no_whatsapp: "081299887702", gambar: "asset/umkm 2.jpg", status_verifikasi: "APPROVED" },
    { id_umkm: "UMKM-03", nama_usaha: "Toko Sembako & Sayur Segar Berkah", kategori: "Retail", deskripsi_produk: "Menyediakan beras kualitas super, minyak goreng, telur, sayur-mayur segar harian dan bumbu dapur lengkap.", asal_rt: "RT 01", rt_pemilik: "RT 01", nama_pemilik: "Bpk. Haji Slamet", no_whatsapp: "081299887703", gambar: "asset/umkm 3.jpg", status_verifikasi: "APPROVED" }
  ];

  static cache = [];
  static activeRtFilter = '';

  static async fetchAll() {
    const res = await ApiModel.call('getUMKMList');
    let sheetItems = (res && res.success && Array.isArray(res.data)) ? res.data : [];

    const mergedList = [...UMKMModel.featuredItems];
    const sampleImages = ["asset/umkm 1.jpg", "asset/umkm 2.jpg", "asset/umkm 3.jpg"];

    sheetItems.forEach((item, idx) => {
      const titleLower = String(item.nama_usaha || '').toLowerCase().trim();
      const exists = mergedList.some(f => f.nama_usaha.toLowerCase().trim() === titleLower);
      if (!exists && titleLower.length > 0) {
        if (!item.gambar && !item.foto_produk && !item.link_foto) {
          item.gambar = sampleImages[idx % sampleImages.length];
        }
        mergedList.push(item);
      }
    });

    UMKMModel.cache = mergedList;
    return UMKMModel.cache;
  }

  static getFilteredItems() {
    if (!UMKMModel.activeRtFilter) return UMKMModel.cache;
    return UMKMModel.cache.filter(item => 
      String(item.asal_rt || item.rt_pemilik || '').trim() === UMKMModel.activeRtFilter
    );
  }

  static async register(payload) {
    const res = await ApiModel.call('submitUMKM', payload);
    if (res && res.success) {
      const newUmkm = {
        id_umkm: (res.data && res.data.id_usaha) ? res.data.id_usaha : "UMKM-" + Date.now(),
        nama_usaha: payload.nama_usaha,
        kategori: payload.kategori,
        asal_rt: payload.asal_rt,
        rt_pemilik: payload.asal_rt,
        nama_pemilik: payload.nama_pemilik,
        no_whatsapp: payload.no_whatsapp,
        deskripsi_produk: payload.deskripsi_produk,
        gambar: (res.data && res.data.link_foto && res.data.link_foto !== '-') ? res.data.link_foto : (payload.file_data || "asset/umkm 1.jpg"),
        status_verifikasi: "APPROVED"
      };
      UMKMModel.cache.unshift(newUmkm);
    }
    return res;
  }
}

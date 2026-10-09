/**
 * ==============================================================================
 * CONTROLLER: UMKM CONTROLLER (js/controllers/UMKMController.js)
 * Coordinates UMKM Data Flow between UMKMModel and UMKMView
 * ==============================================================================
 */

class UMKMController {
  static async init() {
    await UMKMController.loadCatalog();
  }

  static async loadCatalog() {
    const items = await UMKMModel.fetchAll();
    const statElem = document.getElementById('stat-umkm-count');
    if (statElem) statElem.innerText = `${items.length} Usaha`;
    UMKMController.render();
  }

  static filterByRt(rt) {
    UMKMModel.activeRtFilter = rt;
    document.querySelectorAll('.rt-filter-btn').forEach(btn => {
      btn.classList.remove('bg-primary', 'text-white');
      btn.classList.add('bg-surface-container', 'text-on-surface-variant');
    });

    if (window.event && window.event.target) {
      window.event.target.classList.remove('bg-surface-container', 'text-on-surface-variant');
      window.event.target.classList.add('bg-primary', 'text-white');
    }

    UMKMController.render();
  }

  static render() {
    const items = UMKMModel.getFilteredItems();
    UMKMView.renderCards('umkm-container', items);
  }

  static async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-umkm');
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-sm">sync</span> Mengunggah Foto & Mengirim...`;

    const fileInput = document.getElementById('umkm-file');
    const { file_data, file_name } = await ApiModel.readFileAsBase64(fileInput);

    const payload = {
      nama_usaha: document.getElementById('umkm-nama').value,
      kategori: document.getElementById('umkm-kategori').value,
      asal_rt: document.getElementById('umkm-rt').value,
      nama_pemilik: document.getElementById('umkm-pemilik').value,
      no_whatsapp: document.getElementById('umkm-wa').value,
      deskripsi_produk: document.getElementById('umkm-deskripsi').value,
      file_data: file_data,
      file_name: file_name
    };

    const res = await UMKMModel.register(payload);
    btn.disabled = false;
    btn.innerHTML = `Kirim Pendaftaran`;

    if (res && res.success) {
      showToast(res.message || 'Pendaftaran UMKM berhasil dikirim!', 'success');
      UMKMController.render();
      const form = document.getElementById('modal-umkm').querySelector('form');
      if (form) form.reset();
      AppController.closeModalUMKM();
    } else {
      showToast(res ? res.message : 'Gagal mengirim pendaftaran', 'error');
    }
  }
}

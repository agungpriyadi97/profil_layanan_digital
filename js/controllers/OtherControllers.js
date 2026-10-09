/**
 * ==============================================================================
 * CONTROLLERS: SURAT, LAPOR, ADMIN & APP CONTROLLERS (js/controllers/OtherControllers.js)
 * ==============================================================================
 */

class SuratController {
  static async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-surat');
    const nik = document.getElementById('surat-nik').value.trim();

    if (nik.length !== 16 || isNaN(nik)) {
      showToast('NIK harus terdiri dari 16 digit angka!', 'warning');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-lg">sync</span> Mengunggah Dokumen & Mengirim...`;

    const fileInput = document.getElementById('surat-file');
    const { file_data, file_name } = await ApiModel.readFileAsBase64(fileInput);

    const payload = {
      nama_pemohon: document.getElementById('surat-nama').value,
      nik: nik,
      rt_domisili: document.getElementById('surat-rt').value,
      no_wa: document.getElementById('surat-wa').value,
      jenis_surat: document.getElementById('surat-jenis').value,
      keperluan: document.getElementById('surat-keperluan').value,
      file_data: file_data,
      file_name: file_name
    };

    const res = await SuratModel.submit(payload);
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined text-lg">send</span> Kirim Permohonan Surat`;

    if (res.success) {
      showToast(res.message, 'success');
      document.getElementById('form-surat').reset();
      const ticketId = res.data ? res.data.id_pengajuan : 'SRT-PENDING';
      document.getElementById('track-nik').value = ticketId;
      SuratController.handleTrack();

      // Open Automatic WhatsApp Confirmation Modal
      AppController.openWaSuccessModal({
        ticket: ticketId,
        name: payload.nama_pemohon,
        rt: payload.rt_domisili,
        type: payload.jenis_surat,
        status: 'PENDING'
      });
    } else {
      showToast(res.message, 'error');
    }
  }

  static async handleTrack() {
    const query = document.getElementById('track-nik').value.trim();
    const container = document.getElementById('track-result');
    if (!query) {
      showToast('Masukkan NIK atau Nomor Tiket untuk melacak status', 'warning');
      return;
    }

    container.classList.remove('hidden');
    container.innerHTML = `<div class="text-xs text-on-surface-variant flex items-center gap-1.5"><span class="material-symbols-outlined animate-spin text-sm">sync</span> Mencari data...</div>`;

    const res = await SuratModel.track(query);
    if (res.success && res.data && res.data.length > 0) {
      SuratView.renderTracking('track-result', res.data);
    } else {
      container.innerHTML = `<p class="text-xs text-rose-600 font-medium">Data pengajuan surat tidak ditemukan.</p>`;
    }
  }
}

class LaporController {
  static async handleSubmit(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-submit-lapor');
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-lg">sync</span> Mengunggah Foto & Mengirim...`;

    const isAnon = document.getElementById('lapor-anonim').checked;
    const rawNama = document.getElementById('lapor-nama').value;
    const namaPelapor = isAnon ? 'Warga (Anonim)' : (rawNama || 'Warga');

    const fileInput = document.getElementById('lapor-file');
    const { file_data, file_name } = await ApiModel.readFileAsBase64(fileInput);

    const payload = {
      nama_pelapor: namaPelapor,
      is_anonim: isAnon,
      rt_pelapor: document.getElementById('lapor-rt').value,
      kategori: document.getElementById('lapor-kategori').value,
      lokasi_kejadian: document.getElementById('lapor-lokasi').value,
      isi_laporan: document.getElementById('lapor-isi').value,
      file_data: file_data,
      file_name: file_name
    };

    const res = await LaporModel.submit(payload);
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined text-lg">campaign</span> Kirim Laporan Warga`;

    if (res.success) {
      showToast(res.message, 'success');
      document.getElementById('form-lapor').reset();
      LaporController.loadPublicList();

      const ticketId = res.data ? res.data.id_laporan : 'LPR-PENDING';

      // Open Automatic WhatsApp Confirmation Modal
      AppController.openWaSuccessModal({
        ticket: ticketId,
        name: isAnon ? 'Warga (Anonim)' : payload.nama_pelapor,
        rt: payload.rt_pelapor,
        type: `Laporan ${payload.kategori}`,
        status: 'PENDING'
      });
    } else {
      showToast(res.message, 'error');
    }
  }

  static async loadPublicList() {
    const res = await LaporModel.fetchPublic();
    if (res.success && res.data) {
      LaporView.renderPublic('laporan-public-container', res.data);
    }
  }
}

class AdminController {
  static loggedInUser = null;

  static async handleLogin(e) {
    e.preventDefault();
    const btn = document.getElementById('btn-login-admin');
    btn.disabled = true;
    btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-lg">sync</span> Memverifikasi...`;

    const payload = {
      username: document.getElementById('admin-user').value,
      password: document.getElementById('admin-pass').value
    };

    const res = await ApiModel.call('loginAdmin', payload);
    btn.disabled = false;
    btn.innerHTML = `<span class="material-symbols-outlined text-lg">login</span> Masuk Dashboard Admin`;

    if (res.success && res.user) {
      AdminController.loggedInUser = res.user;
      sessionStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_USER, JSON.stringify(res.user));
      showToast(res.message, 'success');
      AdminController.showDashboard();
    } else {
      showToast(res.message || 'Login gagal!', 'error');
    }
  }

  static showDashboard() {
    document.getElementById('admin-login-view').classList.add('hidden');
    document.getElementById('admin-dashboard-view').classList.remove('hidden');
    const welcome = document.getElementById('admin-welcome-name');
    if (welcome) welcome.innerText = `Selamat Datang, ${AdminController.loggedInUser.nama_pengurus || 'Admin'}`;
    AdminController.switchSubTab('surat');
  }

  static handleLogout() {
    AdminController.loggedInUser = null;
    sessionStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_USER);
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-dashboard-view').classList.add('hidden');
    showToast('Berhasil keluar dari panel admin', 'info');
  }

  static switchSubTab(subId) {
    AdminView.updateSubTabHighlight(subId);
    if (subId === 'surat') AdminController.loadSuratTable();
    if (subId === 'lapor') AdminController.loadLaporTable();
    if (subId === 'agenda') AdminController.loadAgendaTable();
    if (subId === 'umkm') AdminController.loadUMKMTable();
  }

  static async loadSuratTable() {
    const tbody = document.getElementById('admin-surat-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-on-surface-variant">Memuat data pengajuan surat...</td></tr>`;

    const res = await SuratModel.fetchAllAdmin();
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(item => {
        const isFinal = (item.status === 'SELESAI' || item.status === 'DITOLAK');
        return `
          <tr class="hover:bg-surface-container/50 transition-colors">
            <td class="p-3 font-mono font-bold text-primary">${item.id_pengajuan}<br><span class="font-sans text-[10px] text-on-surface-variant">${item.timestamp || ''}</span></td>
            <td class="p-3 font-semibold">${item.nama_pemohon}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.rt_domisili}</span></td>
            <td class="p-3 font-mono text-[11px]">${item.nik}<br><a href="https://wa.me/${String(item.no_wa).replace(/[^0-9]/g, '')}" target="_blank" class="text-emerald-700 hover:text-emerald-800 underline font-semibold transition-colors">${item.no_wa}</a></td>
            <td class="p-3 font-semibold">${item.jenis_surat}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.keperluan}</span></td>
            <td class="p-3">
              ${item.link_berkas && item.link_berkas !== '-' ? `
                <a href="${formatGoogleDriveImageUrl(item.link_berkas)}" target="_blank" class="text-primary hover:text-primary-dark hover:underline font-bold text-[11px] flex items-center gap-1 transition-colors">
                  <span class="material-symbols-outlined text-xs">folder_open</span> Lihat
                </a>
              ` : '-'}
            </td>
            <td class="p-3">
              <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-xs ${
                item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                item.status === 'DIPROSES' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                item.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }">${item.status}</span>
            </td>
            <td class="p-3 text-right">
              <div class="flex justify-end items-center gap-1.5">
                <button onclick="AdminController.openPrintSurat('${item.id_pengajuan}')" class="bg-primary hover:bg-primary-container active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs flex items-center gap-1 transition-all duration-200 cursor-pointer">
                  <span class="material-symbols-outlined text-xs">print</span> Cetak
                </button>
                ${isFinal ? `
                  <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs select-none">
                    <span class="material-symbols-outlined text-xs">lock</span> Selesai
                  </span>
                ` : `
                  <button ${item.status === 'DIPROSES' ? 'disabled' : ''} onclick="AdminController.updateSuratStatus('${item.id_pengajuan}', 'DIPROSES')" class="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-blue-600/30 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none">Proses</button>
                  <button onclick="AdminController.updateSuratStatus('${item.id_pengajuan}', 'SELESAI')" class="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-emerald-700/30 transition-all duration-200 cursor-pointer">Selesai</button>
                  <button onclick="AdminController.updateSuratStatus('${item.id_pengajuan}', 'DITOLAK')" class="bg-rose-700 hover:bg-rose-800 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-rose-700/30 transition-all duration-200 cursor-pointer">Tolak</button>
                `}
              </div>
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-on-surface-variant">Belum ada data pengajuan surat.</td></tr>`;
    }
  }

  static async updateSuratStatus(id, status) {
    const resAll = await SuratModel.fetchAllAdmin();
    if (resAll.success && resAll.data) {
      const target = resAll.data.find(x => x.id_pengajuan === id);
      if (target && (target.status === 'SELESAI' || target.status === 'DITOLAK')) {
        showToast(`Pengajuan ${id} sudah berstatus ${target.status} dan terkunci demi keamanan data.`, 'warning');
        return;
      }
    }

    const catatan = prompt(`Tambahkan catatan untuk pemohon (opsional):`, `Status diperbarui menjadi ${status}`);
    const res = await SuratModel.updateStatusAdmin(id, status, catatan || '');
    if (res.success) {
      showToast(res.message, 'success');
      AdminController.loadSuratTable();
    } else {
      showToast(res.message, 'error');
    }
  }

  static async openPrintSurat(id) {
    const res = await SuratModel.fetchAllAdmin();
    if (res.success && res.data) {
      const item = res.data.find(x => x.id_pengajuan === id);
      if (item) {
        PrintView.renderSurat(item);
        const modal = document.getElementById('modal-print-surat');
        if (modal) {
          modal.classList.remove('hidden');
          modal.classList.add('flex');
        }
      } else {
        showToast('Data pengajuan tidak ditemukan', 'error');
      }
    }
  }

  static closePrintModal() {
    const modal = document.getElementById('modal-print-surat');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  static executePrintSurat() {
    window.print();
  }

  static async loadLaporTable() {
    const tbody = document.getElementById('admin-lapor-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant">Memuat...</td></tr>`;

    const res = await LaporModel.fetchPublic();
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(item => {
        const isFinal = (item.status === 'SELESAI');
        return `
          <tr class="hover:bg-surface-container/50 transition-colors">
            <td class="p-3 font-mono font-bold text-primary">${item.id_laporan}</td>
            <td class="p-3 font-semibold">${item.nama_pelapor}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.rt_pelapor}</span></td>
            <td class="p-3 font-semibold">${item.kategori}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.lokasi_kejadian}</span></td>
            <td class="p-3 max-w-xs text-xs">${item.isi_laporan}</td>
            <td class="p-3">
              <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-xs ${
                item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                item.status === 'DITINJAU' ? 'bg-blue-100 text-blue-800 border border-blue-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }">${item.status}</span>
            </td>
            <td class="p-3 text-right">
              ${isFinal ? `
                <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs select-none">
                  <span class="material-symbols-outlined text-xs">lock</span> Selesai
                </span>
              ` : `
                <div class="flex justify-end gap-1.5">
                  <button ${item.status === 'DITINJAU' ? 'disabled' : ''} onclick="AdminController.updateLaporStatus('${item.id_laporan}', 'DITINJAU')" class="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-blue-600/30 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-none">Tinjau</button>
                  <button onclick="AdminController.updateLaporStatus('${item.id_laporan}', 'SELESAI')" class="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-emerald-700/30 transition-all duration-200 cursor-pointer">Selesai</button>
                </div>
              `}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant">Belum ada laporan warga.</td></tr>`;
    }
  }

  static async updateLaporStatus(id, status) {
    const resPublic = await LaporModel.fetchPublic();
    if (resPublic.success && resPublic.data) {
      const target = resPublic.data.find(x => x.id_laporan === id);
      if (target && target.status === 'SELESAI') {
        showToast(`Laporan ${id} sudah berstatus SELESAI dan terkunci demi keamanan data.`, 'warning');
        return;
      }
    }

    const res = await LaporModel.updateStatusAdmin(id, status);
    if (res.success) {
      showToast(res.message, 'success');
      AdminController.loadLaporTable();
      LaporController.loadPublicList();
    } else {
      showToast(res.message, 'error');
    }
  }

  static async loadAgendaTable() {
    const tbody = document.getElementById('admin-agenda-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-on-surface-variant">Memuat...</td></tr>`;

    const res = await ApiModel.call('getAgendaList', { include_archived: true });
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(item => `
        <tr class="hover:bg-surface-container/50 transition-colors">
          <td class="p-3 font-mono font-bold text-primary">${item.id_agenda}<br><span class="font-sans text-[10px] text-on-surface-variant">${item.tanggal_kegiatan}</span></td>
          <td class="p-3 font-semibold">${item.judul}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.deskripsi}</span></td>
          <td class="p-3 font-semibold">${item.kategori}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.waktu_lokasi}</span></td>
          <td class="p-3 text-right">
            <button onclick="AdminController.handleDeleteAgenda('${item.id_agenda}')" class="bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs hover:shadow-rose-500/20 active:scale-95 transition-all duration-200 cursor-pointer">Hapus Agenda</button>
          </td>
        </tr>
      `).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-on-surface-variant">Belum ada agenda.</td></tr>`;
    }
  }

  static async handleAddAgenda(e) {
    e.preventDefault();
    const payload = {
      judul: document.getElementById('agenda-judul').value,
      kategori: document.getElementById('agenda-kategori').value,
      tanggal_kegiatan: document.getElementById('agenda-tanggal').value,
      waktu_lokasi: document.getElementById('agenda-waktu').value,
      deskripsi: document.getElementById('agenda-deskripsi').value
    };

    const res = await AgendaModel.add(payload);
    if (res.success) {
      showToast(res.message, 'success');
      AdminController.loadAgendaTable();
      AppController.loadAgendaBeranda();
    } else {
      showToast(res.message, 'error');
    }
  }

  static async handleDeleteAgenda(id) {
    if (!confirm(`Hapus agenda ${id}?`)) return;
    const res = await AgendaModel.delete(id);
    if (res.success) {
      showToast(res.message, 'success');
      AdminController.loadAgendaTable();
      AppController.loadAgendaBeranda();
    } else {
      showToast(res.message, 'error');
    }
  }

  static async loadUMKMTable() {
    const tbody = document.getElementById('admin-umkm-table-body');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant">Memuat...</td></tr>`;

    const res = await ApiModel.call('getUMKMList', { include_all: true });
    if (res.success && res.data && res.data.length > 0) {
      tbody.innerHTML = res.data.map(item => {
        const isFinal = (item.status_verifikasi === 'APPROVED' || item.status_verifikasi === 'REJECTED');
        return `
          <tr class="hover:bg-surface-container/50 transition-colors">
            <td class="p-3 font-mono font-bold text-primary">${item.id_usaha}</td>
            <td class="p-3 font-semibold">${item.nama_usaha}<br><span class="font-normal text-on-surface-variant text-[11px]">${item.nama_pemilik} (${item.kategori})</span></td>
            <td class="p-3 font-semibold">${item.asal_rt || item.rt_pemilik || 'RW 01'}<br><a href="https://wa.me/${String(item.no_whatsapp).replace(/[^0-9]/g, '')}" target="_blank" class="text-emerald-700 hover:text-emerald-800 underline font-semibold transition-colors">${item.no_whatsapp}</a></td>
            <td class="p-3 max-w-xs text-xs">${item.deskripsi_produk}</td>
            <td class="p-3">
              <span class="px-2.5 py-0.5 rounded-full font-bold text-[10px] shadow-xs ${
                item.status_verifikasi === 'APPROVED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                item.status_verifikasi === 'REJECTED' ? 'bg-rose-100 text-rose-800 border border-rose-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
              }">${item.status_verifikasi}</span>
            </td>
            <td class="p-3 text-right">
              ${isFinal ? `
                <span class="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200/80 px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-xs select-none">
                  <span class="material-symbols-outlined text-xs">lock</span> Terkunci (${item.status_verifikasi})
                </span>
              ` : `
                <div class="flex justify-end gap-1.5">
                  <button onclick="AdminController.updateUMKMStatus('${item.id_usaha}', 'APPROVED')" class="bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-emerald-700/30 transition-all duration-200 cursor-pointer">Approve</button>
                  <button onclick="AdminController.updateUMKMStatus('${item.id_usaha}', 'REJECTED')" class="bg-rose-700 hover:bg-rose-800 active:scale-95 text-white px-2.5 py-1 rounded-lg text-[10px] font-bold shadow-sm hover:shadow-rose-700/30 transition-all duration-200 cursor-pointer">Reject</button>
                </div>
              `}
            </td>
          </tr>
        `;
      }).join('');
    } else {
      tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-on-surface-variant">Belum ada data pendaftaran UMKM.</td></tr>`;
    }
  }

  static async updateUMKMStatus(id, status) {
    const resList = await ApiModel.call('getUMKMList', { include_all: true });
    if (resList.success && resList.data) {
      const target = resList.data.find(x => x.id_usaha === id);
      if (target && (target.status_verifikasi === 'APPROVED' || target.status_verifikasi === 'REJECTED')) {
        showToast(`UMKM ${id} sudah berstatus ${target.status_verifikasi} dan terkunci demi keamanan data.`, 'warning');
        return;
      }
    }

    const res = await ApiModel.call('updateUMKMStatus', { id_usaha: id, status_verifikasi: status });
    if (res.success) {
      showToast(res.message, 'success');
      AdminController.loadUMKMTable();
      UMKMController.loadCatalog();
    } else {
      showToast(res.message, 'error');
    }
  }
}

class AppController {
  static currentTab = 'beranda';

  static init() {
    AppController.switchTab('beranda');
    AppController.loadAgendaBeranda();
    AppController.loadKasRW();
    AppController.loadDirektoriRT();
    UMKMController.init();

    const savedUser = sessionStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_USER);
    if (savedUser) {
      try {
        AdminController.loggedInUser = JSON.parse(savedUser);
        AdminController.showDashboard();
      } catch(e) {}
    }
  }

  static switchTab(tabId) {
    AppController.currentTab = tabId;
    document.querySelectorAll('.tab-content').forEach(el => {
      el.classList.add('hidden');
      el.classList.remove('flex');
    });

    const target = document.getElementById('tab-' + tabId);
    if (target) {
      target.classList.remove('hidden');
      target.classList.add('flex');
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('bg-primary-container', 'text-white');
      btn.classList.add('text-on-surface-variant', 'hover:bg-surface-container');
    });

    const activeNav = document.getElementById('nav-' + tabId);
    if (activeNav) {
      activeNav.classList.remove('text-on-surface-variant', 'hover:bg-surface-container');
      activeNav.classList.add('bg-primary-container', 'text-white');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });

    if (tabId === 'beranda') AppController.loadKasRW();
    if (tabId === 'direktori') AppController.loadDirektoriRT();
    if (tabId === 'lapor') LaporController.loadPublicList();
    if (tabId === 'umkm') UMKMController.loadCatalog();
    if (tabId === 'admin' && AdminController.loggedInUser) AdminController.showDashboard();
  }

  static async loadAgendaBeranda() {
    const res = await AgendaModel.fetchAll();
    if (res.success && res.data) {
      AgendaView.render('agenda-container', res.data);
    }
  }

  static async loadKasRW() {
    const res = await KasModel.fetch();
    if (res.success && res.data) {
      KasView.render('kas-rw-container', res.data);
    }
  }

  static async loadDirektoriRT() {
    const res = await RTModel.fetchAll();
    if (res.success && res.data) {
      RTView.render('rt-directory-container', res.data);
    }
  }

  static toggleMobileMenu() {
    const menu = document.getElementById('mobile-menu');
    if (menu) menu.classList.toggle('hidden');
  }

  static openModalUMKM() {
    const modal = document.getElementById('modal-umkm');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  }
  static closeModalUMKM() {
    const modal = document.getElementById('modal-umkm');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  }

  static openEmergencyModal() {
    const modal = document.getElementById('modal-emergency');
    if (modal) { modal.classList.remove('hidden'); modal.classList.add('flex'); }
  }
  static closeEmergencyModal() {
    const modal = document.getElementById('modal-emergency');
    if (modal) { modal.classList.add('hidden'); modal.classList.remove('flex'); }
  }

  static openWaSuccessModal({ ticket, name, rt, type, status }) {
    const modal = document.getElementById('modal-wa-success');
    if (!modal) return;

    const elemTicket = document.getElementById('wa-success-ticket');
    const elemName = document.getElementById('wa-success-name');
    const elemRt = document.getElementById('wa-success-rt');
    const elemType = document.getElementById('wa-success-type');

    if (elemTicket) elemTicket.innerText = ticket;
    if (elemName) elemName.innerText = name;
    if (elemRt) elemRt.innerText = rt;
    if (elemType) elemType.innerText = type;

    const waBtn = document.getElementById('btn-wa-confirm-modal');
    if (waBtn) {
      const url = buildWhatsAppConfirmUrl({ ticket, name, rt, type, status: status || 'PENDING' });
      waBtn.href = url;
    }

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }

  static closeWaSuccessModal() {
    const modal = document.getElementById('modal-wa-success');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  }

  static toggleAnonimInput(checkbox) {
    const namaInput = document.getElementById('lapor-nama');
    if (!namaInput) return;
    if (checkbox.checked) {
      namaInput.value = '';
      namaInput.disabled = true;
      namaInput.placeholder = 'Pelapor Anonim';
    } else {
      namaInput.disabled = false;
      namaInput.placeholder = 'Nama lengkap Anda...';
    }
  }
}

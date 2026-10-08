/**
 * ==============================================================================
 * VIEWS: AGENDA, RT, SURAT, LAPOR & ADMIN VIEWS (js/views/OtherViews.js)
 * ==============================================================================
 */

class AgendaView {
  static render(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="col-span-full p-6 text-center text-xs text-on-surface-variant">Belum ada agenda atau pengumuman aktif.</div>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden">
        <span class="bg-primary-container/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full w-fit uppercase tracking-wider">${item.kategori || 'Agenda'}</span>
        <div>
          <h4 class="font-bold text-on-surface text-base">${item.judul}</h4>
          <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">${item.deskripsi}</p>
        </div>
        <div class="mt-auto pt-3 border-t border-outline-variant/40 flex flex-col gap-1 text-xs text-on-surface-variant">
          <span class="flex items-center gap-1 font-semibold text-primary">
            <span class="material-symbols-outlined text-sm" style="font-family:'Material Symbols Outlined'!important;">calendar_month</span> ${item.tanggal_kegiatan}
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined text-sm" style="font-family:'Material Symbols Outlined'!important;">schedule</span> ${item.waktu_lokasi}
          </span>
        </div>
      </div>
    `).join('');
  }
}

class RTView {
  static render(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="col-span-full p-6 text-center text-xs text-on-surface-variant">Data direktori RT belum tersedia.</div>`;
      return;
    }

    container.innerHTML = items.map(rt => {
      let waNum = String(rt.no_whatsapp || '').replace(/[^0-9]/g, '');
      if (waNum.startsWith('0')) waNum = '62' + waNum.slice(1);
      const waUrl = waNum ? `https://api.whatsapp.com/send?phone=${waNum}` : '#';

      return `
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm flex flex-col gap-3 hover:border-primary transition-all">
          <div class="flex justify-between items-center">
            <span class="text-lg font-extrabold text-primary">${rt.no_rt}</span>
            <span class="text-[10px] bg-surface-container px-2 py-0.5 rounded-full font-bold text-on-surface-variant">RW 01</span>
          </div>
          <div>
            <p class="text-xs text-on-surface-variant">Ketua RT:</p>
            <h4 class="font-bold text-on-surface text-sm">${rt.nama_ketua_rt}</h4>
          </div>
          <div class="text-xs text-on-surface-variant flex flex-col gap-1 border-t border-outline-variant/40 pt-2">
            <p><strong>Wilayah:</strong> ${rt.wilayah_blok || '-'}</p>
            <p><strong>Pos Ronda:</strong> ${rt.lokasi_pos_rt || '-'}</p>
          </div>
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" style="background-color: #006948 !important; color: #ffffff !important; font-weight: 700 !important; font-size: 13px !important; padding: 10px 16px !important; border-radius: 12px !important; display: flex !important; align-items: center !important; justify-content: center !important; gap: 6px !important; text-decoration: none !important; margin-top: auto !important; width: 100% !important; box-shadow: 0 2px 4px rgba(0,0,0,0.08) !important;">
            <span class="material-symbols-outlined" style="font-family: 'Material Symbols Outlined' !important; font-size: 18px !important; vertical-align: middle !important;">chat</span>
            Hubungi Ketua RT
          </a>
        </div>
      `;
    }).join('');
  }
}

class SuratView {
  static renderTracking(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<p class="text-xs text-rose-600 font-medium">Data pengajuan surat tidak ditemukan.</p>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="bg-surface p-3 rounded-xl border border-outline-variant/60 text-xs flex flex-col gap-1.5">
        <div class="flex justify-between items-center">
          <span class="font-mono font-bold text-primary">${item.id_pengajuan}</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
            item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' :
            item.status === 'DIPROSES' ? 'bg-blue-100 text-blue-800' :
            item.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }">${item.status}</span>
        </div>
        <p class="font-semibold text-on-surface">${item.jenis_surat}</p>
        <p class="text-on-surface-variant text-[11px]">Pemohon: ${item.nama_pemohon} (${item.rt_domisili})</p>
        ${item.link_berkas && item.link_berkas !== '-' ? `
          <a href="${formatGoogleDriveImageUrl(item.link_berkas)}" target="_blank" class="text-primary hover:underline font-bold text-[10px] flex items-center gap-1 w-fit bg-primary-container/10 px-2 py-1 rounded-md">
            <span class="material-symbols-outlined text-xs" style="font-family:'Material Symbols Outlined'!important;">folder_open</span> Lihat Dokumen Terunggah
          </a>
        ` : ''}
        ${item.catatan_admin ? `<p class="bg-surface-container-high p-2 rounded text-[10px] text-on-surface-variant italic">Catatan Admin: ${item.catatan_admin}</p>` : ''}
      </div>
    `).join('');
  }
}

class LaporView {
  static renderPublic(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<p class="text-xs text-center text-on-surface-variant p-4">Belum ada laporan warga.</p>`;
      return;
    }

    container.innerHTML = items.map(item => `
      <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-xl p-4 shadow-sm flex flex-col gap-2 text-xs">
        <div class="flex justify-between items-center">
          <span class="font-bold text-primary">${item.kategori} (${item.rt_pelapor})</span>
          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold ${
            item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' :
            item.status === 'DITINJAU' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
          }">${item.status}</span>
        </div>
        <p class="text-on-surface leading-relaxed">${item.isi_laporan}</p>
        ${item.link_foto && item.link_foto !== '-' ? `
          <a href="${formatGoogleDriveImageUrl(item.link_foto)}" target="_blank" class="text-tertiary hover:underline font-bold text-[10px] flex items-center gap-1 w-fit bg-tertiary-container/10 px-2 py-1 rounded-md">
            <span class="material-symbols-outlined text-xs" style="font-family:'Material Symbols Outlined'!important;">image</span> Lihat Foto Bukti
          </a>
        ` : ''}
        <div class="flex justify-between items-center text-[10px] text-on-surface-variant border-t border-outline-variant/30 pt-1.5 mt-1">
          <span>Pelapor: ${item.nama_pelapor}</span>
          <span>Lokasi: ${item.lokasi_kejadian}</span>
        </div>
      </div>
    `).join('');
  }
}

class AdminView {
  static updateSubTabHighlight(subId) {
    document.querySelectorAll('.admin-subcontent').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-subtab').forEach(btn => {
      btn.classList.remove('bg-primary', 'text-white', 'shadow-sm');
      btn.classList.add('bg-surface-container', 'text-on-surface');
    });

    const targetContent = document.getElementById('admin-subcontent-' + subId);
    if (targetContent) targetContent.classList.remove('hidden');

    const activeBtn = document.getElementById('admin-tab-' + subId);
    if (activeBtn) {
      activeBtn.classList.remove('bg-surface-container', 'text-on-surface');
      activeBtn.classList.add('bg-primary', 'text-white', 'shadow-sm');
    }
  }
}

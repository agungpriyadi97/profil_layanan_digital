/**
 * ==============================================================================
 * VIEWS: AGENDA, RT, SURAT, LAPOR, KAS, PRINT & ADMIN VIEWS (js/views/OtherViews.js)
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
      <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm flex flex-col gap-3 relative overflow-hidden card-hover-effect">
        <span class="bg-primary-container/10 text-primary text-[10px] font-bold px-2.5 py-1 rounded-full w-fit uppercase tracking-wider">${item.kategori || 'Agenda'}</span>
        <div>
          <h4 class="font-bold text-on-surface text-base">${item.judul}</h4>
          <p class="text-xs text-on-surface-variant mt-1 leading-relaxed">${item.deskripsi}</p>
        </div>
        <div class="mt-auto pt-3 border-t border-outline-variant/40 flex flex-col gap-1 text-xs text-on-surface-variant">
          <span class="flex items-center gap-1 font-semibold text-primary">
            <span class="material-symbols-outlined icon-sm">calendar_month</span> ${item.tanggal_kegiatan}
          </span>
          <span class="flex items-center gap-1">
            <span class="material-symbols-outlined icon-sm">schedule</span> ${item.waktu_lokasi}
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
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm flex flex-col gap-3 card-hover-effect">
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
          <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-style">
            <span class="material-symbols-outlined icon-sm">chat</span>
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
      <div class="bg-surface p-4 rounded-xl border border-outline-variant/60 text-xs flex flex-col gap-2">
        <div class="flex justify-between items-center">
          <span class="font-mono font-bold text-primary">${item.id_pengajuan}</span>
          <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
            item.status === 'SELESAI' ? 'bg-emerald-100 text-emerald-800' :
            item.status === 'DIPROSES' ? 'bg-blue-100 text-blue-800' :
            item.status === 'DITOLAK' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
          }">${item.status}</span>
        </div>
        <p class="font-semibold text-on-surface text-sm">${item.jenis_surat}</p>
        <p class="text-on-surface-variant text-[11px] leading-relaxed">
          Pemohon: <strong>${item.nama_pemohon}</strong> (${item.rt_domisili})<br/>
          NIK: <span class="font-mono bg-surface-container px-1.5 py-0.5 rounded">${maskNik(item.nik)}</span> | 
          WA: <span class="font-mono bg-surface-container px-1.5 py-0.5 rounded">${maskPhone(item.no_wa)}</span>
        </p>
        ${item.link_berkas && item.link_berkas !== '-' ? `
          <a href="${formatGoogleDriveImageUrl(item.link_berkas)}" target="_blank" class="text-primary hover:underline font-bold text-[10px] flex items-center gap-1 w-fit bg-primary-container/10 px-2 py-1 rounded-md">
            <span class="material-symbols-outlined icon-xs">folder_open</span> Lihat Dokumen Terunggah
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

    container.innerHTML = items.map(item => {
      const isAnon = item.is_anonim || item.nama_pelapor === 'Anonim' || item.nama_pelapor === 'Warga (Anonim)';
      const displayName = isAnon ? 'Warga (Anonim)' : item.nama_pelapor;

      return `
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
              <span class="material-symbols-outlined icon-xs">image</span> Lihat Foto Bukti
            </a>
          ` : ''}
          <div class="flex justify-between items-center text-[10px] text-on-surface-variant border-t border-outline-variant/30 pt-1.5 mt-1">
            <span class="font-semibold text-primary">Pelapor: ${displayName}</span>
            <span>Lokasi: ${item.lokasi_kejadian}</span>
          </div>
        </div>
      `;
    }).join('');
  }
}

class KasView {
  static render(containerId, data) {
    const container = document.getElementById(containerId);
    if (!container || !data) return;

    container.innerHTML = `
      <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl p-5 shadow-sm flex flex-col gap-4">
        <div class="flex justify-between items-center border-b border-outline-variant/40 pb-3">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-2xl">account_balance_wallet</span>
            <div>
              <h3 class="font-bold text-on-surface text-sm sm:text-base">Transparansi Kas RW 01</h3>
              <p class="text-[10px] sm:text-xs text-on-surface-variant">Laporan Keuangan Lingkungan Warga Transparan</p>
            </div>
          </div>
          <span class="text-[10px] bg-primary-container/10 text-primary px-2.5 py-1 rounded-full font-bold">Periode: ${data.update_terakhir || 'Terbaru'}</span>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 flex flex-col justify-between">
            <p class="text-xs text-on-surface-variant font-medium">Saldo Kas Utama RW</p>
            <p class="text-lg sm:text-xl font-extrabold text-primary mt-1">${formatRupiah(data.saldo_kas)}</p>
          </div>
          <div class="bg-emerald-50/80 p-4 rounded-xl border border-emerald-200/60 flex flex-col justify-between">
            <p class="text-xs text-emerald-800 font-medium">Pemasukan Bulan Ini</p>
            <p class="text-base sm:text-lg font-bold text-emerald-700 mt-1">+ ${formatRupiah(data.pemasukan_bulan_ini)}</p>
          </div>
          <div class="bg-rose-50/80 p-4 rounded-xl border border-rose-200/60 flex flex-col justify-between">
            <p class="text-xs text-rose-800 font-medium">Pengeluaran Bulan Ini</p>
            <p class="text-base sm:text-lg font-bold text-rose-700 mt-1">- ${formatRupiah(data.pengeluaran_bulan_ini)}</p>
          </div>
        </div>
      </div>
    `;
  }
}

class PrintView {
  static renderSurat(item) {
    const container = document.getElementById('printable-surat');
    if (!container || !item) return;

    const qrData = encodeURIComponent(`VERIFIKASI-RW01-ID:${item.id_pengajuan}-NIK:${item.nik}`);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=130x130&data=${qrData}`;
    const todayStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    container.innerHTML = `
      <div class="print-page bg-white p-8 max-w-2xl mx-auto text-black font-sans leading-normal border border-gray-300 rounded-xl shadow-lg">
        <!-- KOP SURAT RESMI -->
        <div class="flex items-center gap-4 border-b-4 border-double border-black pb-3 mb-4">
          <img src="https://lh3.googleusercontent.com/d/14JAFpvrXk_uCUmmjmVbqhGciZdO521gF" alt="Logo RW 01" class="w-20 h-20 object-contain shrink-0"/>
          <div class="text-center flex-1">
            <h3 class="font-bold text-xs tracking-wider uppercase">Pemerintah Kabupaten Tangerang</h3>
            <h3 class="font-bold text-xs tracking-wider uppercase">Kecamatan Kelapa Dua</h3>
            <h2 class="font-extrabold text-lg tracking-wide uppercase text-emerald-950 mt-0.5">Rukun Warga (RW) 01 Bencongan Indah</h2>
            <p class="text-[10px] text-gray-700 italic">Sekretariat: Balai Warga RW 01 Jl. Taman Bencongan, Kelapa Dua, Tangerang 15810</p>
          </div>
        </div>

        <!-- JUDUL SURAT -->
        <div class="text-center my-4">
          <h2 class="font-bold text-sm underline uppercase tracking-wide">SURAT PENGANTAR / REKOMENDASI</h2>
          <p class="text-xs font-mono mt-0.5">Nomor: ${item.id_pengajuan}/RW01/SP/${new Date().getFullYear()}</p>
        </div>

        <!-- ISI SURAT -->
        <p class="text-xs mb-3 leading-relaxed">Yang bertanda tangan di bawah ini Pengurus RW 01 Bencongan Indah, Kecamatan Kelapa Dua, Kabupaten Tangerang, menerangkan bahwa:</p>

        <table class="w-full text-xs my-3 border-collapse leading-relaxed">
          <tr><td class="py-1 w-36 font-semibold">Nama Lengkap</td><td>: <strong>${item.nama_pemohon}</strong></td></tr>
          <tr><td class="py-1 font-semibold">NIK</td><td>: <span class="font-mono">${item.nik}</span></td></tr>
          <tr><td class="py-1 font-semibold">RT / Domisili</td><td>: ${item.rt_domisili} / RW 01 Bencongan Indah</td></tr>
          <tr><td class="py-1 font-semibold">No. WhatsApp</td><td>: ${item.no_wa}</td></tr>
          <tr><td class="py-1 font-semibold">Perihal Surat</td><td>: <strong>${item.jenis_surat}</strong></td></tr>
          <tr><td class="py-1 font-semibold">Keperluan</td><td>: ${item.keperluan || '-'}</td></tr>
        </table>

        <p class="text-xs my-3 leading-relaxed">
          Orang tersebut di atas adalah benar warga yang berdomisili di lingkungan RW 01 Bencongan Indah. Surat Pengantar ini diberikan kepada yang bersangkutan untuk dipergunakan sebagaimana mestinya.
        </p>

        <!-- QR CODE VERIFIKASI & TANDA TANGAN -->
        <div class="mt-8 pt-4 flex justify-between items-end text-xs">
          <div class="flex flex-col items-center text-center">
            <img src="${qrUrl}" alt="QR Verifikasi" class="w-24 h-24 border p-1 bg-white shadow-xs"/>
            <p class="text-[9px] font-mono mt-1 text-gray-600">Dokumen Sah Terverifikasi</p>
          </div>

          <div class="text-center w-56">
            <p>Bencongan Indah, ${todayStr}</p>
            <p class="font-semibold mt-1">Ketua RW 01 Bencongan Indah</p>
            <div class="h-16 flex items-center justify-center italic text-gray-400">
              (Stempel & Tanda Tangan)
            </div>
            <p class="font-bold border-b border-black inline-block px-4">Bpk. H. Sudirman</p>
          </div>
        </div>
      </div>
    `;
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

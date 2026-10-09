/**
 * ==============================================================================
 * VIEW: UMKM VIEW (js/views/UMKMView.js)
 * Renders UMKM catalog cards with high-res image handling & error fallbacks
 * ==============================================================================
 */

class UMKMView {
  static renderCards(containerId, items) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!items || items.length === 0) {
      container.innerHTML = `<div class="col-span-full p-8 text-center text-xs text-on-surface-variant">Tidak ada UMKM pada filter ini.</div>`;
      return;
    }

    container.innerHTML = items.map((item, idx) => {
      let waNum = String(item.no_whatsapp || '').replace(/[^0-9]/g, '');
      if (waNum.startsWith('0')) {
        waNum = '62' + waNum.slice(1);
      }
      const waMessage = encodeURIComponent(`Halo Kak ${item.nama_pemilik}, saya ingin memesan/tanya produk ${item.nama_usaha} dari Portal RW 01.`);
      const waUrl = waNum ? `https://api.whatsapp.com/send?phone=${waNum}&text=${waMessage}` : '#';
      const rtText = item.asal_rt || item.rt_pemilik || 'RW 01';
      
      const rawImg = item.gambar || item.foto_produk || item.link_foto;
      const imgUrl = formatGoogleDriveImageUrl(rawImg, idx);
      const fallbackSample = CONFIG.DEFAULT_IMAGES.UMKM[idx % CONFIG.DEFAULT_IMAGES.UMKM.length];

      return `
        <div class="bg-surface-container-lowest border border-outline-variant/60 rounded-2xl overflow-hidden shadow-sm flex flex-col hover:border-primary transition-all group">
          <div class="h-48 w-full overflow-hidden relative bg-surface-container">
            <img src="${imgUrl}" alt="${item.nama_usaha}" 
                 class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                 onerror="this.onerror=null; this.src='${fallbackSample}';"/>
            <span class="absolute top-3 left-3 bg-primary-container/90 text-white backdrop-blur-md text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm">${item.kategori || 'UMKM'}</span>
            <span class="absolute top-3 right-3 bg-black/60 text-white backdrop-blur-md text-xs font-bold px-2.5 py-1 rounded-full shadow-sm">${rtText}</span>
          </div>
          <div class="p-5 flex flex-col gap-3 flex-1">
            <div>
              <h4 class="font-bold text-on-surface text-base">${item.nama_usaha}</h4>
              <p class="text-xs text-on-surface-variant mt-0.5">Pemilik: <span class="font-semibold text-on-surface">${item.nama_pemilik}</span></p>
            </div>
            <p class="text-xs text-on-surface-variant leading-relaxed bg-surface p-3 rounded-xl border border-outline-variant/40 flex-1">${item.deskripsi_produk}</p>
            <a href="${waUrl}" target="_blank" rel="noopener noreferrer" class="btn-wa-style">
              <span class="material-symbols-outlined icon-sm">shopping_cart</span>
              Order via WhatsApp
            </a>
          </div>
        </div>
      `;
    }).join('');
  }
}

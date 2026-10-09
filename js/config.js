/**
 * ==============================================================================
 * CONFIGURATION & CONSTANTS (js/config.js)
 * Website Profil & Layanan Digital RW 01 Bencongan Indah
 * ==============================================================================
 */

const CONFIG = {
  APPS_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyoe0bvV6G_eGpN7UZrV7wgvrgp5ykFSHn-IRfAxXXO__Yar3ZMzGYmQSSu6AoTv-46ow/exec",
  STORAGE_KEYS: {
    ADMIN_USER: "rw01_admin_user"
  },
  DEFAULT_IMAGES: {
    UMKM: ["asset/umkm 1.jpg", "asset/umkm 2.jpg", "asset/umkm 3.jpg"],
    BACKGROUND: "asset/background.jpeg",
    VISI_MISI: "asset/image 1.jpeg"
  },
  ADMIN_WA_NUMBER: "6281234567801" // Nomor Sekretariat / Pengurus RW 01
};

/**
 * Helper: Converts any Google Drive URL into direct displayable image URL
 */
function formatGoogleDriveImageUrl(rawUrl, fallbackIndex = 0) {
  if (!rawUrl || rawUrl === '-' || typeof rawUrl !== 'string') {
    return CONFIG.DEFAULT_IMAGES.UMKM[fallbackIndex % CONFIG.DEFAULT_IMAGES.UMKM.length];
  }
  
  rawUrl = rawUrl.trim();

  // If already data URL or local asset, return directly
  if (rawUrl.startsWith('data:') || rawUrl.startsWith('asset/') || rawUrl.startsWith('./asset/')) {
    return rawUrl;
  }

  let fileId = null;
  const matchFileD = rawUrl.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (matchFileD && matchFileD[1]) {
    fileId = matchFileD[1];
  } else {
    const matchIdParam = rawUrl.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (matchIdParam && matchIdParam[1]) {
      fileId = matchIdParam[1];
    }
  }

  if (fileId) {
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  return rawUrl;
}

/**
 * Helper: Mask Sensitive NIK Data (Shows only first 4 and last 4 digits)
 * Example: 3276********0001
 */
function maskNik(nik) {
  if (!nik) return '-';
  const str = String(nik).trim();
  if (str.length < 8) return str;
  const start = str.slice(0, 4);
  const end = str.slice(-4);
  const maskedLength = Math.max(str.length - 8, 4);
  return `${start}${'*'.repeat(maskedLength)}${end}`;
}

/**
 * Helper: Mask Phone/WA Number
 * Example: 0812****5678 or 62812****5678
 */
function maskPhone(phone) {
  if (!phone) return '-';
  const str = String(phone).replace(/[^0-9]/g, '');
  if (str.length < 7) return str;
  const start = str.slice(0, 4);
  const end = str.slice(-4);
  return `${start}****${end}`;
}

/**
 * Helper: Format Currency to Indonesian Rupiah (Rp)
 */
function formatRupiah(amount) {
  const num = parseInt(amount, 10);
  if (isNaN(num)) return 'Rp 0';
  return 'Rp ' + num.toLocaleString('id-ID');
}

/**
 * Helper: Generates Direct WhatsApp Confirmation URL for Resident Ticket
 */
function buildWhatsAppConfirmUrl({ ticket, name, rt, type, title, status }) {
  const waTarget = CONFIG.ADMIN_WA_NUMBER;
  const messageText = 
`Halo Pengurus RW 01 Bencongan Indah,

Saya ingin mengonfirmasi pengajuan/laporan digital yang baru saya kirim melalui Portal RW 01:

📌 *No. Tiket*: ${ticket}
👤 *Nama Warga*: ${name}
🏡 *RT Domisili*: ${rt}
📑 *Perihal*: ${type || title}
⚡ *Status*: ${status || 'PENDING'}

Mohon dapat diproses. Terima kasih!`;

  return `https://api.whatsapp.com/send?phone=${waTarget}&text=${encodeURIComponent(messageText)}`;
}

/**
 * Global Toast Notification Helper
 */
function showToast(message, type = "info") {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 max-w-md w-full px-4 pointer-events-none";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  const bgColors = {
    success: "bg-emerald-700 text-white shadow-lg",
    error: "bg-rose-700 text-white shadow-lg",
    warning: "bg-amber-600 text-white shadow-lg",
    info: "bg-slate-800 text-white shadow-lg"
  };

  const icons = {
    success: "check_circle",
    error: "error",
    warning: "warning",
    info: "info"
  };

  toast.className = `pointer-events-auto p-4 rounded-xl flex items-start gap-3 transform transition-all duration-300 translate-y-5 opacity-0 ${bgColors[type] || bgColors.info}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined shrink-0 text-xl">${icons[type] || "info"}</span>
    <div class="flex-1 text-sm font-medium leading-snug">${message}</div>
    <button onclick="this.parentElement.remove()" class="shrink-0 text-white/80 hover:text-white">
      <span class="material-symbols-outlined text-lg">close</span>
    </button>
  `;

  toastContainer.appendChild(toast);

  setTimeout(() => toast.classList.remove("translate-y-5", "opacity-0"), 10);
  setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add("opacity-0", "translate-y-2");
      setTimeout(() => toast.remove(), 300);
    }
  }, 5000);
}

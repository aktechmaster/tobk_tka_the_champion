// ==================================================
// 🔐 FUNGSI LOGIN & VALIDASI PASSWORD
// ==================================================
function mulaiUjian(e) {
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const nama = document.getElementById('nama')?.value.trim();
    const kelas = document.getElementById('kelas')?.value;
    const asal = document.getElementById('asal')?.value.trim();
    const nomor = document.getElementById('nomor')?.value.trim();
    const passwordInput = document.getElementById('password')?.value.trim();

    if (!nama || !kelas || !asal || !nomor || !passwordInput) {
        alert("⚠️ Harap isi semua kolom identitas!");
        return false;
    }

    const passwordBenar = typeof passwords !== 'undefined' ? passwords[kelas] : null;

    if (!passwordBenar) {
        alert("⚠️ Password untuk kelas ini belum dikonfigurasi di config.js!");
        return false;
    }

    if (passwordInput !== passwordBenar) {
        alert("❌ Token / Password Ujian Salah!");
        return false;
    }

    // Reset status selesai jika ada
    sessionStorage.removeItem('ujianSelesai');

    window.waktuMulaiUjian = Date.now();
    window.violationCount = 0;

    if (typeof simpanDataKeStorage === 'function') {
        simpanDataKeStorage();
    }

    muatSoalDanMulai(kelas, false);
    return false;
}

// ==================================================
// 📚 FUNGSI MUAT SOAL (IND -> ING -> MTK)
// ==================================================
function muatSoalDanMulai(kelas, isRestored) {
    window.soalIND = [];
    window.soalING = [];
    window.soalMTK = [];

    const loadScript = (src) => {
        return new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = src;
            s.onload = resolve;
            s.onerror = () => reject(src);
            document.head.appendChild(s);
        });
    };

    Promise.all([
        loadScript(`soal_ind_${kelas}.js`),
        loadScript(`soal_ing_${kelas}.js`),
        loadScript(`soal_mtk_${kelas}.js`)
    ]).then(() => {
        window.daftarSoal = [
            ...(window.soalIND || []),
            ...(window.soalING || []),
            ...(window.soalMTK || [])
        ];

        if (window.daftarSoal.length > 0) {
            if (!isRestored) {
                jawabanSiswa = new Array(window.daftarSoal.length).fill("");
                raguRagu = new Array(window.daftarSoal.length).fill(false);
            }

            const loginArea = document.getElementById('loginArea');
            const quizArea = document.getElementById('quizArea');
            const controls = document.getElementById('controls');
            const questionNav = document.getElementById('questionNav');

            if (loginArea) loginArea.style.display = 'none';
            if (quizArea) quizArea.style.display = 'block';
            if (controls) controls.style.display = 'flex';
            if (questionNav) questionNav.style.display = 'grid';
            
            document.getElementById('timerBadge')?.classList.remove('hidden');

            renderInfoPeserta();
            renderQuestionNav();
            tampilkanSoal(0);
            mulaiTimer();
        } else {
            alert("❌ File soal kosong atau format salah.");
        }
    }).catch((errFile) => {
        alert(`❌ Gagal memuat file soal: ${errFile}. Pastikan file tersebut sudah ada di server/GitHub.`);
    });
}

// ==================================================
// 🔄 INSIALISASI DAN RESTORE SESI
// ==================================================
document.addEventListener('DOMContentLoaded', function () {
    const isSelesai = sessionStorage.getItem('ujianSelesai') === 'true';
    const dataSaved = typeof ambilDataDariStorage === 'function' 
        ? ambilDataDariStorage() 
        : JSON.parse(localStorage.getItem('cbt_tka_sd_data') || 'null');

    // JIKA UJIAN SUDAH SELESAI ATAU DATA KOSONG -> TAMPILKAN LOGIN LOGIN
    if (isSelesai || !dataSaved || !dataSaved.kelas) {
        if (typeof bersihkanDataUjian === 'function') bersihkanDataUjian();
        
        const loginArea = document.getElementById('loginArea');
        const quizArea = document.getElementById('quizArea');
        const timerBadge = document.getElementById('timerBadge');

        if (loginArea) loginArea.style.display = 'block';
        if (quizArea) quizArea.style.display = 'none';
        if (timerBadge) timerBadge.classList.add('hidden');
        return;
    }

    // JIKA MASIH DALAM SESI UJIAN AKTIF -> RESTORE
    if (Array.isArray(dataSaved.jawabanSiswa)) jawabanSiswa = dataSaved.jawabanSiswa;
    if (Array.isArray(dataSaved.raguRagu)) raguRagu = dataSaved.raguRagu;
    if (dataSaved.waktuMulaiUjian) window.waktuMulaiUjian = dataSaved.waktuMulaiUjian;
    if (dataSaved.violationCount) window.violationCount = dataSaved.violationCount;

    if (document.getElementById('nama')) document.getElementById('nama').value = dataSaved.nama || '';
    if (document.getElementById('kelas')) document.getElementById('kelas').value = dataSaved.kelas || '';
    if (document.getElementById('asal')) document.getElementById('asal').value = dataSaved.asal || '';
    if (document.getElementById('nomor')) document.getElementById('nomor').value = dataSaved.nomor || '';

    muatSoalDanMulai(dataSaved.kelas, true);
});

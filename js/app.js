// ==================================================
// 🔐 FUNGSI LOGIN & VALIDASI PASSWORD
// ==================================================
function mulaiUjian(e) {
    // WAJIB: Tahan reload bawaan HTML form
    if (e && e.preventDefault) {
        e.preventDefault();
    }

    const nama = document.getElementById('nama')?.value.trim();
    const kelas = document.getElementById('kelas')?.value;
    const asal = document.getElementById('asal')?.value.trim();
    const nomor = document.getElementById('nomor')?.value.trim();
    const passwordInput = document.getElementById('password')?.value.trim();

    // Validasi field kosong
    if (!nama || !kelas || !asal || !nomor || !passwordInput) {
        alert("⚠️ Harap isi semua kolom identitas!");
        return false;
    }

    // Ambil password dari config.js
    const passwordBenar = typeof passwords !== 'undefined' ? passwords[kelas] : null;

    if (!passwordBenar) {
        alert("⚠️ Password untuk kelas ini belum dikonfigurasi di config.js!");
        return false;
    }

    // Cek kecocokan password
    if (passwordInput !== passwordBenar) {
        alert("❌ Token / Password Ujian Salah!");
        return false; // Berhenti di sini, halaman TIDAK akan ter-refresh
    }

    // Jika password benar, simpan data dan muat soal
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

    // Memuat 3 file soal secara berurutan
    Promise.all([
        loadScript(`soal_ind_${kelas}.js`),
        loadScript(`soal_ing_${kelas}.js`),
        loadScript(`soal_mtk_${kelas}.js`)
    ]).then(() => {
        // Penggabungan otomatis
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

            loginArea.style.display = 'none';
            quizArea.style.display = 'block';
            controls.style.display = 'flex';
            questionNav.style.display = 'grid';
            
            document.getElementById('timerBadge').classList.remove('hidden');

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
// 📊 FUNGSI HITUNG SKOR
// ==================================================
function hitungSkor() {
    let indoBenar = 0, indoTotal = 0;
    let ingBenar = 0, ingTotal = 0;
    let mtkBenar = 0, mtkTotal = 0;

    window.daftarSoal.forEach((soal, idx) => {
        const kat = (soal.kategori || soal.subtes || '').toUpperCase();
        const jwb = jawabanSiswa[idx];
        const kunci = soal.kunciJawaban || soal.kunci;
        const isCorrect = jwb === kunci;

        if (kat.includes('INDONESIA') || kat.includes('IND')) {
            indoTotal++;
            if (isCorrect) indoBenar++;
        } else if (kat.includes('INGGRIS') || kat.includes('ING')) {
            ingTotal++;
            if (isCorrect) ingBenar++;
        } else if (kat.includes('MATEMATIKA') || kat.includes('MTK')) {
            mtkTotal++;
            if (isCorrect) mtkBenar++;
        }
    });

    const totalBenar = indoBenar + ingBenar + mtkBenar;
    const totalSoalValid = window.daftarSoal.length;

    return {
        indoBenar, indoTotalSoal: indoTotal, indoSkor: indoBenar * 10, indoMaks: indoTotal * 10,
        ingBenar, ingTotalSoal: ingTotal, ingSkor: ingBenar * 10, ingMaks: ingTotal * 10,
        mtkBenar, mtkTotalSoal: mtkTotal, mtkSkor: mtkBenar * 10, mtkMaks: mtkTotal * 10,
        totalBenar, totalSoalValid
    };
}

// ==================================================
// 🔄 RESTORE SESI UJIAN OTOMATIS SAAT DI-REFRESH
// ==================================================
document.addEventListener('DOMContentLoaded', function () {
    // Ambil data menggunakan fungsi dari storage.js
    const dataSaved = typeof ambilDataDariStorage === 'function' 
        ? ambilDataDariStorage() 
        : JSON.parse(localStorage.getItem('cbt_tka_sd_data') || 'null');

    if (dataSaved && dataSaved.kelas) {
        // Restore jawaban & ragu-ragu dari dataUjian
        if (Array.isArray(dataSaved.jawabanSiswa)) {
            jawabanSiswa = dataSaved.jawabanSiswa;
        }
        if (Array.isArray(dataSaved.raguRagu)) {
            raguRagu = dataSaved.raguRagu;
        }

        // Restore variabel waktu & pelanggaran
        if (dataSaved.waktuMulaiUjian) window.waktuMulaiUjian = dataSaved.waktuMulaiUjian;
        if (dataSaved.violationCount) window.violationCount = dataSaved.violationCount;

        // Restore nilai form input jika elemennya ada
        if (document.getElementById('nama')) document.getElementById('nama').value = dataSaved.nama || '';
        if (document.getElementById('kelas')) document.getElementById('kelas').value = dataSaved.kelas || '';
        if (document.getElementById('asal')) document.getElementById('asal').value = dataSaved.asal || '';
        if (document.getElementById('nomor')) document.getElementById('nomor').value = dataSaved.nomor || '';

        // Masuk kembali ke ujian tanpa mereset jawaban
        muatSoalDanMulai(dataSaved.kelas, true);
    }
});

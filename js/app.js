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

    // Memuat 3 file soal secara berurutan: IND -> ING -> MTK
    Promise.all([
        loadScript(`soal_ind_${kelas}.js`),
        loadScript(`soal_ing_${kelas}.js`),
        loadScript(`soal_mtk_${kelas}.js`)
    ]).then(() => {
        // Penggabungan otomatis (Total 85 Soal)
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
        alert(`❌ Gagal memuat file soal: ${errFile}`);
    });
}

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

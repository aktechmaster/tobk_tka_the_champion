// ==================================================
// 📊 SCORING ENGINE (PENSKORAN PARSIAL / PROPORSIONAL)
// ==================================================

function hitungSkor() {
    let result = {
        indoPoin: 0, indoTotalSoal: 0, indoSkor: 0, indoMaks: 100, indoBenar: 0,
        ingPoin: 0,  ingTotalSoal: 0,  ingSkor: 0,  ingMaks: 100,  ingBenar: 0,
        mtkPoin: 0,  mtkTotalSoal: 0,  mtkSkor: 0,  mtkMaks: 100,  mtkBenar: 0,
        totalPoin: 0, totalSoalValid: 0, totalBenar: 0
    };

    if (!window.daftarSoal || !window.jawabanSiswa) return result;

    const mapHurufKeAngka = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
    const mapAngkaKeHuruf = ['A', 'B', 'C', 'D', 'E'];

    // Helper untuk normalisasi nilai Benar/Salah (True/False/Benar/Salah/1/0)
    const isTrueValue = (val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val === 1;
        if (typeof val === 'string') {
            const clean = val.toUpperCase().trim();
            return ['TRUE', 'BENAR', 'TEPAT', '1', 'YES', 'T'].includes(clean);
        }
        return false;
    };

    window.daftarSoal.forEach((soal, idx) => {
        if (soal.tipe === 'INFO' || soal.id === 99) return;

        const sub = (soal.kategori || soal.subtes || '').toLowerCase();

        // Ambil jawaban siswa (dukung akses via ID Soal maupun Indeks Array)
        let jwb = undefined;
        if (window.jawabanSiswa[soal.id] !== undefined) {
            jwb = window.jawabanSiswa[soal.id];
        } else if (window.jawabanSiswa[idx] !== undefined) {
            jwb = window.jawabanSiswa[idx];
        }

        const kunci = soal.kunciJawaban !== undefined ? soal.kunciJawaban : soal.kunci;
        let poinSoal = 0; // Rentang poin per soal: 0.0 - 1.0

        if (jwb !== undefined && jwb !== null && jwb !== "") {
            
            // 1. PENSKORAN PG (Tunggal)
            if (soal.tipe === 'PG') {
                let jwbNorm = jwb;
                let kunciNorm = kunci;

                // Konversi huruf ke indeks angka atau sebaliknya
                if (typeof kunci === 'string' && isNaN(kunci)) {
                    kunciNorm = kunci.toUpperCase().trim();
                    if (typeof jwb === 'number') jwbNorm = mapAngkaKeHuruf[jwb] || jwb;
                    else if (typeof jwb === 'string' && !isNaN(jwb)) jwbNorm = mapAngkaKeHuruf[parseInt(jwb, 10)] || jwb;
                    else if (typeof jwb === 'string') jwbNorm = jwb.toUpperCase().trim();
                } else if (typeof kunci === 'number') {
                    kunciNorm = kunci;
                    if (typeof jwb === 'string' && mapHurufKeAngka[jwb.toUpperCase().trim()] !== undefined) {
                        jwbNorm = mapHurufKeAngka[jwb.toUpperCase().trim()];
                    } else if (typeof jwb === 'string' && !isNaN(jwb)) {
                        jwbNorm = parseInt(jwb, 10);
                    } else {
                        jwbNorm = Number(jwb);
                    }
                } else {
                    jwbNorm = String(jwb).trim();
                    kunciNorm = String(kunci).trim();
                }

                if (jwbNorm === kunciNorm) {
                    poinSoal = 1;
                }
            } 
            
            // 2. PENSKORAN PGK (Pilihan Ganda Kompleks - Proporsional)
            else if (soal.tipe === 'PGK') {
                if (Array.isArray(jwb) && Array.isArray(kunci) && kunci.length > 0) {
                    const kunciSet = kunci.map(k => (typeof k === 'string' && mapHurufKeAngka[k.toUpperCase().trim()] !== undefined) ? mapHurufKeAngka[k.toUpperCase().trim()] : parseInt(k, 10));
                    const jwbSet = jwb.map(j => (typeof j === 'string' && mapHurufKeAngka[j.toUpperCase().trim()] !== undefined) ? mapHurufKeAngka[j.toUpperCase().trim()] : parseInt(j, 10));

                    const benarDipilih = jwbSet.filter(val => kunciSet.includes(val)).length;
                    const salahDipilih = jwbSet.filter(val => !kunciSet.includes(val)).length;

                    const skorMentah = (benarDipilih - salahDipilih) / kunciSet.length;
                    poinSoal = Math.max(0, skorMentah); 
                }
            } 
            
            // 3. PENSKORAN BS (Benar / Salah / True / False - Proporsional)
            else if (soal.tipe === 'BS') {
                if (Array.isArray(jwb) && Array.isArray(kunci) && kunci.length > 0) {
                    let barisBenar = 0;
                    kunci.forEach((kunciBaris, i) => {
                        const jwbBaris = jwb[i];
                        if (jwbBaris !== undefined && jwbBaris !== null && jwbBaris !== "") {
                            const boolJwb = isTrueValue(jwbBaris);
                            const boolKunci = isTrueValue(kunciBaris);

                            if (boolJwb === boolKunci) {
                                barisBenar++;
                            }
                        }
                    });
                    poinSoal = barisBenar / kunci.length;
                }
            }
        }

        result.totalPoin += poinSoal;
        result.totalSoalValid++;
        if (poinSoal === 1) result.totalBenar++;

        // Pengelompokan Subtes
        if (sub.includes('indo') || sub.includes('bahasa indonesia')) {
            result.indoTotalSoal++;
            result.indoPoin += poinSoal;
        } else if (sub.includes('ing') || sub.includes('inggris') || sub.includes('eng')) {
            result.ingTotalSoal++;
            result.ingPoin += poinSoal;
        } else if (sub.includes('mtk') || sub.includes('matematika') || sub.includes('math')) {
            result.mtkTotalSoal++;
            result.mtkPoin += poinSoal;
        }
    });

    // Format tampilan jumlah poin per subtes
    result.indoBenar = Math.round(result.indoPoin * 10) / 10;
    result.ingBenar  = Math.round(result.ingPoin * 10) / 10;
    result.mtkBenar  = Math.round(result.mtkPoin * 10) / 10;

    // Konversi Skor Skala 20-100
    if (result.indoTotalSoal > 0) result.indoSkor = Math.round(20 + (result.indoPoin / result.indoTotalSoal) * 80);
    if (result.ingTotalSoal > 0)  result.ingSkor  = Math.round(20 + (result.ingPoin / result.ingTotalSoal) * 80);
    if (result.mtkTotalSoal > 0)  result.mtkSkor  = Math.round(20 + (result.mtkPoin / result.mtkTotalSoal) * 80);

    return result;
}

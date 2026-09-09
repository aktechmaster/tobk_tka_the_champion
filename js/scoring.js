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

    if (!window.daftarSoal) return result;

    window.daftarSoal.forEach((soal, idx) => {
        if (soal.tipe === 'INFO' || soal.id === 99) return;

        const sub = (soal.kategori || soal.subtes || '').toLowerCase();
        const jwb = jawabanSiswa[idx];
        const kunci = soal.kunciJawaban || soal.kunci;
        let poinSoal = 0; // Rentang poin per soal: 0.0 - 1.0

        // 1. PENSKORAN PG (Tunggal)
        if (soal.tipe === 'PG') {
            if (jwb === kunci) {
                poinSoal = 1;
            }
        } 
        // 2. PENSKORAN PGK (Pilihan Ganda Kompleks - Proporsional)
        else if (soal.tipe === 'PGK') {
            if (Array.isArray(jwb) && Array.isArray(kunci) && kunci.length > 0) {
                const benarDipilih = jwb.filter(val => kunci.includes(val)).length;
                const salahDipilih = jwb.filter(val => !kunci.includes(val)).length;

                const skorMentah = (benarDipilih - salahDipilih) / kunci.length;
                poinSoal = Math.max(0, skorMentah); 
            }
        } 
        // 3. PENSKORAN BS (Benar / Salah - Proporsional)
        else if (soal.tipe === 'BS') {
            if (Array.isArray(jwb) && Array.isArray(kunci) && kunci.length > 0) {
                let barisBenar = 0;
                kunci.forEach((kunciBaris, i) => {
                    if (jwb[i] === kunciBaris) {
                        barisBenar++;
                    }
                });
                poinSoal = barisBenar / kunci.length;
            }
        }

        result.totalPoin += poinSoal;
        result.totalSoalValid++;
        if (poinSoal === 1) result.totalBenar++;

        // Pengelompokan Subtes
        if (sub.includes('indo')) {
            result.indoTotalSoal++;
            result.indoPoin += poinSoal;
        } else if (sub.includes('ing') || sub.includes('inggris')) {
            result.ingTotalSoal++;
            result.ingPoin += poinSoal;
        } else if (sub.includes('mtk') || sub.includes('matematika')) {
            result.mtkTotalSoal++;
            result.mtkPoin += poinSoal;
        }
    });

    // Format tampilan jumlah poin per subtes (pembulatan 1 desimal untuk ringkasan)
    result.indoBenar = Math.round(result.indoPoin * 10) / 10;
    result.ingBenar  = Math.round(result.ingPoin * 10) / 10;
    result.mtkBenar  = Math.round(result.mtkPoin * 10) / 10;

    // Konversi Skor Skala 20-100 Berdasarkan Total Poin Proporsional
    if (result.indoTotalSoal > 0) {
        result.indoSkor = Math.round(20 + (result.indoPoin / result.indoTotalSoal) * 80);
    }
    if (result.ingTotalSoal > 0) {
        result.ingSkor = Math.round(20 + (result.ingPoin / result.ingTotalSoal) * 80);
    }
    if (result.mtkTotalSoal > 0) {
        result.mtkSkor = Math.round(20 + (result.mtkPoin / result.mtkTotalSoal) * 80);
    }

    return result;
}

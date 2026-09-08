// ==================================================
// 📊 SCORING ENGINE (3 SUBTES)
// ==================================================

function hitungSkor() {
    let result = {
        indoBenar: 0, indoTotalSoal: 0, indoSkor: 0, indoMaks: 100,
        mtkBenar: 0, mtkTotalSoal: 0, mtkSkor: 0, mtkMaks: 100,
        ipaBenar: 0, ipaTotalSoal: 0, ipaSkor: 0, ipaMaks: 100,
        totalBenar: 0, totalSoalValid: 0
    };

    if (!window.daftarSoal) return result;

    window.daftarSoal.forEach((soal, idx) => {
        if (soal.tipe === 'INFO' || soal.id === 99) return;

        const sub = (soal.subtes || '').toLowerCase();
        const jwb = jawabanSiswa[idx];
        let isCorrect = false;

        if (soal.tipe === 'PG') {
            if (jwb === soal.kunci) isCorrect = true;
        } else if (soal.tipe === 'PGK') {
            if (Array.isArray(jwb) && Array.isArray(soal.kunci)) {
                const sortedJwb = [...jwb].sort().join(',');
                const sortedKunci = [...soal.kunci].sort().join(',');
                if (sortedJwb === sortedKunci) isCorrect = true;
            }
        } else if (soal.tipe === 'BS') {
            if (Array.isArray(jwb) && Array.isArray(soal.kunci)) {
                isCorrect = jwb.every((v, i) => v === soal.kunci[i]);
            }
        }

        if (isCorrect) result.totalBenar++;
        result.totalSoalValid++;

        if (sub.includes('indo')) {
            result.indoTotalSoal++;
            if (isCorrect) result.indoBenar++;
        } else if (sub.includes('mtk') || sub.includes('matematika')) {
            result.mtkTotalSoal++;
            if (isCorrect) result.mtkBenar++;
        } else if (sub.includes('ipa')) {
            result.ipaTotalSoal++;
            if (isCorrect) result.ipaBenar++;
        }
    });

    // Konversi Skor Skala 20-100
    if (result.indoTotalSoal > 0) result.indoSkor = Math.round(20 + (result.indoBenar / result.indoTotalSoal) * 80);
    if (result.mtkTotalSoal > 0) result.mtkSkor = Math.round(20 + (result.mtkBenar / result.mtkTotalSoal) * 80);
    if (result.ipaTotalSoal > 0) result.ipaSkor = Math.round(20 + (result.ipaBenar / result.ipaTotalSoal) * 80);

    return result;
}

// ==================================================
// 📊 SCORING ENGINE (LENGKAP + KODE DETEKTIF)
// ==================================================

function hitungSkor() {
    let result = {
        indoPoin: 0, indoTotalSoal: 0, indoTotalBobot: 0, indoSkor: 0, indoMaks: 100, indoBenar: 0,
        ingPoin: 0,  ingTotalSoal: 0,  ingTotalBobot: 0,  ingSkor: 0,  ingMaks: 100,  ingBenar: 0,
        mtkPoin: 0,  mtkTotalSoal: 0,  mtkTotalBobot: 0,  mtkSkor: 0,  mtkMaks: 100,  mtkBenar: 0,
        totalPoin: 0, totalSoalValid: 0, totalBenar: 0
    };

    const listSoal = window.daftarSoal || (typeof daftarSoal !== 'undefined' ? daftarSoal : []);
    const listJwb = window.jawabanSiswa || (typeof jawabanSiswa !== 'undefined' ? jawabanSiswa : []);

    if (!listSoal || listSoal.length === 0) return result;

    const mapHurufKeAngka = { 'A': 0, 'B': 1, 'C': 2, 'D': 3, 'E': 4 };
    const mapAngkaKeHuruf = ['A', 'B', 'C', 'D', 'E'];

    // Helper Nilai Positif (Benar / Tepat / Sesuai / Logis)
    const isPositiveValue = (val) => {
        if (typeof val === 'boolean') return val;
        if (typeof val === 'number') return val === 1;
        if (typeof val === 'string') {
            const clean = val.toUpperCase().trim();
            return ['TRUE', 'BENAR', 'TEPAT', 'SESUAI', 'LOGIS', '1', 'YES', 'T', 'B'].includes(clean);
        }
        return false;
    };

    // Helper Nilai Negatif (Salah / Tidak Tepat / Tidak Sesuai / Tidak Logis)
    const isNegativeValue = (val) => {
        if (typeof val === 'boolean') return !val;
        if (typeof val === 'number') return val === 0;
        if (typeof val === 'string') {
            const clean = val.toUpperCase().trim();
            return ['FALSE', 'SALAH', 'TIDAK TEPAT', 'TIDAK SESUAI', 'TIDAK LOGIS', '0', 'NO', 'F', 'S'].includes(clean);
        }
        return false;
    };

    listSoal.forEach((soal, idx) => {
        if (soal.tipe === 'INFO' || soal.id === 99) return;

        const sub = (soal.kategori || soal.subtes || '').toLowerCase();
        
        // Ambil bobot soal (Default = 1 jika tidak ditentukan di soal.js)
        const bobotSoal = Number(soal.bobot) > 0 ? Number(soal.bobot) : 1;

        let jwb = listJwb[idx];
        const kunci = soal.kunciJawaban !== undefined ? soal.kunciJawaban : soal.kunci;
        let rasioSkor = 0; // Mengukur persentase kebenaran (0.0 sampai 1.0)

        if (jwb !== undefined && jwb !== null && jwb !== "") {
            
            // 1. PENSKORAN PG
            if (soal.tipe === 'PG') {
                let jwbNorm = jwb;
                let kunciNorm = kunci;

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
                    rasioSkor = 1;
                }
            } 
            
            // 2. PENSKORAN PGK
            else if (soal.tipe === 'PGK') {
                if (Array.isArray(jwb) && Array.isArray(kunci) && kunci.length > 0) {
                    const kunciSet = kunci.map(k => (typeof k === 'string' && mapHurufKeAngka[k.toUpperCase().trim()] !== undefined) ? mapHurufKeAngka[k.toUpperCase().trim()] : parseInt(k, 10));
                    const jwbSet = jwb.map(j => (typeof j === 'string' && mapHurufKeAngka[j.toUpperCase().trim()] !== undefined) ? mapHurufKeAngka[j.toUpperCase().trim()] : parseInt(j, 10));

                    const benarDipilih = jwbSet.filter(val => kunciSet.includes(val)).length;
                    const salahDipilih = jwbSet.filter(val => !kunciSet.includes(val)).length;

                    const skorMentah = (benarDipilih - salahDipilih) / kunciSet.length;
                    rasioSkor = Math.max(0, skorMentah); 
                }
            } 
            
            // 3. PENSKORAN BS (FIXED & SAFE)
            else if (soal.tipe === 'BS') {
                if (Array.isArray(jwb) && Array.isArray(kunci) && kunci.length > 0) {
                    let barisBenar = 0;
                    kunci.forEach((kunciBaris, i) => {
                        const jwbBaris = jwb[i];
                        if (jwbBaris !== undefined && jwbBaris !== null && jwbBaris !== "") {
                            const jwbPos = isPositiveValue(jwbBaris);
                            const jwbNeg = isNegativeValue(jwbBaris);
                            const kunciPos = isPositiveValue(kunciBaris);
                            const kunciNeg = isNegativeValue(kunciBaris);

                            // Cocok jika sama-sama positif ATAU sama-sama negatif
                            if ((jwbPos && kunciPos) || (jwbNeg && kunciNeg)) {
                                barisBenar++;
                            }
                        }
                    });
                    rasioSkor = barisBenar / kunci.length;
                }
            }
        }

        // Poin yang didapat = Rasio Kebenaran x Bobot Soal
        const poinDiperoleh = rasioSkor * bobotSoal;

        // ==================================================
        // 🔍 KODE DETEKTIF / DEBUGGING (CEK SOAL SALAH)
        // ==================================================
        if (rasioSkor < 1) {
            console.warn(`❌ SOAL SALAH / PARSIAL -> ID: ${soal.id} | Mapel: ${soal.kategori || soal.subtes} | Tipe: ${soal.tipe}`);
            console.log(`   └─ Kunci Jawaban :`, kunci);
            console.log(`   └─ Jawaban Siswa :`, jwb);
            console.log(`   └─ Rasio Kebenaran: ${rasioSkor * 100}%`);
        }
        // ==================================================

        result.totalPoin += poinDiperoleh;
        result.totalSoalValid++;

        // Jika rasio kebenaran sempurna (100%), hitung sebagai soal benar
        if (rasioSkor === 1) result.totalBenar++;

        // Akumulasi per subtes
        if (sub.includes('indo') || sub.includes('bahasa indonesia')) {
            result.indoTotalSoal++;
            result.indoTotalBobot += bobotSoal;
            result.indoPoin += poinDiperoleh;
        } else if (sub.includes('ing') || sub.includes('inggris') || sub.includes('eng')) {
            result.ingTotalSoal++;
            result.ingTotalBobot += bobotSoal;
            result.ingPoin += poinDiperoleh;
        } else if (sub.includes('mtk') || sub.includes('matematika') || sub.includes('math')) {
            result.mtkTotalSoal++;
            result.mtkTotalBobot += bobotSoal;
            result.mtkPoin += poinDiperoleh;
        }
    });

    // Format tampilan poin
    result.indoBenar = Math.round(result.indoPoin * 10) / 10;
    result.ingBenar  = Math.round(result.ingPoin * 10) / 10;
    result.mtkBenar  = Math.round(result.mtkPoin * 10) / 10;

    // Konversi Skor Skala 20-100 Berdasarkan Total Bobot Maksimal Subtes
    if (result.indoTotalBobot > 0) result.indoSkor = Math.round(20 + (result.indoPoin / result.indoTotalBobot) * 80);
    if (result.ingTotalBobot > 0)  result.ingSkor  = Math.round(20 + (result.ingPoin / result.ingTotalBobot) * 80);
    if (result.mtkTotalBobot > 0)  result.mtkSkor  = Math.round(20 + (result.mtkPoin / result.mtkTotalBobot) * 80);

    return result;
}

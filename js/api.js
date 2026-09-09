// ==================================================
// 🚀 FUNGSI KIRIM DATA SPREADSHEET
// ==================================================

async function kirimKeSpreadsheet(h) {
    const statusBox = document.getElementById('statusPengiriman');
    
    const detikTerlewat = Math.floor((Date.now() - (window.waktuMulaiUjian || Date.now())) / 1000);
    const jam = Math.floor(detikTerlewat / 3600);
    const menit = Math.floor((detikTerlewat % 3600) / 60);
    const detik = detikTerlewat % 60;
    const durasiFormatted = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;

    const jawabanRapi = {};
    if (window.daftarSoal && Array.isArray(window.daftarSoal)) {
        window.daftarSoal.forEach((soal, idx) => {
            if (soal.tipe === 'INFO' || soal.id === 99) return;

            const nomorSoal = soal.id;
            const rawJwb = jawabanSiswa[idx];

            if (rawJwb === undefined || rawJwb === null || rawJwb === '') {
                jawabanRapi[nomorSoal] = "";
                return;
            }

            if (soal.tipe === 'PG') {
                jawabanRapi[nomorSoal] = rawJwb;
            } else if (soal.tipe === 'PGK') {
                if (Array.isArray(rawJwb)) {
                    const huruf = rawJwb
                        .slice()
                        .sort((a, b) => a - b)
                        .map(num => String.fromCharCode(65 + num)); 
                    jawabanRapi[nomorSoal] = huruf.join(", ");
                } else {
                    jawabanRapi[nomorSoal] = "";
                }
            } else if (soal.tipe === 'BS') {
                if (Array.isArray(rawJwb)) {
                    const bsText = rawJwb.map(val => val || "-");
                    jawabanRapi[nomorSoal] = bsText.join(", ");
                } else {
                    jawabanRapi[nomorSoal] = "";
                }
            }
        });
    }

    let jumlahSubtes = 0;
    let akumulasiSkor = 0;

    if (h.indoTotalSoal > 0) { jumlahSubtes++; akumulasiSkor += h.indoSkor; }
    if (h.ingTotalSoal > 0)  { jumlahSubtes++; akumulasiSkor += h.ingSkor; }
    if (h.mtkTotalSoal > 0)  { jumlahSubtes++; akumulasiSkor += h.mtkSkor; }

    const totalSkorRata = jumlahSubtes > 0 ? Math.round(akumulasiSkor / jumlahSubtes) : 0;

    const payload = {
        namaSheet: "Rekap_TKA_6_SD",
        nama: document.getElementById('nama')?.value || (typeof ambilDataDariStorage === 'function' ? ambilDataDariStorage()?.nama : "") || "",
        kelas: document.getElementById('kelas')?.value || (typeof ambilDataDariStorage === 'function' ? ambilDataDariStorage()?.kelas : "") || "",
        asal: document.getElementById('asalSekolah')?.value || document.getElementById('asal')?.value || (typeof ambilDataDariStorage === 'function' ? ambilDataDariStorage()?.asal : "") || "",
        nomor: document.getElementById('nomor')?.value || (typeof ambilDataDariStorage === 'function' ? ambilDataDariStorage()?.nomor : "") || "",
        mapel: document.getElementById('mapel')?.value || (typeof ambilDataDariStorage === 'function' ? ambilDataDariStorage()?.mapel : "") || "TKA (Indo, Mtk, IPA)",
        skorIndo: h.indoSkor || 0,
        skorIng: h.ingSkor || 0,
        skorMtk: h.mtkSkor || 0,
        totalSkor: totalSkorRata,
        pelanggaran: window.violationCount || 0,
        durasi: durasiFormatted,
        jawaban: jawabanRapi
    };

    try {
        if (statusBox) {
            statusBox.innerHTML = `⏳ <span style="color: #0056b3;">Menyimpan hasil ujian ke server...</span>`;
        }

        // Menggunakan mode 'no-cors' agar pengiriman dari GitHub Pages ke Apps Script tidak diblokir browser
        await fetch(URL_GAS, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload)
        });

        if (statusBox) {
            statusBox.innerHTML = `<span style="color: #16a34a; font-weight: bold;">✅ Hasil ujian berhasil terkirim dan tersimpan!</span>`;
        }

    } catch (err) {
        console.error("Error kirim data:", err);
        if (statusBox) {
            statusBox.innerHTML = `
                <div style="color: #cc0000; font-weight: bold; margin-bottom: 8px;">
                    ❌ Gagal terhubung ke server.
                </div>
                <button onclick="kirimKeSpreadsheet(typeof hitungSkor === 'function' ? hitungSkor() : {})" style="padding: 6px 12px; background: #dc2626; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">
                    🔄 Coba Kirim Ulang Data
                </button>
            `;
        }
    }
}

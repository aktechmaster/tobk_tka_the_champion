// ==================================================
// 💾 LOCALSTORAGE & SESSIONSTORAGE MANAGEMENT
// ==================================================

function simpanDataKeStorage() {
    const dataUjian = {
        nama: document.getElementById('nama')?.value || '',
        kelas: document.getElementById('kelas')?.value || '',
        asal: document.getElementById('asal')?.value || '',
        nomor: document.getElementById('nomor')?.value || '',
        mapel: document.getElementById('mapel')?.value || '',
        jawabanSiswa: jawabanSiswa,
        raguRagu: raguRagu,
        waktuMulaiUjian: window.waktuMulaiUjian || Date.now(),
        violationCount: window.violationCount || 0
    };
    localStorage.setItem('cbt_tka_sd_data', JSON.stringify(dataUjian));
}

function ambilDataDariStorage() {
    const data = localStorage.getItem('cbt_tka_sd_data');
    return data ? JSON.parse(data) : null;
}

function bersihkanDataUjian() {
    localStorage.removeItem('cbt_tka_sd_data');
}

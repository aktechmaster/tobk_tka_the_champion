// ==================================================
// ⏱️ TIMER SYSTEM
// ==================================================

function mulaiTimer() {
    if (timerInterval) clearInterval(timerInterval);

    const timerEl = document.getElementById('timer');

    timerInterval = setInterval(() => {
        const detikTerlewat = Math.floor((Date.now() - window.waktuMulaiUjian) / 1000);
        const sisaDetik = durasiUjianDetik - detikTerlewat;

        if (sisaDetik <= 0) {
            clearInterval(timerInterval);
            alert("⏰ Waktu ujian telah habis! Sistem akan mengirim jawaban Anda otomatis.");
            tampilkanHasil();
            return;
        }

        const jam = Math.floor(sisaDetik / 3600);
        const menit = Math.floor((sisaDetik % 3600) / 60);
        const detik = sisaDetik % 60;

        timerEl.textContent = `${jam.toString().padStart(2, '0')}:${menit.toString().padStart(2, '0')}:${detik.toString().padStart(2, '0')}`;
    }, 1000);
}

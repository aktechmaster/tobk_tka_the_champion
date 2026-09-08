// ==================================================
// 🚨 SISTEM DETEKSI PELANGGARAN & SHOCK ALERT
// ==================================================

window.tutupPeringatan = function() {
    document.getElementById('customPeringatan').style.display = 'none';
};

function catatPelanggaran() {
    if (sessionStorage.getItem('ujianSelesai') === 'true') return;
    if (window.isConfirming) return;

    if (quizArea && quizArea.style.display === 'block') {
        window.violationCount = (window.violationCount || 0) + 1;
        
        const elemenPelanggaran = document.getElementById('violationCount');
        if (elemenPelanggaran) {
            elemenPelanggaran.textContent = window.violationCount;
        }
        
        simpanDataKeStorage();

        const textEl = document.getElementById('peringatanText');
        textEl.innerHTML = `Kamu terdeteksi meninggalkan layar ujian sebanyak <span class="peringatan-angka">${window.violationCount} KALI</span>.<br><br>Aktivitas ini terus dicatat oleh sistem. Harap segera kembali fokus pada halaman ujian!`;
        
        const modalPeringatan = document.getElementById('customPeringatan');
        modalPeringatan.style.display = 'flex';
        
        const box = modalPeringatan.querySelector('.peringatan-box');
        box.style.animation = 'none';
        setTimeout(() => box.style.animation = '', 10);
    }
}

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        catatPelanggaran();
    }
});

window.addEventListener('blur', () => {
    setTimeout(() => {
        if (document.activeElement !== document.body) {
            const customAlert = document.getElementById('customPeringatan');
            if (customAlert && !customAlert.contains(document.activeElement)) {
                catatPelanggaran();
            }
        }
    }, 150);
});

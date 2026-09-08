// ==================================================
// 🎮 MAIN CONTROLLER & INITIALIZATION
// ==================================================

// Event Navigation Click Listener
prevBtn.onclick = () => tampilkanSoal(currentIndex - 1);
nextBtn.onclick = () => tampilkanSoal(currentIndex + 1);

function konfirmasiSelesai() {
    window.isConfirming = true;
    if (confirm("Apakah Anda yakin ingin menyelesaikan ujian ini? Jawaban tidak dapat diubah setelah dikirim.")) {
        tampilkanHasil();
    }
    window.isConfirming = false;
}

function mulaiUjian(e) {
    e.preventDefault();

    const kelas = document.getElementById('kelas').value;
    const passwordInput = document.getElementById('password').value.trim();

    if (passwords[kelas] && passwordInput !== passwords[kelas]) {
        alert("⚠️ Password / Token Ujian Salah!");
        return;
    }

    window.waktuMulaiUjian = Date.now();
    window.violationCount = 0;
    
    simpanDataKeStorage();
    muatSoalDanMulai(kelas, false);
}

function muatSoalDanMulai(kelas, isRestored) {
    const scriptSoal = document.createElement('script');
    scriptSoal.src = `soal_tka_gabungan_${kelas}.js`;
    
    scriptSoal.onload = () => {
        if (typeof soalTKA !== 'undefined') {
            window.daftarSoal = soalTKA;
            
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
            alert("❌ File soal tidak ditemukan atau format salah.");
        }
    };

    scriptSoal.onerror = () => {
        alert(`❌ Gagal memuat file soal: soal_tka_gabungan_${kelas}.js`);
    };

    document.head.appendChild(scriptSoal);
}

window.kembaliKeAwal = function() {
    bersihkanDataUjian();
    sessionStorage.removeItem('ujianSelesai'); 
    window.location.reload(); 
};

// Auto-Restore saat Halaman di-load
window.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('ujianSelesai') === 'true') {
        tampilkanHasil();
        return;
    }

    const savedData = ambilDataDariStorage();
    if (savedData && savedData.nama && savedData.kelas) {
        document.getElementById('nama').value = savedData.nama;
        document.getElementById('kelas').value = savedData.kelas;
        document.getElementById('asal').value = savedData.asal;
        document.getElementById('nomor').value = savedData.nomor;
        
        jawabanSiswa = savedData.jawabanSiswa || [];
        raguRagu = savedData.raguRagu || [];
        window.waktuMulaiUjian = savedData.waktuMulaiUjian || Date.now();
        window.violationCount = savedData.violationCount || 0;

        muatSoalDanMulai(savedData.kelas, true);
    }
});

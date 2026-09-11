// ==================================================
// ⚙️ KONFIGURASI KEAMANAN & PENGATURAN
// ==================================================
const MAX_PELANGGARAN = 5;
const PASSWORD_RESET = "12345"; // Ubah password reset admin di sini

window.violationCount = window.violationCount || 0;
window.lastViolationTime = 0;
window.isBlocked = sessionStorage.getItem('isBlocked') === 'true';

// Check otomatis jika saat reload halaman status sudah terblokir
document.addEventListener('DOMContentLoaded', () => {
    if (window.isBlocked) {
        blockExam();
    }
});

// ==================================================
// 🚨 SISTEM DETEKSI PELANGGARAN & SHOCK ALERT
// ==================================================

window.tutupPeringatan = function() {
    const modalPeringatan = document.getElementById('customPeringatan');
    if (modalPeringatan) {
        modalPeringatan.style.display = 'none';
    }
    // Reset jeda waktu agar tidak langsung terhitung lagi saat modal baru ditutup
    window.lastViolationTime = Date.now();
};

function catatPelanggaran() {
    // 1. Guard Clause: Jangan catat jika ujian selesai, konfirmasi aktif, terblokir, atau modal sedang terbuka
    const modalPeringatan = document.getElementById('customPeringatan');
    const isModalOpen = modalPeringatan && modalPeringatan.style.display === 'flex';

    if (sessionStorage.getItem('ujianSelesai') === 'true' || window.isConfirming || window.isBlocked || isModalOpen) {
        return;
    }

    // 2. Debounce (Jeda 2 detik untuk cegah double-count di HP)
    const now = Date.now();
    if (now - window.lastViolationTime < 2000) {
        return;
    }
    window.lastViolationTime = now;

    // 3. Cek area ujian
    const quizArea = document.getElementById('quizArea');
    if (quizArea && quizArea.style.display === 'block') {
        window.violationCount++;
        
        const elemenPelanggaran = document.getElementById('violationCount');
        if (elemenPelanggaran) {
            elemenPelanggaran.textContent = window.violationCount;
        }
        
        if (typeof simpanDataKeStorage === 'function') {
            simpanDataKeStorage();
        }

        // 4. Eksekusi Blokir atau Tampilkan Peringatan
        if (window.violationCount >= MAX_PELANGGARAN) {
            blockExam();
        } else {
            const sisaSempatan = MAX_PELANGGARAN - window.violationCount;
            const textEl = document.getElementById('peringatanText');
            if (textEl) {
                textEl.innerHTML = `Kamu terdeteksi meninggalkan layar ujian sebanyak <span class="peringatan-angka">${window.violationCount} KALI</span>.<br>Sisa kesempatan: <b>${sisaSempatan} kali</b>.<br><br>Aktivitas ini terus dicatat oleh sistem. Harap segera kembali fokus!`;
            }
            
            if (modalPeringatan) {
                modalPeringatan.style.display = 'flex';
                const box = modalPeringatan.querySelector('.peringatan-box');
                if (box) {
                    box.style.animation = 'none';
                    void box.offsetWidth; // Trigger reflow animasi
                    box.style.animation = '';
                }
            }
        }
    }
}

// ==================================================
// 🔒 FUNGSI EKSEKUSI BLOKIR
// ==================================================
function blockExam() {
    window.isBlocked = true;
    sessionStorage.setItem('isBlocked', 'true');

    // Tutup popup warning jika sedang terbuka
    const modalPeringatan = document.getElementById('customPeringatan');
    if (modalPeringatan) {
        modalPeringatan.style.display = 'none';
    }

    // Tampilkan Layar Blokir (Layar Merah)
    const blockScreen = document.getElementById('blockScreen');
    if (blockScreen) {
        blockScreen.style.display = 'flex';
    } else {
        alert("AKSES UJIAN DIBLOKIR KARENA MELEBIHI BATAS PELANGGARAN!");
        document.body.innerHTML = "<h1 style='color:red; text-align:center; padding-top:100px;'>AKSES UJIAN DIBLOKIR</h1>";
    }
    document.body.style.overflow = "hidden";

    // Matikan Timer jika ada
    if (window.timerInterval) {
        clearInterval(window.timerInterval);
    }
}

// ==================================================
// 🛡️ SENSOR VISIBILITAS & BLUR
// ==================================================
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' || document.hidden) {
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

// ==================================================
// 🚫 PROTEKSI INSPECT ELEMENT & RESET DESKTOP
// ==================================================
document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', function(e) {
    // Reset Ujian Rahasia Admin (Ctrl + Shift + 9)
    if (e.ctrlKey && e.shiftKey && e.keyCode === 57) {
        e.preventDefault();
        setTimeout(() => {
            let pass = prompt("PASSWORD RESET ADMIN:");
            if (pass === PASSWORD_RESET) {
                sessionStorage.clear();
                localStorage.clear();
                alert("Sistem berhasil di-reset. Reloading...");
                location.reload();
            } else if (pass) {
                alert("Password Salah!");
            }
        }, 100);
        return false;
    }

    // Block F12 dan Shortcut Inspect (Ctrl + Shift + I/J/C/U atau Ctrl + U)
    if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && [73, 74, 67, 85].includes(e.keyCode)) ||
        (e.ctrlKey && e.keyCode === 85)
    ) {
        e.preventDefault();
        return false;
    }
});

// ==================================================
// 📱 RESET KHUSUS MOBILE (TAHAN LAYAR 5 DETIK)
// ==================================================
let pressTimer;

function startLongPress() {
    pressTimer = setTimeout(function() {
        let pass = prompt("PASSWORD RESET ADMIN:");
        if (pass === PASSWORD_RESET) {
            sessionStorage.clear();
            localStorage.clear();
            alert("Sistem berhasil di-reset!");
            location.reload();
        } else if (pass) {
            alert("Password Salah!");
        }
    }, 5000);
}

function cancelLongPress() {
    if (pressTimer) {
        clearTimeout(pressTimer);
        pressTimer = null;
    }
}

// Pasang trigger long-press di Layar Blokir & Gambar Logo
document.addEventListener('DOMContentLoaded', () => {
    const blockScreen = document.getElementById('blockScreen');
    if (blockScreen) {
        blockScreen.addEventListener('touchstart', startLongPress, { passive: true });
        blockScreen.addEventListener('touchend', cancelLongPress);
        blockScreen.addEventListener('touchmove', cancelLongPress);
    }

    const logos = document.querySelectorAll('img');
    logos.forEach(img => {
        img.addEventListener('touchstart', startLongPress, { passive: true });
        img.addEventListener('touchend', cancelLongPress);
        img.addEventListener('touchmove', cancelLongPress);
    });
});

// ==================================================
// ⚙️ KONFIGURASI KEAMANAN & PENGATURAN
// ==================================================
const MAX_PELANGGARAN = 999; // Set ke angka tinggi agar tidak pernah terblokir
const PASSWORD_RESET = "12345"; // Ubah password reset admin di sini

window.violationCount = 0;
window.lastViolationTime = 0;
window.isBlocked = false; // Matikan status blokir

// ==================================================
// 🚨 SISTEM DETEKSI PELANGGARAN (DI-OFFKAN)
// ==================================================

window.tutupPeringatan = function() {
    const modalPeringatan = document.getElementById('customPeringatan');
    if (modalPeringatan) {
        modalPeringatan.style.display = 'none';
    }
};

function catatPelanggaran() {
    // ❌ DILUMPUHKAN: Tidak mencatat pelanggaran apa pun
    return;
}

function blockExam() {
    // ❌ DILUMPUHKAN: Tidak memblokir layar ujian
    return;
}

// ==================================================
// 🛡️ SENSOR VISIBILITAS & BLUR (DIMATIKAN)
// ==================================================
/* 
document.addEventListener('visibilitychange', () => {
    // Dimatikan agar bebas pindah tab/window saat testing
});

window.addEventListener('blur', () => {
    // Dimatikan agar tidak memicu peringatan
});
*/

// ==================================================
// 🚫 PROTEKSI INSPECT ELEMENT & RESET DESKTOP
// ==================================================

// ❌ DIBUKA: Klik kanan diizinkan kembali untuk Inspect Element
// document.addEventListener('contextmenu', (e) => e.preventDefault());

document.addEventListener('keydown', function(e) {
    // ✅ FITUR RESET ADMIN DIBIARKAN AKTIF (Ctrl + Shift + 9)
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

    // ❌ DIBUKA: Tombol F12 dan Shortcut Inspect Element BISA DIGUNAKAN LAGI
    /*
    if (
        e.keyCode === 123 ||
        (e.ctrlKey && e.shiftKey && [73, 74, 67, 85].includes(e.keyCode)) ||
        (e.ctrlKey && e.keyCode === 85)
    ) {
        e.preventDefault();
        return false;
    }
    */
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

// Pasang trigger long-press khusus tombol reset logo saja
document.addEventListener('DOMContentLoaded', () => {
    const logos = document.querySelectorAll('img');
    logos.forEach(img => {
        img.addEventListener('touchstart', startLongPress, { passive: true });
        img.addEventListener('touchend', cancelLongPress);
        img.addEventListener('touchmove', cancelLongPress);
    });
});

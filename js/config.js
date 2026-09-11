// ==================================================
// 🚀 KONFIGURASI & VARIABEL GLOBAL
// ==================================================

const URL_GAS = "https://script.google.com/macros/s/AKfycbyNOvK475pqBlFmUTj4GiYiqeJvesUhVtq1aLZ8PVROlH7rIMcfhC1kpRKyPxwQddefEg/exec";

const passwords = {
    '12_SMA': 'TKASMA2026',
    '6_SD': 'TKA6SD2026',
    '5_SD': 'TKA5SD2026'
};

let jawabanSiswa = [];
let raguRagu = [];
let currentIndex = 0;
let timerInterval = null;
let durasiUjianDetik = 13500; // 3 Jam 45 menit (225 menit)

// Dynamic Global State
window.daftarSoal = [];
window.waktuMulaiUjian = Date.now();
window.violationCount = 0;
window.isConfirming = false;

// DOM Elements
const loginArea = document.getElementById('loginArea');
const quizArea = document.getElementById('quizArea');
const soalContainer = document.getElementById('soalContainer');
const controls = document.getElementById('controls');
const questionNav = document.getElementById('questionNav');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const finishBtn = document.getElementById('finishBtn');
const raguBtn = document.getElementById('raguBtn');

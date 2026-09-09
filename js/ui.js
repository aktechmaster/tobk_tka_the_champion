// ==================================================
// 📝 RENDER SOAL, JAWABAN, NAVIGASI, & HASIL
// ==================================================

function renderInfoPeserta() {
    const data = typeof ambilDataDariStorage === 'function' ? ambilDataDariStorage() : null;
    const nama = data?.nama || document.getElementById('nama')?.value || '-';
    const kelas = data?.kelas || document.getElementById('kelas')?.value || '-';
    const nomor = data?.nomor || document.getElementById('nomor')?.value || '-';

    const infoBox = document.getElementById('infoPesertaBox');
    if (infoBox) {
        infoBox.innerHTML = `
            👤 <b>${nama}</b> (${nomor}) | 🏫 Kelas: ${kelas} | 🚨 Pelanggaran: <span id="violationCount" style="color:red; font-weight:bold;">${window.violationCount || 0}</span>
        `;
    }
}

function tampilkanSoal(index) {
    if (!window.daftarSoal || index < 0 || index >= window.daftarSoal.length) return;
    
    currentIndex = index;
    const soal = window.daftarSoal[index];
    
    // Fallback pencocokan properti dari file soal
    const daftarOpsi = soal.opsi || soal.pilihan || [];
    const daftarPernyataan = soal.pernyataan || soal.pilihan || [];
    const teksPertanyaan = soal.pertanyaan || soal.soal || soal.teks || '';
    const namaSubtes = soal.subtes || soal.kategori || 'Umum';

    // Elemen gambar (jika ada)
    const htmlGambar = soal.gambar 
        ? `<div style="text-align:center; margin: 10px 0;"><img src="${soal.gambar}" style="max-width:100%; max-height:280px; border-radius:8px; border:1px solid #cbd5e1;"></div>` 
        : '';

    let htmlOpsi = '';

    if (soal.tipe === 'PG') {
        htmlOpsi = '<div class="opsi-container">';
        daftarOpsi.forEach((opsi, idx) => {
            const hurufOpsi = String.fromCharCode(65 + idx);
            const isChecked = jawabanSiswa[currentIndex] === hurufOpsi ? 'checked' : '';
            htmlOpsi += `
                <label class="opsi-item">
                    <input type="radio" name="jawaban_${currentIndex}" value="${hurufOpsi}" ${isChecked} onchange="simpanJawabanPG('${hurufOpsi}')">
                    <b>${hurufOpsi}.</b> &nbsp; ${opsi}
                </label>
            `;
        });
        htmlOpsi += '</div>';
    } else if (soal.tipe === 'PGK') {
        const currentAnswers = Array.isArray(jawabanSiswa[currentIndex]) ? jawabanSiswa[currentIndex] : [];
        htmlOpsi = '<div class="opsi-container"><p style="font-size:13px; color:#64748b; margin-bottom:10px;"><i>* Pilihan Jawaban Kompleks (Bisa pilih lebih dari satu):</i></p>';
        daftarOpsi.forEach((opsi, idx) => {
            const isChecked = currentAnswers.includes(idx) ? 'checked' : '';
            htmlOpsi += `
                <label class="opsi-item">
                    <input type="checkbox" name="jawaban_pgk_${currentIndex}" value="${idx}" ${isChecked} onchange="simpanJawabanPGK()">
                    <b>${String.fromCharCode(65 + idx)}.</b> &nbsp; ${opsi}
                </label>
            `;
        });
        htmlOpsi += '</div>';
    } else if (soal.tipe === 'BS') {
        const currentAnswers = Array.isArray(jawabanSiswa[currentIndex]) ? jawabanSiswa[currentIndex] : [];
        htmlOpsi = `
            <table class="tabel-bs" style="width:100%; border-collapse:collapse; margin-top:15px; border:1px solid #cbd5e1;">
                <thead>
                    <tr style="background:#f1f5f9;">
                        <th style="padding:10px; border:1px solid #cbd5e1; text-align:left;">Pernyataan</th>
                        <th style="padding:10px; border:1px solid #cbd5e1; width:80px; text-align:center;">Benar</th>
                        <th style="padding:10px; border:1px solid #cbd5e1; width:80px; text-align:center;">Salah</th>
                    </tr>
                </thead>
                <tbody>
        `;
        daftarPernyataan.forEach((p, idx) => {
            const val = currentAnswers[idx] || '';
            const isBenar = (val === 'B' || val === 'Benar') ? 'checked' : '';
            const isSalah = (val === 'S' || val === 'Salah') ? 'checked' : '';
            
            htmlOpsi += `
                <tr>
                    <td style="padding:10px; border:1px solid #cbd5e1;">(${idx + 1}) ${p}</td>
                    <td style="padding:10px; border:1px solid #cbd5e1; text-align:center;">
                        <input type="radio" name="bs_${currentIndex}_${idx}" value="B" ${isBenar} onchange="simpanJawabanBS(${idx}, 'B')">
                    </td>
                    <td style="padding:10px; border:1px solid #cbd5e1; text-align:center;">
                        <input type="radio" name="bs_${currentIndex}_${idx}" value="S" ${isSalah} onchange="simpanJawabanBS(${idx}, 'S')">
                    </td>
                </tr>
            `;
        });
        htmlOpsi += '</tbody></table>';
    } else if (soal.tipe === 'INFO') {
        htmlOpsi = `<div style="background:#e0f2fe; padding:15px; border-radius:8px; border:1px solid #bae6fd; color:#0369a1;">📌 <b>INFORMASI SUBTES:</b> ${teksPertanyaan}</div>`;
    }

    const soalContainer = document.getElementById('soalContainer');
    if (soalContainer) {
        soalContainer.innerHTML = `
            <div class="soal-box">
                <h4>Soal No. ${soal.id || (index + 1)} <span style="font-size:12px; font-weight:normal; color:#64748b;">[${namaSubtes}]</span></h4>
                ${htmlGambar}
                <div style="margin: 15px 0; line-height: 1.6;">${teksPertanyaan}</div>
                ${htmlOpsi}
            </div>
        `;
    }

    const raguBtn = document.getElementById('raguBtn');
    if (raguBtn) {
        raguBtn.checked = raguRagu[currentIndex] || false;
    }

    updateNavButtons();
    updateGridNavStatus();
}

function simpanJawabanPG(val) {
    jawabanSiswa[currentIndex] = val;
    if (typeof simpanDataKeStorage === 'function') simpanDataKeStorage();
    updateGridNavStatus();
}

function simpanJawabanPGK() {
    const checkboxes = document.querySelectorAll(`input[name="jawaban_pgk_${currentIndex}"]:checked`);
    const selected = Array.from(checkboxes).map(cb => parseInt(cb.value));
    jawabanSiswa[currentIndex] = selected;
    if (typeof simpanDataKeStorage === 'function') simpanDataKeStorage();
    updateGridNavStatus();
}

function simpanJawabanBS(rowIdx, val) {
    if (!Array.isArray(jawabanSiswa[currentIndex])) {
        jawabanSiswa[currentIndex] = [];
    }
    jawabanSiswa[currentIndex][rowIdx] = val;
    if (typeof simpanDataKeStorage === 'function') simpanDataKeStorage();
    updateGridNavStatus();
}

function toggleRaguRagu() {
    const raguBtn = document.getElementById('raguBtn');
    if (raguBtn) {
        raguRagu[currentIndex] = raguBtn.checked;
        if (typeof simpanDataKeStorage === 'function') simpanDataKeStorage();
        updateGridNavStatus();
    }
}

function renderQuestionNav() {
    const questionNav = document.getElementById('questionNav');
    if (!questionNav) return;

    questionNav.innerHTML = '';
    window.daftarSoal.forEach((soal, idx) => {
        if (soal.tipe === 'INFO') return;
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.id = `nav-btn-${idx}`;
        btn.textContent = soal.id || (idx + 1);
        btn.onclick = () => tampilkanSoal(idx);
        questionNav.appendChild(btn);
    });
}

function updateNavButtons() {
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const finishBtn = document.getElementById('finishBtn');

    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    
    if (currentIndex === window.daftarSoal.length - 1) {
        if (nextBtn) nextBtn.style.display = 'none';
        if (finishBtn) finishBtn.style.display = 'inline-block';
    } else {
        if (nextBtn) nextBtn.style.display = 'inline-block';
        if (finishBtn) finishBtn.style.display = 'none';
    }
}

function updateGridNavStatus() {
    if (!window.daftarSoal) return;

    window.daftarSoal.forEach((soal, idx) => {
        const btn = document.getElementById(`nav-btn-${idx}`);
        if (!btn) return;

        btn.classList.remove('answered', 'flagged', 'active');

        if (idx === currentIndex) btn.classList.add('active');

        const jwb = jawabanSiswa[idx];
        let hasAnswer = false;

        if (Array.isArray(jwb)) {
            hasAnswer = jwb.some(x => x !== undefined && x !== null && x !== '');
        } else {
            hasAnswer = jwb !== undefined && jwb !== null && jwb !== '';
        }

        if (raguRagu[idx]) {
            btn.classList.add('flagged');
        } else if (hasAnswer) {
            btn.classList.add('answered');
        }
    });
}

function konfirmasiSelesai() {
    let belumDijawab = 0;

    if (window.daftarSoal && Array.isArray(jawabanSiswa)) {
        window.daftarSoal.forEach((soal, idx) => {
            if (soal.tipe === 'INFO') return;
            const jwb = jawabanSiswa[idx];
            const adaJawaban = Array.isArray(jwb) 
                ? jwb.some(x => x !== undefined && x !== null && x !== '') 
                : (jwb !== undefined && jwb !== null && jwb !== '');
            
            if (!adaJawaban) belumDijawab++;
        });
    }

    let pesan = "Apakah kamu yakin ingin menyelesaikan ujian?";
    if (belumDijawab > 0) {
        pesan = `Masih ada ${belumDijawab} soal yang belum dijawab.\n\n` + pesan;
    }

    if (confirm(pesan)) {
        tampilkanHasil();
    }
}

function tampilkanHasil() {
    if (typeof timerInterval !== 'undefined' && timerInterval) clearInterval(timerInterval);

    const h = typeof hitungSkor === 'function' ? hitungSkor() : { 
        indoSkor: 0, indoMaks: 0, indoBenar: 0, indoTotalSoal: 0, 
        ingSkor: 0, ingMaks: 0, ingBenar: 0, ingTotalSoal: 0, 
        mtkSkor: 0, mtkMaks: 0, mtkBenar: 0, mtkTotalSoal: 0, 
        totalBenar: 0, totalPoin: 0, totalSoalValid: 0 
    };

    const totalPoinFormat = Math.round((h.totalPoin || h.totalBenar || 0) * 10) / 10;
    const totalSalahFormat = Math.round(((h.totalSoalValid || 0) - totalPoinFormat) * 10) / 10;
    
    const quizArea = document.getElementById('quizArea');
    if (quizArea) {
        quizArea.innerHTML = `
            <div class="result-box">
                <div id="statusPengiriman" style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px; margin-bottom: 20px; text-align: center; font-size: 14px;">
                    ⏳ Mempersiapkan pengiriman data...
                </div>

                <div style="display: flex; justify-content: space-between; margin-bottom: 20px; text-align: center; flex-wrap: wrap; gap: 10px;">
                    <!-- B. Indonesia -->
                    <div style="flex: 1; min-width: 110px; border-right: 1px solid #e2e8f0; padding: 0 5px;">
                        <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">B. Indonesia</div>
                        <div style="font-size: 24px; font-weight: 900; color: #0056b3; margin: 5px 0;">
                            ${h.indoSkor} <span style="font-size: 11px; color: #94a3b8;">/ ${h.indoMaks}</span>
                        </div>
                        <div style="font-size: 11px; color: #16a34a; font-weight: bold;">
                            ✅ ${h.indoBenar}/${h.indoTotalSoal} Poin
                        </div>
                    </div>
                    
                    <!-- B. Inggris -->
                    <div style="flex: 1; min-width: 110px; border-right: 1px solid #e2e8f0; padding: 0 5px;">
                        <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">B. Inggris</div>
                        <div style="font-size: 24px; font-weight: 900; color: #059669; margin: 5px 0;">
                            ${h.ingSkor} <span style="font-size: 11px; color: #94a3b8;">/ ${h.ingMaks}</span>
                        </div>
                        <div style="font-size: 11px; color: #16a34a; font-weight: bold;">
                            ✅ ${h.ingBenar}/${h.ingTotalSoal} Poin
                        </div>
                    </div>

                    <!-- Matematika -->
                    <div style="flex: 1; min-width: 110px; padding: 0 5px;">
                        <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Matematika</div>
                        <div style="font-size: 24px; font-weight: 900; color: #d97706; margin: 5px 0;">
                            ${h.mtkSkor} <span style="font-size: 11px; color: #94a3b8;">/ ${h.mtkMaks}</span>
                        </div>
                        <div style="font-size: 11px; color: #16a34a; font-weight: bold;">
                            ✅ ${h.mtkBenar}/${h.mtkTotalSoal} Poin
                        </div>
                    </div>
                </div>

                <hr style="margin: 20px 0; border: 1px solid #e2e8f0;">

                <div class="result-details" style="display: flex; gap: 15px; margin-top: 15px;">
                    <div class="result-item correct" style="flex: 1; background: #dcfce7; padding: 15px; border-radius: 8px; text-align: center;">
                        <span class="result-val" style="font-size: 22px; font-weight: bold; color: #16a34a; display: block;">${totalPoinFormat}</span> 
                        <span style="font-size: 13px; color: #15803d; font-weight: bold;">Total Jawaban Benar</span>
                    </div>
                    <div class="result-item wrong" style="flex: 1; background: #fee2e2; padding: 15px; border-radius: 8px; text-align: center;">
                        <span class="result-val" style="font-size: 22px; font-weight: bold; color: #dc2626; display: block;">${totalSalahFormat}</span> 
                        <span style="font-size: 13px; color: #b91c1c; font-weight: bold;">Total Salah / Kosong</span>
                    </div>
                </div>
                
                <button onclick="kembaliKeAwal()" style="margin-top: 25px; padding: 12px 20px; background: #0056b3; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; transition: background 0.3s;">
                    🏠 Kembali ke Halaman Awal
                </button>
            </div>
        `;
    }
    
    const controls = document.getElementById('controls');
    if (controls) controls.style.display = 'none';

    const questionNav = document.getElementById('questionNav');
    if (questionNav) questionNav.style.display = 'none';
    
    const timerBadge = document.getElementById('timerBadge');
    if (timerBadge) timerBadge.classList.add('hidden');
    
    sessionStorage.setItem('ujianSelesai', 'true');
    if (typeof bersihkanDataUjian === 'function') bersihkanDataUjian();

    if (typeof kirimKeSpreadsheet === 'function') kirimKeSpreadsheet(h);
}

function cobaKirimUlang() {
    const h = typeof hitungSkor === 'function' ? hitungSkor() : {};
    if (typeof kirimKeSpreadsheet === 'function') kirimKeSpreadsheet(h);
}

function kembaliKeAwal() {
    // 1. Matikan event auto-save browser agar tidak menyimpan data saat keluar halaman
    window.onbeforeunload = null;
    window.onpagehide = null;
    if (typeof simpanDataKeStorage === 'function') {
        window.removeEventListener('beforeunload', simpanDataKeStorage);
    }

    // 2. Kosongkan variabel array jawaban di memori browser
    if (typeof jawabanSiswa !== 'undefined') {
        if (Array.isArray(jawabanSiswa)) {
            jawabanSiswa.length = 0;
        } else {
            jawabanSiswa = {};
        }
    }
    if (typeof raguRagu !== 'undefined') {
        if (Array.isArray(raguRagu)) {
            raguRagu.length = 0;
        } else {
            raguRagu = {};
        }
    }

    // 3. Hapus total seluruh storage di browser
    try {
        localStorage.clear();
        sessionStorage.clear();
    } catch (e) {}

    // 4. Jalankan fungsi pembersih data jika tersedia
    if (typeof bersihkanDataUjian === 'function') {
        bersihkanDataUjian();
    }
    
    // 5. Paksa browser pindah total ke halaman awal tanpa memakai cache
    window.location.replace(window.location.origin + window.location.pathname);
}

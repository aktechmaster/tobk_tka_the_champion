// ==================================================
// 📝 RENDER SOAL, JAWABAN, NAVIGASI, & HASIL
// ==================================================

function renderInfoPeserta() {
    const data = ambilDataDariStorage() || {
        nama: document.getElementById('nama').value,
        kelas: document.getElementById('kelas').value,
        nomor: document.getElementById('nomor').value
    };

    document.getElementById('infoPesertaBox').innerHTML = `
        👤 <b>${data.nama}</b> (${data.nomor}) | 🏫 Kelas: ${data.kelas} | 🚨 Pelanggaran: <span id="violationCount" style="color:red; font-weight:bold;">${window.violationCount || 0}</span>
    `;
}

function tampilkanSoal(index) {
    if (!window.daftarSoal || index < 0 || index >= window.daftarSoal.length) return;
    
    currentIndex = index;
    const soal = window.daftarSoal[index];
    
    // Fallback pencocokan properti dari file soal
    const daftarOpsi = soal.opsi || soal.pilihan || [];
    const teksPertanyaan = soal.pertanyaan || soal.soal || soal.teks || '';
    const namaSubtes = soal.subtes || soal.kategori || 'Umum';

    let htmlOpsi = '';

    if (soal.tipe === 'PG') {
        htmlOpsi = '<div class="opsi-container">';
        daftarOpsi.forEach((opsi, idx) => {
            const hurufOpsi = String.fromCharCode(65 + idx);
            const isChecked = jawabanSiswa[currentIndex] === hurufOpsi ? 'checked' : '';
            htmlOpsi += `
                <label class="opsi-item">
                    <input type="radio" name="jawaban" value="${hurufOpsi}" ${isChecked} onchange="simpanJawabanPG('${hurufOpsi}')">
                    <b>${hurufOpsi}.</b> &nbsp; ${opsi}
                </label>
            `;
        });
        htmlOpsi += '</div>';
    } else if (soal.tipe === 'PGK') {
        const currentAnswers = Array.isArray(jawabanSiswa[currentIndex]) ? jawabanSiswa[currentIndex] : [];
        htmlOpsi = '<div class="opsi-container"><p><i>* Pilihan Jawaban Kompleks (Bisa pilih lebih dari satu):</i></p>';
        daftarOpsi.forEach((opsi, idx) => {
            const isChecked = currentAnswers.includes(idx) ? 'checked' : '';
            htmlOpsi += `
                <label class="opsi-item">
                    <input type="checkbox" name="jawaban_pgk" value="${idx}" ${isChecked} onchange="simpanJawabanPGK()">
                    <b>${String.fromCharCode(65 + idx)}.</b> &nbsp; ${opsi}
                </label>
            `;
        });
        htmlOpsi += '</div>';
    } else if (soal.tipe === 'BS') {
        const currentAnswers = Array.isArray(jawabanSiswa[currentIndex]) ? jawabanSiswa[currentIndex] : [];
        const daftarPernyataan = soal.pernyataan || [];
        htmlOpsi = `
            <table class="tabel-bs">
                <thead>
                    <tr>
                        <th>Pernyataan</th>
                        <th width="80">Benar</th>
                        <th width="80">Salah</th>
                    </tr>
                </thead>
                <tbody>
        `;
        daftarPernyataan.forEach((p, idx) => {
            const val = currentAnswers[idx] || '';
            htmlOpsi += `
                <tr>
                    <td>${p}</td>
                    <td><input type="radio" name="bs_${idx}" value="Benar" ${val === 'Benar' ? 'checked' : ''} onchange="simpanJawabanBS(${idx}, 'Benar')"></td>
                    <td><input type="radio" name="bs_${idx}" value="Salah" ${val === 'Salah' ? 'checked' : ''} onchange="simpanJawabanBS(${idx}, 'Salah')"></td>
                </tr>
            `;
        });
        htmlOpsi += '</tbody></table>';
    } else if (soal.tipe === 'INFO') {
        htmlOpsi = `<div style="background:#e0f2fe; padding:15px; border-radius:8px;">📌 <b>INFORMASI SUBTES:</b> ${teksPertanyaan}</div>`;
    }

    soalContainer.innerHTML = `
        <div class="soal-box">
            <h4>Soal No. ${soal.id} <span style="font-size:12px; font-weight:normal; color:#64748b;">[${namaSubtes}]</span></h4>
            <p style="margin: 15px 0;">${teksPertanyaan}</p>
            ${htmlOpsi}
        </div>
    `;

    raguBtn.checked = raguRagu[currentIndex] || false;
    updateNavButtons();
    updateGridNavStatus();
}

function simpanJawabanPG(val) {
    jawabanSiswa[currentIndex] = val;
    simpanDataKeStorage();
    updateGridNavStatus();
}

function simpanJawabanPGK() {
    const checkboxes = document.querySelectorAll('input[name="jawaban_pgk"]:checked');
    const selected = Array.from(checkboxes).map(cb => parseInt(cb.value));
    jawabanSiswa[currentIndex] = selected;
    simpanDataKeStorage();
    updateGridNavStatus();
}

function simpanJawabanBS(rowIdx, val) {
    if (!Array.isArray(jawabanSiswa[currentIndex])) {
        jawabanSiswa[currentIndex] = [];
    }
    jawabanSiswa[currentIndex][rowIdx] = val;
    simpanDataKeStorage();
    updateGridNavStatus();
}

function toggleRaguRagu() {
    raguRagu[currentIndex] = raguBtn.checked;
    simpanDataKeStorage();
    updateGridNavStatus();
}

function renderQuestionNav() {
    questionNav.innerHTML = '';
    window.daftarSoal.forEach((soal, idx) => {
        if (soal.tipe === 'INFO') return;
        const btn = document.createElement('button');
        btn.className = 'nav-btn';
        btn.id = `nav-btn-${idx}`;
        btn.textContent = soal.id;
        btn.onclick = () => tampilkanSoal(idx);
        questionNav.appendChild(btn);
    });
}

function updateNavButtons() {
    prevBtn.disabled = currentIndex === 0;
    
    if (currentIndex === window.daftarSoal.length - 1) {
        nextBtn.style.display = 'none';
        finishBtn.style.display = 'inline-block';
    } else {
        nextBtn.style.display = 'inline-block';
        finishBtn.style.display = 'none';
    }
}

function updateGridNavStatus() {
    window.daftarSoal.forEach((soal, idx) => {
        const btn = document.getElementById(`nav-btn-${idx}`);
        if (!btn) return;

        btn.classList.remove('answered', 'flagged', 'active');

        if (idx === currentIndex) btn.classList.add('active');

        const jwb = jawabanSiswa[idx];
        const hasAnswer = jwb !== undefined && jwb !== null && jwb !== '' && (Array.isArray(jwb) ? jwb.length > 0 : true);

        if (raguRagu[idx]) {
            btn.classList.add('flagged');
        } else if (hasAnswer) {
            btn.classList.add('answered');
        }
    });
}

function tampilkanHasil() {
    if (timerInterval) clearInterval(timerInterval);

    const h = hitungSkor();
    
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
                        ✅ ${h.indoBenar}/${h.indoTotalSoal} Soal
                    </div>
                </div>
                
                <!-- B. Inggris -->
                <div style="flex: 1; min-width: 110px; border-right: 1px solid #e2e8f0; padding: 0 5px;">
                    <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">B. Inggris</div>
                    <div style="font-size: 24px; font-weight: 900; color: #059669; margin: 5px 0;">
                        ${h.ingSkor} <span style="font-size: 11px; color: #94a3b8;">/ ${h.ingMaks}</span>
                    </div>
                    <div style="font-size: 11px; color: #16a34a; font-weight: bold;">
                        ✅ ${h.ingBenar}/${h.ingTotalSoal} Soal
                    </div>
                </div>

                <!-- Matematika -->
                <div style="flex: 1; min-width: 110px; padding: 0 5px;">
                    <div style="font-size: 12px; font-weight: bold; color: #64748b; text-transform: uppercase;">Matematika</div>
                    <div style="font-size: 24px; font-weight: 900; color: #d97706; margin: 5px 0;">
                        ${h.mtkSkor} <span style="font-size: 11px; color: #94a3b8;">/ ${h.mtkMaks}</span>
                    </div>
                    <div style="font-size: 11px; color: #16a34a; font-weight: bold;">
                        ✅ ${h.mtkBenar}/${h.mtkTotalSoal} Soal
                    </div>
                </div>
            </div>

            <hr style="margin: 20px 0; border: 1px solid #e2e8f0;">

            <div class="result-details">
                <div class="result-item correct">
                    <span class="result-val">${h.totalBenar}</span>
                    <span>Total Benar Keseluruhan</span>
                </div>
                <div class="result-item wrong">
                    <span class="result-val">${h.totalSoalValid - h.totalBenar}</span> 
                    <span>Total Salah Keseluruhan</span>
                </div>
            </div>
            
            <button onclick="kembaliKeAwal()" style="margin-top: 25px; padding: 12px 20px; background: #0056b3; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: bold; width: 100%; transition: background 0.3s;">
                🏠 Kembali ke Halaman Awal
            </button>
        </div>
    `;
    
    controls.style.display = 'none';
    questionNav.style.display = 'none';
    
    const timerBadge = document.getElementById('timerBadge');
    if (timerBadge) {
        timerBadge.classList.add('hidden');
    }
    
    sessionStorage.setItem('ujianSelesai', 'true');
    bersihkanDataUjian(); 

    kirimKeSpreadsheet(h);
}

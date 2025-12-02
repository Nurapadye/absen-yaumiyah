// --- 1. DATA MASTER & INISIALISASI ---

const PENGURUS_MASTER_INITIAL = [
    { id: 99, username: 'admin', nama: 'Pengurus Master', role: 'pengurus', password: 'admin456' }
];
let PENGURUS_MASTER = JSON.parse(localStorage.getItem('pengurusMaster')) || PENGURUS_MASTER_INITIAL;
let SANTRI_MASTER = JSON.parse(localStorage.getItem('santriMaster')) || [];

let KEGIATAN_MASTER = JSON.parse(localStorage.getItem('kegiatanMaster')) || [
    { id: 1, nama: "Subuh Jamaah", tipe: "ya/tidak" },
    { id: 2, nama: "Duhur Jamaah", tipe: "ya/tidak" },
    { id: 3, nama: "Ashar Jamaah", tipe: "ya/tidak" },
    { id: 4, nama: "Magrib Jamaah", tipe: "ya/tidak" },
    { id: 5, nama: "Isya Jamaah", tipe: "ya/tidak" },
    { id: 6, nama: "Almuk", tipe: "baca/tidak" },
    { id: 7, nama: "Alkahfi", tipe: "baca/tidak" },
    { id: 8, nama: "Al Waqiah", tipe: "baca/tidak" },
    { id: 9, nama: "Arrohmah", tipe: "baca/tidak" },
    { id: 10, nama: "Yasin", tipe: "baca/tidak" },
    { id: 11, nama: "Puasa Senin", tipe: "ya/tidak" },
    { id: 12, nama: "Puasa Kamis", tipe: "ya/tidak" },
    { id: 13, nama: "Sholat Dhuha", tipe: "ya/tidak" },
    { id: 14, nama: "Sholat Tahajud", tipe: "ya/tidak" }
];

let YAUMIYAH_DATA = JSON.parse(localStorage.getItem('yaumiyahDataMultiUser')) || {};

let currentUser = null; 
let currentTargetUser = null; 
let myChart = null; // Variabel global untuk Chart

// === PERBAIKAN WAKTU: Menggunakan Waktu Lokal HP (WIB/WITA/WIT) ===
const dateObj = new Date();
const year = dateObj.getFullYear();
const month = String(dateObj.getMonth() + 1).padStart(2, '0');
const day = String(dateObj.getDate()).padStart(2, '0');
const today = `${year}-${month}-${day}`; // Format YYYY-MM-DD Lokal

window.onload = () => {
    document.getElementById('datePicker').value = today;
    document.getElementById('monthPicker').value = today.substring(0, 7); 
    
    if (localStorage.getItem('isLoggedIn') === 'true' && localStorage.getItem('currentUserId')) {
        const id = parseInt(localStorage.getItem('currentUserId'));
        const role = localStorage.getItem('currentUserRole');
        
        let user;
        if (role === 'pengurus') {
           user = PENGURUS_MASTER.find(p => p.id === id);
        } else if (role === 'santri') {
           user = SANTRI_MASTER.find(s => s.id === id);
           if (user) user.role = 'santri';
        }

        if (user) {
           currentUser = user;
           document.getElementById('loginModal').style.display = 'none';
           handleLoginStatus();
           return;
        }
    }
    
    document.getElementById('loginModal').style.display = 'flex';
    document.getElementById('mainAppContainer').style.display = 'none';
}

// --- 2. FUNGSI UTAMA LOGIN & STATUS ---

function saveLoginSession() {
    if (currentUser) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUserId', currentUser.id);
        localStorage.setItem('currentUserRole', currentUser.role);
    }
}
function clearLoginSession() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUserId');
    localStorage.removeItem('currentUserRole');
}

function handleLoginStatus() {
    const isPengurus = currentUser && currentUser.role === 'pengurus';
    if (currentUser) {
        saveLoginSession();
        document.getElementById('loginModal').style.display = 'none';
        document.getElementById('mainAppContainer').style.display = 'flex';
        document.getElementById('currentUser').textContent = `Hai, ${currentUser.nama} (${currentUser.role.toUpperCase()})`;
        document.getElementById('logoutBtn').style.display = 'inline-block';
        document.getElementById('pengurusTools').style.display = isPengurus ? 'flex' : 'none';
        document.getElementById('santriSelectorDiv').style.display = isPengurus ? 'block' : 'none';

        if (isPengurus) {
            fillSantriSelectors();
            const selectedId = document.getElementById('santriSelector').value;
            if(selectedId) {
                const santriData = SANTRI_MASTER.find(s => s.id == selectedId);
                currentTargetUser = { ...santriData, role: 'santri' };
            } else if (SANTRI_MASTER.length > 0) {
                const santriData = SANTRI_MASTER[0];
                document.getElementById('santriSelector').value = santriData.id;
                currentTargetUser = { ...santriData, role: 'santri' };
            } else { currentTargetUser = null; }
        } else {
            currentTargetUser = currentUser;
        }
        loadYaumiyah();
    } else {
        clearLoginSession();
        document.getElementById('loginModal').style.display = 'flex'; 
        document.getElementById('mainAppContainer').style.display = 'none'; 
    }
}

function handleLoginAttempt() {
    const username = document.getElementById('usernameInput').value;
    const password = document.getElementById('passwordInput').value; 
    
    // Cek Pengurus
    let user = PENGURUS_MASTER.find(p => p.username === username && p.password === password);
    if (user) {
        currentUser = { ...user, role: 'pengurus' };
    } else {
        // Cek Santri
        user = SANTRI_MASTER.find(s => s.username === username && s.password === password);
        if (user) {
            currentUser = { ...user, role: 'santri' }; 
        } else {
            alert('Username atau Password salah.'); return;
        }
    }
    
    closeModal('loginModal');
    document.getElementById('usernameInput').value = '';
    document.getElementById('passwordInput').value = '';
    handleLoginStatus();
}

function logout() {
    if (confirm('Yakin ingin keluar?')) {
        currentUser = null; currentTargetUser = null;
        handleLoginStatus(); alert('Logout berhasil.');
    }
}
function closeModal(modalId) { document.getElementById(modalId).style.display = "none"; }

// --- 3. MANAJEMEN YAUMIYAH (DENGAN PEMBATASAN TANGGAL) ---

function getCurrentTargetUserData() {
    const userID = currentTargetUser ? currentTargetUser.id : null;
    return userID ? (YAUMIYAH_DATA[userID] || {}) : {};
}
function saveCurrentUserData(data) {
    const userID = currentTargetUser.id; 
    YAUMIYAH_DATA[userID] = data;
    localStorage.setItem('yaumiyahDataMultiUser', JSON.stringify(YAUMIYAH_DATA));
}

function loadYaumiyah() {
    if (!currentUser) return;
    const isPengurus = currentUser.role === 'pengurus';
    
    if (isPengurus) {
        const selectedSantriId = document.getElementById('santriSelector').value;
        if (selectedSantriId) {
            const santriData = SANTRI_MASTER.find(s => s.id == selectedSantriId);
            currentTargetUser = { ...santriData, role: 'santri' };
        } else { currentTargetUser = null; }
    }

    const tableContainer = document.getElementById('yaumiyahTableContainer');
    if (!currentTargetUser) {
        tableContainer.innerHTML = `<p style="text-align:center;">Pilih Santri terlebih dahulu.</p>`; return;
    }

    const selectedDate = document.getElementById('datePicker').value;
    const userData = getCurrentTargetUserData();
    const dataHariIni = userData[selectedDate] || {};
    
    // === LOGIKA PEMBATASAN EDIT SANTRI ===
    let isReadOnly = false;
    let warningMsg = "";

    if (!isPengurus) {
        // Santri hanya boleh edit HARI INI
        if (selectedDate !== today) {
            isReadOnly = true;
            if (selectedDate < today) {
                warningMsg = `<p style="color:var(--tidak-color);text-align:center;font-size:0.9em;">Data hari lalu tidak dapat diubah oleh Santri.</p>`;
            } else {
                warningMsg = `<p style="color:var(--tidak-color);text-align:center;font-size:0.9em;">Belum bisa mengisi untuk hari esok.</p>`;
            }
        }
    } else {
        if (selectedDate > today) warningMsg = `<p style="color:#ff9800;text-align:center;font-size:0.9em;">Anda melihat tanggal masa depan.</p>`;
    }
    
    let html = `
        <h4 style="text-align:center;">Yaumiyah ${currentTargetUser.nama} (${selectedDate})</h4>
        ${warningMsg}
        <table id="yaumiyahTable">
            <thead>
                <tr>
                    <th>Kegiatan</th> <th>Status</th> <th>${isReadOnly ? 'Catatan' : 'Aksi'}</th>
                </tr>
            </thead>
            <tbody>
    `;

    KEGIATAN_MASTER.forEach(kegiatan => {
        const status = dataHariIni[kegiatan.id] || 'belum';
        const [opt1, opt2] = kegiatan.tipe.split('/');
        const class1 = (opt1 === 'ya' || opt1 === 'baca') ? 'btn-ya' : '';
        const class2 = (opt2 === 'tidak') ? 'btn-tidak' : '';
        
        let actionHtml;
        if (isReadOnly) {
            actionHtml = `<span class="${status === opt1 ? 'persentase-ok' : (status === opt2 ? 'persentase-kurang' : '')}">${getStatusText(status, kegiatan.tipe)}</span>`;
        } else {
            actionHtml = `
                <div>
                    <button class="action-button ${class1}" style="padding:5px 10px;font-size:14px;" onclick="updateYaumiyah(${kegiatan.id}, '${opt1}')">${opt1.toUpperCase()}</button>
                    <button class="action-button ${class2}" style="padding:5px 10px;font-size:14px;" onclick="updateYaumiyah(${kegiatan.id}, '${opt2}')">${opt2.toUpperCase()}</button>
                </div>
            `;
        }

        html += `
            <tr>
                <td>${kegiatan.nama}</td>
                <td style="font-weight:600;" class="${status === opt1 ? 'persentase-ok' : (status === opt2 ? 'persentase-kurang' : '')}">${getStatusText(status, kegiatan.tipe)}</td>
                <td>${actionHtml}</td>
            </tr>
        `;
    });
    html += `</tbody></table>`;
    tableContainer.innerHTML = html;
}

function updateYaumiyah(kegiatanId, status) {
    const selectedDate = document.getElementById('datePicker').value;
    
    // Keamanan Double Check: Santri hanya bisa isi hari ini
    if (currentUser.role === 'santri' && selectedDate !== today) {
        alert("Maaf, Santri hanya bisa mengisi yaumiyah untuk HARI INI.");
        return;
    }

    if (currentUser.role !== 'santri' && currentUser.id !== currentTargetUser.id && currentUser.role !== 'pengurus') return; 
    const userData = getCurrentTargetUserData(); 
    if (!userData[selectedDate]) userData[selectedDate] = {};
    userData[selectedDate][kegiatanId] = status;
    saveCurrentUserData(userData);
    loadYaumiyah();
}
function getStatusText(status, tipe) {
    if (status === tipe.split('/')[0]) return tipe.split('/')[0].toUpperCase();
    else if (status === tipe.split('/')[1]) return tipe.split('/')[1].toUpperCase();
    return 'BELUM DIISI';
}

// --- 4-6. MANAJEMEN AKUN & KEGIATAN (Simplified) ---
function getNextSantriId() { return (SANTRI_MASTER.reduce((max, s) => s.id > max ? s.id : max, 0)) + 1; }
function saveSantriMaster() { localStorage.setItem('santriMaster', JSON.stringify(SANTRI_MASTER)); }
function showManageAccountModal() { if (currentUser.role !== 'pengurus') return; renderSantriAccountList(); document.getElementById('manageAccountModal').style.display = "block"; }
function addSantri() {
    const nama = document.getElementById('newSantriNama').value.trim();
    const user = document.getElementById('newSantriUsername').value.trim().toLowerCase();
    const pass = document.getElementById('newSantriPassword').value.trim();
    if (!nama || !user || !pass) return alert('Isi semua kolom.');
    if (SANTRI_MASTER.some(s => s.username === user)) return alert('Username sudah ada.');
    SANTRI_MASTER.push({ id: getNextSantriId(), nama: nama, username: user, password: pass });
    saveSantriMaster(); renderSantriAccountList(); fillSantriSelectors(); alert('Santri ditambahkan.');
}
function renderSantriAccountList() {
    const listDiv = document.getElementById('santriAccountList');
    let html = `<table style="font-size:0.9em;"><thead><tr><th>Nama</th><th>User</th><th>Pass</th><th>Aksi</th></tr></thead><tbody>`;
    SANTRI_MASTER.forEach(s => html += `<tr><td>${s.nama}</td><td>${s.username}</td><td>${s.password}</td><td><button class="action-button btn-tidak" onclick="deleteSantri(${s.id})">Hapus</button></td></tr>`);
    listDiv.innerHTML = html + `</tbody></table>`;
}
function deleteSantri(id) { if(confirm('Hapus santri ini?')) { SANTRI_MASTER = SANTRI_MASTER.filter(s=>s.id!==id); saveSantriMaster(); delete YAUMIYAH_DATA[id]; localStorage.setItem('yaumiyahDataMultiUser', JSON.stringify(YAUMIYAH_DATA)); renderSantriAccountList(); fillSantriSelectors(); loadYaumiyah(); } }
function fillSantriSelectors() {
    [document.getElementById('santriSelector'), document.getElementById('reportSantriSelector')].forEach(sel => {
        const val = sel.value; sel.innerHTML = '<option value="">-- Pilih Santri --</option>';
        SANTRI_MASTER.forEach(s => { const opt = document.createElement('option'); opt.value = s.id; opt.textContent = s.nama; sel.appendChild(opt); });
        if(SANTRI_MASTER.some(s=>s.id==val)) sel.value=val;
    });
}
function getNextPengurusId() { const max = PENGURUS_MASTER.reduce((m,p)=>p.id>m?p.id:m,0); return max<100?100:max+1; }
function savePengurusMaster() { localStorage.setItem('pengurusMaster', JSON.stringify(PENGURUS_MASTER)); }
function showManagePengurusModal() { if (currentUser.role !== 'pengurus') return; renderPengurusAccountList(); document.getElementById('managePengurusModal').style.display = "block"; }
function addPengurus() {
    const n = document.getElementById('newPengurusNama').value, u = document.getElementById('newPengurusUsername').value, p = document.getElementById('newPengurusPassword').value;
    if(!n||!u||!p) return alert("Isi lengkap"); if(PENGURUS_MASTER.some(pu=>pu.username===u)) return alert("User ada");
    PENGURUS_MASTER.push({id:getNextPengurusId(), nama:n, username:u, password:p, role:'pengurus'}); savePengurusMaster(); renderPengurusAccountList(); alert("Sukses");
}
function renderPengurusAccountList() {
    const d = document.getElementById('pengurusAccountList');
    let h = `<table><thead><tr><th>Nama</th><th>Aksi</th></tr></thead><tbody>`;
    PENGURUS_MASTER.forEach(p=>h+=`<tr><td>${p.nama}</td><td>${p.id===currentUser.id?'Self':'<button class="btn-tidak" onclick="alert(\'Fitur hapus ada di kode full\')">Hapus</button>'}</td></tr>`);
    d.innerHTML=h+`</tbody></table>`;
}
function showManageKegiatanModal(){ if(currentUser.role!=='pengurus')return; renderKegiatanList(); document.getElementById('manageKegiatanModal').style.display='block'; }
function renderKegiatanList(){
    const l=document.getElementById('kegiatanList'); l.innerHTML='';
    KEGIATAN_MASTER.forEach(k=>{ const li=document.createElement('li'); li.innerHTML=`${k.nama} <button style="float:right;color:red;" onclick="alert('Fitur hapus ada di kode full')">x</button>`; l.appendChild(li); });
}
function addKegiatan(){
    const n=document.getElementById('newKegiatanNama').value, t=document.getElementById('newKegiatanType').value;
    if(n){ KEGIATAN_MASTER.push({id:Date.now(), nama:n, tipe:t}); localStorage.setItem('kegiatanMaster',JSON.stringify(KEGIATAN_MASTER)); renderKegiatanList(); }
}

// --- 7. REKAP BULANAN & CHART GRAFIK BATANG ---

function showMonthlyReportModal() {
    if (currentUser.role !== 'pengurus') return;
    document.getElementById('monthlyReportModal').style.display = "block";
    if (myChart) myChart.destroy(); // Reset chart
    showMonthlyReport(); 
}

function showMonthlyReport() {
    if (currentUser.role !== 'pengurus') return;
    const monthYear = document.getElementById('monthPicker').value; 
    const targetSantriId = document.getElementById('reportSantriSelector').value; 
    const reportContentDiv = document.getElementById('monthlyReportContent');
    
    if (!targetSantriId || !monthYear) { reportContentDiv.innerHTML = `<p style="text-align:center;">Pilih Santri dan Bulan.</p>`; return; }

    const targetSantri = SANTRI_MASTER.find(s => s.id == targetSantriId);
    const [year, month] = monthYear.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    
    let chartLabels = [];
    let chartData = [];
    let reportData = { nama: targetSantri.nama, kegiatanRekap: KEGIATAN_MASTER.map(k => ({ id: k.id, nama: k.nama, tipe: k.tipe, hadirCount: 0 })) };
    const userData = YAUMIYAH_DATA[targetSantri.id] || {};

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dailyData = userData[dateStr];
        if (dailyData) {
            reportData.kegiatanRekap.forEach(kegiatan => {
                const status = dailyData[kegiatan.id];
                if (status === kegiatan.tipe.split('/')[0]) kegiatan.hadirCount++;
            });
        }
    }

    let html = `<h4>Rekap **${reportData.nama}** Bulan ${monthYear}</h4>
        <table id="monthlyReportTable"><thead><tr><th>Kegiatan</th><th>Hadir</th><th>%</th></tr></thead><tbody>`;

    reportData.kegiatanRekap.forEach(k => {
        const percentage = daysInMonth > 0 ? (k.hadirCount / daysInMonth * 100).toFixed(1) : 0;
        const className = percentage >= 80 ? 'persentase-ok' : 'persentase-kurang';
        chartLabels.push(k.nama); chartData.push(k.hadirCount);
        html += `<tr><td>${k.nama}</td><td>${k.hadirCount}</td><td class="${className}">${percentage}%</td></tr>`;
    });
    html += `</tbody></table>`; reportContentDiv.innerHTML = html;
    
    renderChart(chartLabels, chartData, daysInMonth);
}

function renderChart(labels, data, maxDays) {
    const ctx = document.getElementById('attendanceChart').getContext('2d');
    if (myChart) myChart.destroy();
    myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Jumlah Kehadiran (Hari)',
                data: data,
                backgroundColor: 'rgba(25, 118, 210, 0.6)',
                borderColor: 'rgba(25, 118, 210, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true, maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: maxDays },
                x: { ticks: { autoSkip: false, maxRotation: 90, minRotation: 45 } }
            }
        }
    });
}

// --- 8. PDF ---
function unduhLaporanPDF() {
    const table = document.getElementById('yaumiyahTable'); 
    if (!table || !currentTargetUser) return alert("Data belum siap");
    const tempTable = table.cloneNode(true);
    tempTable.querySelectorAll('th:last-child, td:last-child').forEach(el => el.remove());
    tempTable.querySelectorAll('td').forEach(td => { td.style.border='1px solid #ddd'; td.style.padding='8px'; });
    const { jsPDF } = window.jspdf; const pdf = new jsPDF('p','mm','a4');
    const div = document.createElement('div'); div.style.cssText='position:absolute;left:-9999px;width:700px;'; div.appendChild(tempTable); document.body.appendChild(div);
    html2canvas(tempTable, {scale:2}).then(c=>{
        pdf.text(`Laporan: ${currentTargetUser.nama} (${document.getElementById('datePicker').value})`,10,10);
        pdf.addImage(c.toDataURL('image/png'),'PNG',10,20,190,0); pdf.save('laporan.pdf'); document.body.removeChild(div);
    });
}
function unduhLaporanBulananPDF() {
    const table = document.getElementById('monthlyReportTable'); if(!table)return;
    const { jsPDF } = window.jspdf; const pdf = new jsPDF('p','mm','a4');
    html2canvas(table, {scale:2}).then(c=>{
        pdf.text('Rekap Bulanan',10,10); pdf.addImage(c.toDataURL('image/png'),'PNG',10,20,190,0); pdf.save('rekap_bulanan.pdf');
    });
}
// Helper untuk mengambil elemen dan alamat folder gambar.
const $ = id => document.getElementById(id), path = './gambar/';

// Data item: nama gambar, tipe data, lalu teks alt.
const sampah = [
    ['APEL.png', 'organik', 'Apel'], ['DAUN.png', 'organik', 'Daun'],
    ['IKAN.png', 'organik', 'Ikan'], ['PISANG.png', 'organik', 'Pisang'],
    ['SAMPAH.png', 'anorganik', 'Sampah'], ['WORTEL.png', 'organik', 'Wortel']
];

// e adalah alias helper DOM; referensi elemen dikumpulkan di bawah ini.
const e = id => $(id), money = e('money-counter'), trash = e('trash-zone'), area = trash;
// Referensi kecoa, layar awal, dan indikator ronde.
const roach = e('roach'), start = e('start-screen'), round = e('round-counter');
// Referensi sapu.
const broom = e('broom');
// Referensi indikator match, HP, health bar, dan damage.
const match = e('match-counter'), hpText = e('roach-hp'), hpBar = e('health-bar'), damageText = e('damage-value');
// Referensi container HP kecoa.
const roachHud = e('roach-hud'), healthTrack = e('health-track');
// Referensi modal dan kontrol upgrade.
const costText = e('upgrade-cost'), shop = e('shop-modal'), settings = e('settings-modal');
const upgrade = e('upgrade-btn'), sound = e('sound-toggle');
// Papan utama untuk menampung hadiah.
const game = document.querySelector('.game-container');

// Format angka uang ke Rupiah.
const rupiah = nilai => `Rp ${nilai.toLocaleString('id-ID')}`;

// State yang berubah selama game berjalan.
let uang = 0, ronde = 1, nomorMatch = 0, spawnMatch = 1 + Math.floor(Math.random() * 4), damage = 15, biaya = 5000, hp = 0, maxHp = 0;
let index = 0, pilihan, hidup = false, mulai = false, sudahMuncul = false;
// Posisi kecoa dan target geraknya.
let pos = { x: 20, y: 40 }, arah = { x: 1.2, y: .9 }, target = { x: 80, y: 70 };

    // Sinkronkan state dengan HUD.
function hud() {
    money.textContent = rupiah(uang);
    round.textContent = ronde;
    match.textContent = nomorMatch;
    damageText.textContent = damage; costText.textContent = rupiah(biaya);
    hpText.textContent = `${Math.max(0, hp)} / ${maxHp}`;
    hpBar.style.width = `${maxHp ? hp / maxHp * 100 : 0}%`;
}
// Render item sesuai index saat ini.
function tampilkanSampah() {
    const [gambar, tipe, nama] = sampah[index];
    trash.querySelector('.trash-item')?.remove();
    trash.insertAdjacentHTML('afterbegin', `<button class="trash-item" data-type="${tipe}" type="button"><img src="${path}${gambar}" alt="${nama}"></button>`);
    pilihan = trash.firstElementChild;
    pilihan.onclick = () => pilihan.classList.toggle('selected');
}
// Siapkan kecoa dan tampilkan status HP-nya.
function kecoaBaru() {
    maxHp = hp = 100 + (ronde - 1) * 20;
    hidup = true;
    sudahMuncul = true;
    pos = { x: 20 + Math.random() * Math.max(20, area.clientWidth - 80), y: 38 + Math.random() * Math.max(20, area.clientHeight - 100) };
    target = { x: 20 + Math.random() * Math.max(20, area.clientWidth - 80), y: 38 + Math.random() * Math.max(20, area.clientHeight - 100) };
    roach.classList.remove('defeated'); roach.style.display = 'block';
    roachHud.style.display = 'flex'; healthTrack.style.display = 'block';
    if (pilihan) pilihan.style.display = 'none';
    hud();
}
// Loop gerakan kecoa.
function gerak() {
    if (hidup) {
        const x = Math.max(0, area.clientWidth - roach.offsetWidth), y = Math.max(38, area.clientHeight - roach.offsetHeight);
        const dx = target.x - pos.x, dy = target.y - pos.y, jarak = Math.hypot(dx, dy);
        if (jarak < 4) target = { x: Math.random() * x, y: 38 + Math.random() * Math.max(1, y - 38) };
        else { pos.x += dx / jarak * 1.1; pos.y += dy / jarak * 1.1; }
        pos.x = Math.max(0, Math.min(pos.x, x)); pos.y = Math.max(38, Math.min(pos.y, y));
        roach.style.transform = `translate(${pos.x}px,${pos.y}px)`;
    }
    requestAnimationFrame(gerak);
}
// Kurangi HP setelah collision sapu.
function pukul() {
    if (!mulai || !hidup) return;
    hp -= damage; hud();
    roach.classList.remove('hit'); void roach.offsetWidth; roach.classList.add('hit');
    if (hp > 0) return;
    hidup = false; roach.classList.add('defeated'); roach.style.display = 'none';
    roachHud.style.display = 'none'; healthTrack.style.display = 'none';
    uang += 5000 + ronde * 1000; jatuhkanUang();
    if (pilihan) pilihan.style.display = 'flex';
    hud();
}
// Cocokkan tipe item dengan tipe tong.
function buang(bin) {
    if (!pilihan || hidup) return;
    nomorMatch++;
    if (pilihan.dataset.type !== bin.dataset.type) {
        index = ++index % sampah.length;
        tampilkanSampah();
    } else {
        uang += 1000; index = ++index % sampah.length; hud(); tampilkanSampah();
        if (Math.random() < .5) jatuhkanUang();
    }
    if (!sudahMuncul && nomorMatch === spawnMatch) kecoaBaru();
    if (nomorMatch >= 5) {
        ronde++; nomorMatch = 0; spawnMatch = 1 + Math.floor(Math.random() * 4);
        sudahMuncul = false; hidup = false; roach.style.display = 'none';
        roachHud.style.display = 'none'; healthTrack.style.display = 'none';
    }
    hud();
}
// Buat hadiah, animasikan jatuhnya, dan pasang klik.
function jatuhkanUang() {
    const coin = document.createElement('button'), nilai = Math.random() < .5 ? 500 : 2000;
    coin.className = 'loot'; coin.type = 'button';
    coin.innerHTML = `<img src="${path}${nilai === 500 ? 'KOIN NOMINAL 500.png' : 'UANG NOMINAL 2.000.png'}" alt="${nilai} uang">`;
    coin.style.left = `${10 + Math.random() * 75}%`; game.appendChild(coin);
    let y = 0, speed = 1;
    const jatuh = () => { y += speed; speed += .25; coin.style.top = `${y}px`; if (y < game.clientHeight - 70) requestAnimationFrame(jatuh); };
    coin.onclick = () => { uang += nilai; hud(); coin.remove(); };
    jatuh(); setTimeout(() => coin.remove(), 7000);
}
// Tutup modal berdasarkan id.
function tutup(id) { $(id).classList.add('hide'); }

// Handler tombol Play.
function mulaiGame() { mulai = true; start.classList.add('hide'); tampilkanSampah(); roach.style.display = 'none'; broom.style.display = 'block'; }

// Reset state dan tampilan.
function resetGame() {
    uang = 0; ronde = 1; nomorMatch = 0; spawnMatch = 1 + Math.floor(Math.random() * 4);
    damage = 15; biaya = 5000; mulai = hidup = sudahMuncul = false;
    document.querySelectorAll('.loot').forEach(coin => coin.remove());
    tutup('settings-modal'); start.classList.remove('hide'); roach.style.display = 'none'; broom.style.display = 'none';
    roachHud.style.display = 'none'; healthTrack.style.display = 'none'; hud();
}
// Teruskan tong yang diklik ke buang().
document.querySelectorAll('.trash-bin').forEach(bin => bin.onclick = () => buang(bin));

// Event tombol menu.
e('play-btn').onclick = mulaiGame;
e('shop-btn').onclick = () => shop.classList.remove('hide');
e('settings-btn').onclick = () => settings.classList.remove('hide');
// Upgrade hanya diproses jika saldo cukup.
upgrade.onclick = () => {
    if (uang < biaya) return alert('Koin belum cukup.');
    uang -= biaya; damage += 15; biaya += 5000; hud();
};
// Toggle class CSS berdasarkan checkbox.
e('reset-btn').onclick = resetGame;
sound.onchange = () => document.body.classList.toggle('sound-off', !sound.checked);
// data-close menentukan modal yang ditutup.
document.querySelectorAll('[data-close]').forEach(btn => btn.onclick = () => tutup(btn.dataset.close));
// Status drag dan pencegah hit ganda.
let menekan = false, mengambilSapu = false, sudahMenyentuh = false;

// Cek tabrakan kotak sapu dan kecoa.
function cekKena() {
    if (!menekan || !hidup) return;
    const sapuBox = broom.getBoundingClientRect(), kecoaBox = roach.getBoundingClientRect();
    const menyentuh = sapuBox.right > kecoaBox.left && sapuBox.left < kecoaBox.right && sapuBox.bottom > kecoaBox.top && sapuBox.top < kecoaBox.bottom;
    if (menyentuh && !sudahMenyentuh) { sudahMenyentuh = true; pukul(); }
    if (!menyentuh) sudahMenyentuh = false;
}
// Mulai drag saat sapu ditekan.
broom.onmousedown = event => { event.preventDefault(); menekan = true; mengambilSapu = true; broom.classList.add('dragging'); };
window.onmousemove = event => {
    if (!mengambilSapu) return;
    // Ubah koordinat mouse menjadi posisi relatif papan.
    const box = area.getBoundingClientRect();
    broom.style.left = `${event.clientX - box.left - broom.offsetWidth / 2}px`;
    broom.style.top = `${event.clientY - box.top - broom.offsetHeight / 2}px`;
    // Cek tabrakan setelah sapu dipindahkan.
    cekKena();
};
// Lepas drag dan kembalikan posisi sapu dari CSS.
window.onmouseup = () => {
    menekan = mengambilSapu = sudahMenyentuh = false;
    broom.classList.remove('dragging');
    broom.style.removeProperty('left'); broom.style.removeProperty('top');
};
// Inisialisasi tampilan dan loop gerak.
hud(); tampilkanSampah(); gerak();

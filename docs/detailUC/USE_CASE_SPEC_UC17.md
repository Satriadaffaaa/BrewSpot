# 📄 Spesifikasi Detail Use Case: UC-17
## Analitik Kunjungan Bisnis

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-17 |
| **Nama Use Case** | Analitik Kunjungan Bisnis |
| **Aktor Utama** | Business Owner |
| **Deskripsi** | Business Owner melihat grafik analitik pengunjung atas spot bisnis miliknya, mencakup jumlah tayangan profil (Views Count) dan jumlah check-in (Check-in Count). |
| **Prioritas** | Medium (Should Have) |

---

### 1. Conditions
- **Pre-conditions**: 
    - Pengguna masuk dengan peran terverifikasi sebagai Business Owner atas spot terkait.
    - Sistem memiliki data log penayangan spot (`views`) dan sejarah check-in (`check-ins`) di database.
- **Post-conditions**:
    - Grafik analitik interaktif terrender dengan benar menampilkan tren kunjungan dalam periode waktu yang dipilih.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** masuk ke halaman Dashboard Bisnis.
2. **Aktor** memilih menu "Analytics" untuk spot bisnis tertentu yang dikelolanya.
3. **Sistem** menyajikan filter periode waktu (7 Hari Terakhir, 30 Hari Terakhir, Bulanan).
4. **Aktor** memilih salah satu opsi filter periode (misal: "30 Hari Terakhir").
5. **Sistem** melakukan query ke koleksi log `analytics_views` dan `check_ins` yang terasosiasi dengan `spotId` tersebut sesuai rentang tanggal terpilih.
6. **Sistem** memproses agregasi data (menghitung total views dan total check-in per hari/minggu).
7. **Sistem** merender grafik garis (Line Chart) untuk tren tayangan profil (Views) dan grafik batang (Bar Chart) untuk jumlah kedatangan fisik (Check-ins).
8. **Sistem** menyajikan kartu ringkasan berisi info penting: "Total Pengunjung", "Persentase Kenaikan Mingguan", dan "Rata-rata Check-in Harian".

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Owner as Business Owner
    participant Dash as Business Dashboard UI
    participant API as System (API/Firestore)

    Owner->>Dash: Buka menu "Analytics"
    Dash->>API: Validasi status owner & request log kunjungan (Spot ID, Range)
    API->>API: Verifikasi kepemilikan spot
    API->>API: Tarik data log views & check-ins dari Firestore
    API->>API: Agregasikan data berdasarkan rentang waktu
    API-->>Dash: Return data agregasi analitik
    Dash->>Dash: Render Chart komponen (Line/Bar)
    Dash-->>Owner: Tampilkan statistik interaktif & visualisasi grafik
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Ekspor Laporan Analitik**
    1. Business Owner menekan tombol "Export Report" di dashboard.
    2. Sistem mengekspor data statistik kunjungan ke file format CSV atau PDF.
    3. Sistem memicu pengunduhan berkas ke perangkat pengguna.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Data Analitik Masih Kosong (New Spot)**
    1. Spot baru saja disetujui/diklaim dan belum memiliki catatan aktivitas views/check-in.
    2. Sistem mendeteksi ketiadaan data di database.
    3. Sistem menampilkan placeholder grafik kosong dengan pesan: "Belum ada data aktivitas terkumpul. Promosikan spot Anda agar dikunjungi dan diulas pengguna!"
- **E2: Akses Ditolak (Unauthorized Analytics Request)**
    1. Pengguna mencoba menembak URL analytics spot milik orang lain.
    2. Sistem mengembalikan status 403 Forbidden dan memblokir render halaman.

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-40**: Data penayangan spot (`viewsCount`) dicatat setiap kali detail spot dibuka oleh Visitor/Member yang berbeda (menggunakan sistem session cookie 1 hari untuk mencegah manipulasi penambahan views yang tidak valid oleh satu pengguna yang sama).
- **BR-41**: Setiap transaksi check-in sukses (UC-06) langsung tersinkronisasi sebagai baris data analitik di koleksi riwayat check-in.

---

### 6. Catatan UI/UX
- Grafik dibuat interaktif menggunakan pustaka visualisasi modern (misal: Recharts/Chart.js) yang responsif terhadap hover kursor untuk menampilkan tooltip nilai detail.
- Menggunakan palet warna yang harmonis dan profesional (misal: biru kehijauan/teal untuk Views, dan ungu/indigo untuk Check-ins).
- Ringkasan statistik (cards) diletakkan di bagian atas halaman sebelum grafik utama untuk mempermudah pemindaian cepat (scannability).

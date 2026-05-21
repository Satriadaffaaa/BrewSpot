# 📄 Spesifikasi Detail Use Case: UC-20
## Dashboard Analitik Pertumbuhan Platform

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-20 |
| **Nama Use Case** | Dashboard Analitik Pertumbuhan Platform |
| **Aktor Utama** | Admin |
| **Deskripsi** | Admin memantau pertumbuhan ekosistem platform Lokali secara keseluruhan melalui visualisasi metrik data registrasi, ulasan baru, spot aktif, dan heatmap penyebaran geografis. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Admin telah terautentikasi (login).
    - Database Firestore memiliki koleksi snapshot harian (`analytics_snapshots`) yang terisi data historis.
- **Post-conditions**:
    - Dashboard menyajikan visualisasi data grafik pertumbuhan secara lengkap dan interaktif.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** menavigasi ke menu "Growth Analytics" pada Dashboard Admin.
2. **Sistem** melakukan query data historis agregasi dari koleksi `analytics_snapshots`.
3. **Sistem** mengambil data jumlah total pengguna baru terdaftar, total review diposting, dan spot disetujui dalam kurun waktu yang dipilih (misal: 30 hari terakhir atau 12 bulan terakhir).
4. **Sistem** mengambil data koordinat seluruh spot aktif untuk merender visual peta kerapatan.
5. **Sistem** merender antarmuka dashboard pertumbuhan:
    - Grafik Garis (Line Chart): Pertumbuhan Registrasi User Baru harian.
    - Grafik Batang (Bar Chart): Volume Posting Review bulanan.
    - Peta Kerapatan (Heatmap): Distribusi Geografis spot aktif dan aktivitas check-in di peta.
    - Grafik Lingkaran (Pie Chart): Persentase sebaran level gamifikasi pengguna (misal: Level 1-5, 6-10, dst).
6. **Aktor** dapat memfilter data berdasarkan kota spesifik atau rentang tanggal kustom.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Admin as Admin
    participant Dash as Growth Dashboard UI
    participant API as System (API/Firestore)
    participant Map as Heatmap Layer

    Admin->>Dash: Masuk menu "Growth Analytics"
    Dash->>API: Request data snapshot historis & koordinat spot aktif
    API->>API: Ambil data dari koleksi analytics_snapshots
    API->>API: Ambil koordinat spot approved
    API-->>Dash: Return kumpulan data agregasi & koordinat
    Dash->>Dash: Render Chart Pertumbuhan (Line/Bar/Pie)
    Dash->>Map: Plot data koordinat ke Mapbox Heatmap
    Map-->>Dash: Render Heatmap visual
    Dash-->>Admin: Tampilkan Dashboard Analitik Pertumbuhan Lengkap
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Gagal Memuat Data Agregasi**
    1. Sistem gagal memuat file snapshot karena database sedang sibuk atau data rusak.
    2. Dashboard menampilkan error modal: "Gagal memuat data pertumbuhan. Silakan segarkan halaman."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-46**: Data historis pertumbuhan disarikan dari snapshot harian (UC-22) yang dijalankan otomatis setiap tengah malam untuk menghindari overhead query langsung ke seluruh dokumen Firestore secara berulang-ulang yang dapat memakan biaya tinggi.
- **BR-47**: Grafik heatmap diperbarui real-time hanya berdasarkan spot-spot yang memiliki status `approved`.

---

### 6. Catatan UI/UX
- Menggunakan skema warna dashboard profesional gelap (dark mode dashboard) dengan kontras yang baik.
- Panel analitik bersifat modular (bisa digeser/diatur posisinya oleh admin jika didukung).
- Heatmap peta menggunakan degradasi warna dari hijau (kerapatan rendah) ke merah membara (kerapatan tinggi) dengan kontrol zoom peta yang mulus.

# 📄 Spesifikasi Detail Use Case: UC-22
## Snapshot Statistik Harian

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-22 |
| **Nama Use Case** | Snapshot Statistik Harian |
| **Aktor Utama** | Sistem (Automated Scheduler) |
| **Deskripsi** | Sistem secara otomatis mengagregasi data statistik platform (total user, spot, review, check-in) setiap hari pukul 00:00 UTC untuk keperluan laporan analitik jangka panjang. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Server scheduler (Firebase Cloud Functions / Cron Job) berjalan aktif.
    - Waktu sistem mencapai pergantian hari pukul 00:00 UTC.
- **Post-conditions**:
    - Dokumen baru berisi data snapshot statistik tersimpan di koleksi `analytics_snapshots` di Firestore.
    - Log-log lama (seperti pencarian > 90 hari) dibersihkan untuk efisiensi basis data.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Sistem (Cron Trigger)** mendeteksi waktu telah menunjukkan pukul 00:00 UTC.
2. **Sistem** menjalankan fungsi background script `runDailyDataAggregation`.
3. **Sistem** menghitung total dokumen aktif di Firestore:
    - Menghitung jumlah seluruh akun pengguna di koleksi `users`.
    - Menghitung jumlah spot yang disetujui di koleksi `spots` dengan filter `status == 'approved'`.
    - Menghitung jumlah review di koleksi `reviews`.
4. **Sistem** menghitung penambahan entitas (growth delta) dalam 24 jam terakhir (misal: review baru hari ini, check-in hari ini).
5. **Sistem** memformat data hasil agregasi ke dalam skema snapshot.
6. **Sistem** menyimpan dokumen snapshot baru ke koleksi `analytics_snapshots` dengan ID dokumen menggunakan format tanggal hari tersebut (misal: `YYYY-MM-DD`).
7. **Sistem** menjalankan rutinitas pembersihan data (garbage collection): menghapus baris riwayat log pencarian (UC-21) yang berumur lebih dari 90 hari.
8. **Sistem** mencatat log sukses eksekusi harian ke sistem pemantauan (Cloud Logging).

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    participant Cron as Scheduler (00:00 UTC)
    participant Worker as Cloud Function (System)
    participant FS as Firestore DB
    participant Log as Cloud Logging

    Cron->>Worker: Trigger runDailyDataAggregation()
    Worker->>FS: Query & Hitung Total Users
    FS-->>Worker: Jumlah total user
    Worker->>FS: Query & Hitung Total Spots (status = approved)
    FS-->>Worker: Jumlah total spot approved
    Worker->>FS: Query & Hitung Total Reviews
    FS-->>Worker: Jumlah total review
    Worker->>Worker: Kalkulasi delta penambahan 24 jam terakhir
    Worker->>FS: Tulis dokumen snapshot baru ke analytics_snapshots
    Worker->>FS: Hapus search_logs berumur > 90 hari
    FS-->>Worker: Konfirmasi sukses tulis/hapus
    Worker->>Log: Tulis log status "Daily snapshot created successfully"
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Regenerasi Manual Snapshot oleh Admin**
    1. Admin mendeteksi adanya data snapshot yang terlewat atau terjadi kegagalan sistem.
    2. Admin memicu skrip agregasi secara manual melalui panel konsol administrator dengan menentukan tanggal yang ingin di-agregasikan.
    3. Sistem memproses data historis tanggal tersebut dan memperbarui snapshot di database.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Kegagalan Query Firestore**
    1. Firestore mengalami masalah koneksi sehingga perhitungan jumlah data (count query) gagal diselesaikan.
    2. Sistem menangkap kesalahan (catch error) dan membatalkan penulisan dokumen snapshot baru.
    3. Sistem mencatat kegagalan (error log) ke Cloud Logging dengan prioritas `Error` dan memicu pengiriman email darurat ke tim teknis (admin alert).

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-50**: Agregasi data harus dijalankan pada jam sepi aktivitas (default: **00:00 UTC** / 07:00 WIB) untuk mengurangi beban baca database pada saat pengguna aktif sedang tinggi.
- **BR-51**: Snapshot statistik bersifat read-only bagi semua pengguna kecuali sistem background worker dan akun pengembang (Admin) tertentu.

---

### 6. Catatan UI/UX
- *Use case* ini berjalan di latar belakang (backend) tanpa interaksi antarmuka pengguna (UI) langsung.
- Data yang dihasilkan dari snapshot ini disajikan secara visual pada Dashboard Pertumbuhan Admin (UC-20).

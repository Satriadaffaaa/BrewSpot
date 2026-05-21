# 📄 Spesifikasi Detail Use Case: UC-21
## Monitoring Log Pencarian (Search Trends)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-21 |
| **Nama Use Case** | Monitoring Log Pencarian (Search Trends) |
| **Aktor Utama** | Admin |
| **Deskripsi** | Admin menganalisis data tren pencarian pengguna dan daftar kata kunci yang gagal menemukan hasil (Missed Searches) untuk mengidentifikasi kesenjangan data (data gaps). |
| **Prioritas** | Low (Nice to Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Admin telah masuk (login).
    - Sistem merekam riwayat pencarian pengguna di koleksi `search_logs`.
- **Post-conditions**:
    - Daftar kata kunci pencarian terpopuler dan log pencarian kosong (Missed Searches) tertampil di panel analisis Admin.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** menavigasi ke menu "Search Insights" di Dashboard Admin.
2. **Sistem** melakukan query ke Firestore pada koleksi `search_logs` untuk mengumpulkan data riwayat pencarian dalam periode 30 hari terakhir.
3. **Sistem** melakukan agregasi data pencarian:
    - Menghitung frekuensi kata kunci yang sering dicari (Popular Search Queries).
    - Memfilter dan menghimpun kata kunci pencarian yang menghasilkan 0 spot (Missed Searches).
4. **Sistem** merender antarmuka analisis tren pencarian:
    - Daftar Tabel "Top 10 Pencarian Terpopuler" lengkap dengan angka jumlah pencarian.
    - Daftar Tabel "Missed Searches" yang mencatat kata kunci kosong (misal: "Kopi Gayo Banda Aceh" yang dicari berkali-kali namun belum terdaftar di database).
5. **Aktor** menganalisis data untuk merencanakan perluasan database/komunitas di kota atau kategori yang paling banyak dicari pengguna namun belum tersedia.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Admin as Admin
    participant SI as Search Insights UI
    participant API as System (API/Firestore)

    Admin->>SI: Buka menu "Search Insights"
    SI->>API: Request data log pencarian (30 hari terakhir)
    API->>API: Query koleksi search_logs
    API->>API: Agregasikan frekuensi keyword pencarian
    API->>API: Pisahkan keyword yang menghasilkan 0 hasil (resultsCount == 0)
    API-->>SI: Return Top Keywords & Missed Keywords
    SI-->>Admin: Tampilkan daftar tren & Missed Searches log
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Data Log Kosong**
    1. Belum ada aktivitas pencarian tercatat di sistem (misal platform baru saja dirilis).
    2. Sistem menampilkan pemberitahuan: "Belum ada log pencarian terekam saat ini."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-48**: Setiap kali pengguna melakukan pencarian di Search Bar (UC-01), sistem mencatat dokumen log baru di koleksi `search_logs` berisi: `query` (kata kunci), `resultsCount` (jumlah marker ditemukan), `userId` (jika login, atau 'anonymous'), dan `timestamp`.
- **BR-49**: Log pencarian dibatasi penyimpanannya hanya selama 90 hari terakhir untuk menghemat penyimpanan Firestore.

---

### 6. Catatan UI/UX
- Tabel "Missed Searches" menggunakan penyortiran otomatis berdasarkan jumlah pencarian terbanyak agar Admin dapat melihat kebutuhan data paling mendesak di urutan teratas.
- Disediakan tombol aksi cepat "Add Spot from Keyword" di samping baris missed searches, yang jika diklik mengarahkan Admin ke formulir tambah spot dengan nama spot/kota yang sudah terisi otomatis dari kata kunci tersebut.

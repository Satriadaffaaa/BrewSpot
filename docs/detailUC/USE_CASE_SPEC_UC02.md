# 📄 Spesifikasi Detail Use Case: UC-02
## Filter Berbasis Kategori & Tags

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-02 |
| **Nama Use Case** | Filter Berbasis Kategori & Tags |
| **Aktor Utama** | Visitor, Member |
| **Deskripsi** | Aktor memfilter data spot pada peta atau daftar eksplorasi menggunakan kategori utama (Food, Sightseeing, Hangout) dan/atau tags spesifik (Hidden Gem, Viral, Work-friendly). |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Pengguna berada di halaman Eksplorasi (`/explore`).
    - Peta dan antrean spot terisi data awal dari Firestore.
- **Post-conditions**:
    - Peta dan daftar spot hanya menampilkan data yang sesuai dengan kombinasi filter yang dipilih.
    - URL parameter diperbarui untuk mencerminkan filter aktif (memungkinkan bookmark/sharing).

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** menekan tombol atau ikon "Filter" pada panel pencarian.
2. **Sistem** membuka lembar dialog/drawer filter yang berisi opsi kategori dan tags.
3. **Aktor** memilih satu atau beberapa Kategori (misal: "Food") dan/atau Tags (misal: "Work-friendly").
4. **Sistem** memperbarui status pilihan secara visual (checkbox/chip aktif).
5. **Aktor** menekan tombol "Terapkan Filter" atau sistem mendeteksi perubahan filter secara real-time.
6. **Sistem** melakukan query ulang ke Firestore dengan kriteria pencocokan array tags dan string kategori.
7. **Sistem** menyaring marker pada MapCn dan menyembunyikan yang tidak cocok.
8. **Sistem** memperbarui list view (daftar spot) di samping peta.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Visitor/Member
    participant FP as Filter Panel
    participant API as System (API/Firestore)
    participant Map as MapCn Component

    User->>FP: Klik Filter Button
    FP-->>User: Tampilkan Pilihan Kategori & Tags
    User->>FP: Pilih Kategori/Tags (Multi-select)
    User->>FP: Klik "Terapkan Filter"
    FP->>API: Query spot (kategori IN [...] & tags ARRAY-CONTAINS [...])
    API-->>FP: Hasil spot yang terfilter
    FP->>Map: Update Markers & Bounds
    Map-->>User: Render ulang marker yang cocok di peta
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Membersihkan Filter**
    1. Pengguna menekan tombol "Reset Filter".
    2. Sistem menghapus semua filter aktif.
    3. Sistem memuat ulang semua data spot asal tanpa kriteria filter ke peta dan daftar.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Hasil Filter Kosong**
    1. Query sistem tidak menghasilkan spot yang cocok dengan filter yang dipilih.
    2. Sistem menampilkan ilustrasi/pesan: "Tidak ada spot yang cocok dengan filter Anda. Coba kurangi filter."
    3. Sistem menonaktifkan semua marker di peta.

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-03**: Filter dapat digabungkan (AND logic antara Kategori dan Tags, OR logic dalam kategori yang sama).
- **BR-04**: Jika izin GPS aktif, urutan hasil filter dalam list view mengutamakan spot dengan jarak terdekat dari pengguna.

---

### 6. Catatan UI/UX
- Filter drawer harus responsif (collapsible di perangkat mobile).
- Badge angka harus muncul di tombol filter untuk menunjukkan jumlah filter aktif.
- Perubahan visual marker yang di-filter menggunakan animasi fade-out / fade-in (opacity transition).

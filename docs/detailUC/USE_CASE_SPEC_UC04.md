# 📄 Spesifikasi Detail Use Case: UC-04
## Menambahkan Spot Baru

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-04 |
| **Nama Use Case** | Menambahkan Spot Baru |
| **Aktor Utama** | Member |
| **Deskripsi** | Member menambahkan lokasi (spot) baru ke database Lokali dengan mengisi nama, koordinat peta, deskripsi, kategori, dan foto. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login) ke dalam sistem.
    - Koneksi internet aktif untuk mengunggah media ke Cloudinary.
- **Post-conditions**:
    - Spot baru tersimpan di Firestore dengan status `pending` (untuk member level < 5) atau `approved` (untuk member level >= 5).
    - Media foto tersimpan di penyimpanan Cloudinary dan URL-nya tercatat di dokumen spot.
    - Member menerima 50 XP (jika auto-approved atau saat disetujui admin nanti).

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** menekan tombol "Add Spot" pada antarmuka navigasi.
2. **Sistem** menampilkan Formulir Tambah Spot.
3. **Aktor** mengisi Nama Spot, Alamat, Kota, Deskripsi, dan Kategori Utama.
4. **Aktor** menentukan lokasi presisi dengan menggeser pin di komponen peta interaktif.
5. **Sistem** menangkap koordinat Latitude dan Longitude secara otomatis dari posisi pin.
6. **Aktor** mengunggah satu atau beberapa foto lokasi.
7. **Sistem** mengirimkan file foto ke server Cloudinary dan menerima URL media.
8. **Sistem (AI)** menganalisis teks deskripsi dan foto untuk merekomendasikan tag secara otomatis (auto-tagging).
9. **Aktor** meninjau dan memilih tag yang disarankan atau menambahkan tag kustom.
10. **Aktor** menekan tombol "Submit Spot".
11. **Sistem** mengecek level/trust score Member.
12. **Sistem** menyimpan dokumen spot ke Firestore dengan status yang sesuai dan memberikan feedback berhasil.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Form as Add Spot Form
    participant Cloud as Cloudinary
    participant API as System (API/Firestore)
    participant Gemini as Gemini AI Service

    User->>Form: Isi nama, deskripsi, kategori & tentukan pin koordinat
    User->>Form: Unggah foto spot
    Form->>Cloud: Upload image files
    Cloud-->>Form: Return Image URLs
    Form->>Gemini: Kirim deskripsi & foto untuk auto-tagging
    Gemini-->>Form: Rekomendasi Tags (e.g. Work-friendly, Outdoor)
    User->>Form: Pilih tag & klik Submit
    Form->>API: Simpan data spot (status pending/approved)
    API->>API: Cek level User (Trust Score)
    alt Level >= 5 (Trusted User)
        API->>API: Set status = approved
        API->>API: Tambahkan 50 XP ke User profile
    else Level < 5 (New User)
        API->>API: Set status = pending
    end
    API-->>Form: Response Sukses & Update UI
    Form-->>User: Tampilkan pesan berhasil
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Pemilik Bisnis/Admin Menambahkan Spot**
    1. Aktor dengan role Business Owner atau Admin menambahkan spot.
    2. Sistem membuka semua kolom formulir (termasuk kolom terbatas: Menu Resmi & Jam Operasional Resmi).
    3. Spot yang disubmit oleh Owner/Admin langsung berstatus `approved` (Verified).

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Koordinat di Luar Batas Jangkauan**
    1. Member menempatkan pin di wilayah laut atau di luar area operasional negara/kota yang didukung.
    2. Sistem memvalidasi koordinat melalui geocoding terbalik.
    3. Sistem menampilkan pesan error: "Lokasi di luar jangkauan wilayah operasional kami. Silakan geser pin kembali ke daratan/area kota."
- **E2: Unggah Foto Gagal**
    1. File foto melebihi limit ukuran (misal > 5MB) atau koneksi ke Cloudinary terputus.
    2. Sistem menampilkan pesan error: "Gagal mengunggah foto. Pastikan format file berupa JPG/PNG dengan ukuran maksimal 5MB."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-08**: Menambahkan spot baru memberikan reward sebesar 50 XP (Subject to approval).
- **BR-09**: Kolom "Menu Resmi" (Menu links) dan "Jam Operasional" (Business Hours) dikunci hanya untuk Business Owner terverifikasi (UC-08) dan Admin. Member biasa dilarang mengisi kolom ini saat menambahkan spot awal.
- **BR-10**: Aturan Trust Score:
    - Member baru (Level < 5): Spot berstatus `pending` dan masuk antrean moderasi Admin (UC-09).
    - Member tepercaya (Level >= 5): Spot langsung mendapat status `approved` secara otomatis saat dikirim.

---

### 6. Catatan UI/UX
- Formulir menggunakan komponen card modern dengan pembagian section yang jelas (Informasi Umum, Lokasi Peta, Media).
- Peta mini untuk pin lokasi harus mendukung fitur geocoder (pencarian nama jalan/kota) agar memudahkan pin-pointing lokasi.
- Progres upload foto ditampilkan dengan progress bar interaktif di atas thumbnail gambar.

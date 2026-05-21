# 📄 Spesifikasi Detail Use Case: UC-08
## Manajemen Menu Resmi & Foto Official

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-08 |
| **Nama Use Case** | Manajemen Menu Resmi & Foto Official |
| **Aktor Utama** | Business Owner |
| **Deskripsi** | Business Owner mengelola konten resmi bisnis seperti jam operasional terperinci, menu harga terbaru, daftar fasilitas, dan galeri foto beresolusi tinggi (Official Photos). |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Pengguna telah login sebagai Business Owner dan memiliki klaim yang telah disetujui (Verified) atas spot tersebut.
    - Koneksi internet aktif untuk sinkronisasi dokumen menu atau foto official.
- **Post-conditions**:
    - Konten resmi (Jam operasional, Menu, Fasilitas, Foto Official) diperbarui di Firestore.
    - Tampilan spot di peta dan aplikasi menampilkan lencana (Badge) "Verified Business".
    - Data menu dan jam kerja dikunci agar tidak dapat diubah oleh kontributor Member biasa.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** masuk ke halaman Dashboard Bisnis (Business Dashboard).
2. **Sistem** menampilkan daftar spot yang dikelola oleh aktor tersebut.
3. **Aktor** memilih spot yang ingin diperbarui, kemudian memilih tab/menu "Official Content".
4. **Sistem** menyajikan formulir pengelolaan konten khusus pemilik bisnis (Menu Resmi, Jam Operasional, Jam Libur Khusus, Fasilitas Tambahan, dan Unggah Foto Official).
5. **Aktor** memperbarui Jam Operasional (misal: Senin - Minggu, 08:00 - 22:00) dan mencentang fasilitas yang tersedia (misal: Wi-Fi, Stopkontak, Indoor AC).
6. **Aktor** mengunggah file gambar menu/brosur harga atau menautkan tautan menu digital.
7. **Sistem** mengunggah berkas gambar menu ke Cloudinary dan merekam URL tujuannya.
8. **Aktor** menambahkan foto-foto promosi outlet resmi.
9. **Aktor** menekan tombol "Save Official Content".
10. **Sistem** memperbarui database Firestore pada dokumen spot dan menyebarkan pembaruan secara real-time ke UI pengunjung.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Owner as Business Owner
    participant Dash as Business Dashboard
    participant Cloud as Cloudinary
    participant API as System (API/Firestore)
    participant Page as Public Spot Page

    Owner->>Dash: Masuk menu "Official Content" untuk spot terpilih
    Dash->>API: Query status otorisasi akun
    API-->>Dash: Otorisasi valid (Verified Owner)
    Dash-->>Owner: Tampilkan formulir edit official (Jam, Menu, Foto, Fasilitas)
    Owner->>Dash: Update Jam Kerja & Fasilitas
    Owner->>Dash: Unggah Foto Menu & Foto Promosi Baru
    Dash->>Cloud: Upload official media assets
    Cloud-->>Dash: Return Asset URLs
    Owner->>Dash: Klik "Save Official Content"
    Dash->>API: Update Firestore Spot Document
    API->>API: Kunci field (Hours & Menu) & Set Verified Badge
    API-->>Dash: Simpan Berhasil
    Dash-->>Owner: Notifikasi data resmi diperbarui
    API->>Page: Push real-time updates
    Page-->>Owner: Tampilkan layout spot baru dengan badge "Verified"
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Admin Melakukan Pembaruan Info**
    1. Aktor dengan role Admin dapat melewati cek validasi pemilik dan langsung mengubah menu atau jam kerja spot mana pun melalui Dashboard Admin.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Akses Tidak Sah (Unauthorized Attempt)**
    1. Pengguna biasa (Member/Visitor) mencoba menembak API edit official content spot.
    2. Sistem mendeteksi role pengguna tidak memiliki relasi kepemilikan yang terverifikasi dengan Spot ID tersebut.
    3. Sistem memblokir request dan mengembalikan error status 403 (Forbidden) serta mencatat log pelanggaran keamanan.

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-21**: Hanya pengguna dengan role **Business Owner** (terkait spot tersebut) atau **Admin** yang diizinkan untuk memodifikasi bidang "Jam Operasional Resmi", "Fasilitas Resmi", dan tautan "Menu Resmi".
- **BR-22**: Semua media yang diunggah melalui tab Official Content ditandai dengan flag `official = true` di database untuk membedakannya dari foto unggahan pengunjung biasa.

---

### 6. Catatan UI/UX
- Menggunakan picker waktu yang interaktif dan mudah (Time Picker) untuk menyetel jam operasional.
- Menyediakan galeri pengurutan gambar (drag-and-drop sortable) agar pemilik bisnis bisa mengatur urutan foto official mana yang muncul pertama di slide-show utama.
- Desain halaman detail spot yang telah diverifikasi harus memiliki visual premium (misal: warna aksen emas/ungu tua halus dengan lencana centang verifikasi di samping nama kafe).

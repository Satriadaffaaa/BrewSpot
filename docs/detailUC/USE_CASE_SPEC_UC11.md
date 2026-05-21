# 📄 Spesifikasi Detail Use Case: UC-11
## Manajemen Profil & Visualisasi Progress

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-11 |
| **Nama Use Case** | Manajemen Profil & Visualisasi Progress |
| **Aktor Utama** | Member |
| **Deskripsi** | Member mengelola informasi profil pribadinya dan melihat statistik kontribusi, level gamifikasi, lencana (badge) yang diraih, serta kemajuan XP. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login) dan memiliki profil aktif di Firestore.
- **Post-conditions**:
    - Perubahan data profil (nama, bio, foto profil, link media sosial) tersimpan di database.
    - Level, lencana, dan kemajuan XP terhitung serta ditampilkan secara akurat.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** mengakses halaman "Profile" melalui navigasi utama.
2. **Sistem** mengambil data profil Member, total kontribusi (jumlah spot, review, like), dan total akumulasi XP.
3. **Sistem** menghitung level saat ini dan sisa XP yang dibutuhkan untuk naik ke level berikutnya berdasarkan formula level sistem.
4. **Sistem** merender halaman profil yang menampilkan:
    - Foto Profil, Nama Lengkap, Username, Bio, dan Tautan Sosial Media.
    - Badge khusus (misal: "Foodie Starter", "Verified Explorer").
    - Statistik Kontribusi: Total Spots Added, Total Reviews Written, Total Likes Received.
    - Progress Bar XP interaktif (menunjukkan XP saat ini vs target XP level selanjutnya).
5. **Aktor** menekan tombol "Edit Profile".
6. **Sistem** membuka formulir pengeditan profil.
7. **Aktor** memperbarui data (misal: mengubah foto profil baru atau mengedit bio).
8. **Aktor** menekan tombol "Save Profile".
9. **Sistem** memperbarui dokumen user di Firestore dan memperbarui visual halaman profil utama dengan data baru.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Page as Profile Page
    participant Form as Edit Profile Modal
    participant Cloud as Cloudinary
    participant API as System (API/Firestore)

    User->>Page: Klik menu "Profile"
    Page->>API: Fetch data user & statistik kontribusi
    API-->>Page: Return user profile data (XP, Level, Badges, Stats)
    Page->>Page: Kalkulasi progress bar XP
    Page-->>User: Tampilkan halaman profil & visual progress
    User->>Page: Klik "Edit Profile"
    Page->>Form: Buka Modal Edit Form
    User->>Form: Ubah foto profil & bio
    Form->>Cloud: Upload foto profil baru (jika ada)
    Cloud-->>Form: Return URL Foto Profil
    User->>Form: Klik "Save Profile"
    Form->>API: Kirim data profil terbaru
    API->>API: Validasi data & update Firestore
    API-->>Form: Response sukses
    Form->>Page: Refresh data profil
    Page-->>User: Tampilkan profil terbaru
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Level Up Alert**
    1. Pengguna membuka halaman profil tepat setelah aksi kontribusinya memicu kenaikan level.
    2. Sistem mendeteksi peningkatan level.
    3. Sebelum menampilkan halaman profil biasa, sistem memunculkan pop-up modal animasi selamat atas kenaikan level baru dan lencana baru yang terbuka (Achievement unlocked).

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Username Sudah Digunakan**
    1. Member mengubah username menjadi nama yang sudah dimiliki member lain.
    2. Member menekan "Save Profile".
    3. Sistem memvalidasi keunikan username di database.
    4. Sistem membatalkan penyimpanan dan menampilkan pesan error: "Username sudah digunakan. Silakan pilih username lain."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-27**: Peningkatan level didasarkan pada akumulasi XP. Contoh formula level: `Level = floor(sqrt(XP / 100)) + 1` (atau formula linear/eksponensial yang disepakati).
- **BR-28**: Badges otomatis terbuka ketika Member memenuhi milestone tertentu (misal: Badge "Explorer" terbuka setelah menambahkan 5 spot disetujui, Badge "Critic" terbuka setelah menulis 10 review).

---

### 6. Catatan UI/UX
- Progress bar XP menggunakan visual gradasi warna yang menarik (misal dari ungu ke merah muda) dengan animasi isi yang bergerak halus dari kiri ke kanan.
- Badge dipajang dalam bentuk grid miniatur berkilau (glow effect) dengan deskripsi melayang (tooltip) saat kursor diarahkan ke lencana tersebut.
- Foto profil menggunakan bentuk melingkar (avatar circle) dengan opsi seret-lepas (crop & zoom) sebelum berkas diunggah.

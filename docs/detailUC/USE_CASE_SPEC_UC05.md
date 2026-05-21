# 📄 Spesifikasi Detail Use Case: UC-05
## Memberikan Review & Rating

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-05 |
| **Nama Use Case** | Memberikan Review & Rating |
| **Aktor Utama** | Member |
| **Deskripsi** | Member memberikan ulasan teks, penilaian rating bintang, serta mengunggah media (foto/video) terkait pengalamannya mengunjungi suatu spot. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
    - Member berada pada halaman detail spot tujuan.
    - Member belum pernah memberikan review untuk spot ini sebelumnya (maksimal 1 review per spot per user).
- **Post-conditions**:
    - Review tersimpan di database dan tampil secara publik di bawah detail spot.
    - Nilai rating rata-rata (average rating) spot diperbarui secara real-time.
    - Member mendapatkan reward XP sesuai dengan jenis konten yang disubmit (ulasan & media).

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** menekan tombol "Add Review" pada halaman detail spot.
2. **Sistem** membuka dialog/modal modal ulasan.
3. **Aktor** memilih jumlah bintang dari skala 1 sampai 5.
4. **Aktor** menulis ulasan tekstual mengenai pengalamannya.
5. **Aktor** memilih dan mengunggah media pendukung (foto atau video pendek).
6. **Sistem** mengirim media ke Cloudinary dan menerima URL media hasil upload.
7. **Aktor** menekan tombol "Post Review".
8. **Sistem** menyaring isi teks ulasan menggunakan auto-filter kata-kata terlarang (blacklist).
9. **Sistem** menyimpan dokumen review ke Firestore.
10. **Sistem** melakukan kalkulasi ulang rata-rata rating spot berdasarkan total seluruh rating review spot tersebut.
11. **Sistem** menghitung reward XP dan menambahkannya ke akun Member.
12. **Sistem** memperbarui UI untuk menampilkan review baru secara instan.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Form as Review Modal
    participant Cloud as Cloudinary
    participant API as System (API/Firestore)

    User->>Form: Klik "Add Review"
    Form-->>User: Tampilkan input rating bintang & textarea ulasan
    User->>Form: Pilih bintang (1-5) & ketik ulasan
    User->>Form: Upload media (foto/video)
    Form->>Cloud: Upload media files
    Cloud-->>Form: Return Media URLs (Max 3)
    User->>Form: Klik "Post Review"
    Form->>API: Post review data & URLs
    API->>API: Validasi ulasan terhadap kata terlarang (Auto-filter)
    alt Lolos Sensor
        API->>API: Simpan review (status: approved)
        API->>API: Update Rata-rata Rating Spot
        API->>API: Tambahkan XP (10 XP + 5 XP per media)
    else Terdeteksi Kata Kasar / Spam
        API->>API: Simpan review (status: pending/flagged)
        API-->>Form: Notifikasi "Ulasan Anda sedang ditinjau admin"
    end
    API-->>Form: Response status & XP reward
    Form-->>User: Visual feedback (Review posted & XP earned)
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Review Tanpa Media**
    1. Pengguna hanya mengisi ulasan teks dan rating bintang tanpa mengunggah foto/video.
    2. Sistem memproses review secara normal dan hanya memberikan reward dasar (10 XP).

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Duplikasi Review**
    1. Member mencoba memicu modal review pada spot yang sudah pernah ia ulas sebelumnya.
    2. Sistem menonaktifkan tombol "Add Review" dan menampilkan tulisan "Anda sudah memberikan review untuk spot ini. Anda dapat mengedit ulasan sebelumnya."
- **E2: Terdeteksi Kata-kata Terlarang (Blacklisted Words)**
    1. Teks review mengandung kata-kata kasar, rasis, atau spam promosi.
    2. Review disimpan dengan status `flagged/pending` dan tidak ditampilkan ke publik secara langsung.
    3. Sistem memicu notifikasi ke Dashboard Moderasi Admin (UC-09).

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-11**: Batasan review adalah 1 review per spot per pengguna.
- **BR-12**: XP Reward untuk review:
    - Menulis review dasar: 10 XP.
    - Mengunggah media (foto/video): 5 XP per media (maksimal 3 media = 15 XP).
- **BR-13**: Sistem auto-filter berjalan otomatis sebelum data disimpan ke database.

---

### 6. Catatan UI/UX
- Pemilihan rating bintang menggunakan efek hover berwarna emas/kuning yang responsif.
- Indikator karakter minimal (misal: "Minimal 10 karakter") dan maksimal media (maksimal 3 file) terlihat jelas saat mengisi ulasan.
- Notifikasi perolehan XP ditampilkan dengan animasi popup/toast konfeti yang menarik untuk meningkatkan kepuasan pengguna.

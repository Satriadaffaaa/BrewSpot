# 📄 Spesifikasi Detail Use Case: UC-12
## Riwayat Kontribusi (My Activity)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-12 |
| **Nama Use Case** | Riwayat Kontribusi (My Activity) |
| **Aktor Utama** | Member |
| **Deskripsi** | Member melihat daftar lengkap riwayat kontribusi yang pernah ia lakukan, termasuk status persetujuan spot yang diajukan dan review yang telah dipublikasikan beserta statistik respon komunitas. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
- **Post-conditions**:
    - Daftar riwayat kontribusi spot (pending/approved/rejected) dan review (disertai statistik suka) ditampilkan dengan rapi.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman profilnya dan memilih tab "My Contributions" atau "Riwayat Aktivitas".
2. **Sistem** melakukan query ke Firestore pada koleksi `spots` di mana `createdBy == userId` dan koleksi `reviews` di mana `userId == userId`.
3. **Sistem** mengurutkan data berdasarkan timestamp terbaru (descending order).
4. **Sistem** menampilkan dua sub-tab:
    - **Spot Submission**: Menampilkan daftar nama spot, tanggal diajukan, foto, dan status pill (`Approved` berwarna hijau, `Pending` berwarna kuning, `Rejected` berwarna merah).
    - **Reviews**: Menampilkan nama spot yang diulas, teks ulasan, rating bintang, media yang diunggah, dan jumlah upvote/like yang diterima dari pengguna lain.
5. **Aktor** dapat menyaring riwayat berdasarkan status atau mengklik salah satu item untuk langsung menuju ke halaman detail spot terkait.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Page as Profile Page
    participant Tab as Contributions Tab
    participant API as System (API/Firestore)

    User->>Page: Buka tab "My Contributions"
    Page->>Tab: Pemicu muat riwayat
    Tab->>API: Query spots (createdBy = userId) & reviews (userId = userId)
    API-->>Tab: Return list of spots & reviews
    Tab->>Tab: Sortir berdasarkan tanggal terbaru
    Tab-->>User: Tampilkan daftar kontribusi dengan label status (Approved/Pending/Rejected)
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Belum Ada Riwayat Kontribusi**
    1. Query Firestore menghasilkan array kosong (user belum pernah submit spot/review).
    2. Sistem menampilkan visual empty-state dengan ilustrasi ramah: "Kamu belum menulis review atau menambahkan spot. Mulai kontribusimu sekarang!"
    3. Sistem menyediakan tombol aksi cepat mengarah ke Halaman Peta (Eksplorasi) untuk memicu pembuatan kontribusi.

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-29**: Konten yang dihapus oleh pengguna sendiri (UC-15) atau dihapus oleh moderator Admin (UC-09) tidak akan muncul kembali di tab riwayat kontribusi publik, namun riwayat log XP yang pernah diterima tetap tercatat di sistem log XP internal.

---

### 6. Catatan UI/UX
- Label status (Pills) memiliki warna kontras yang lembut (tidak terlalu mencolok) dengan ikon status kecil di samping teks (misal: ikon jam pasir untuk pending, centang untuk approved, tanda silang untuk rejected).
- Jika ada spot dengan status `Rejected`, disediakan ikon informasi "i" kecil di dekat status yang jika diklik menampilkan tooltip berisi catatan alasan penolakan dari Admin (UC-09).
- Menggunakan list-view kompak dengan scroll tak terbatas (infinite scroll) jika daftar kontribusi melebihi 10 item.

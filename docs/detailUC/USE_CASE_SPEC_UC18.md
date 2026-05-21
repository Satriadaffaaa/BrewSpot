# 📄 Spesifikasi Detail Use Case: UC-18
## Verifikasi Klaim Bisnis

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-18 |
| **Nama Use Case** | Verifikasi Klaim Bisnis |
| **Aktor Utama** | Admin |
| **Deskripsi** | Admin meninjau berkas legalitas hukum yang diunggah oleh Member untuk mengajukan hak milik atas suatu spot, kemudian menyetujui atau menolak klaim tersebut. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Admin telah login dengan hak akses administratif.
    - Ada pengajuan klaim spot dari pengguna dengan status `waiting_verification`.
- **Post-conditions**:
    - Status pengajuan klaim diperbarui di Firestore (`approved` atau `rejected`).
    - Akun Member pengaju ditingkatkan role-nya menjadi `Business Owner` (jika disetujui).
    - Lencana "Verified Business" diaktifkan pada spot terkait (jika disetujui).

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman "Business Claims Dashboard" di Dashboard Admin.
2. **Sistem** memuat daftar pengajuan klaim yang berstatus `waiting_verification`.
3. **Aktor** memilih salah satu pengajuan untuk ditinjau.
4. **Sistem** menampilkan data kontak pengaju, ID spot, serta galeri gambar berkas legalitas hukum (KTP, NIB, NPWP, atau Foto Outlet).
5. **Aktor** melakukan pengecekan data dan memvalidasi keabsahan dokumen (misal: cek kesamaan nama outlet dan NIB).
6. **Aktor** menekan tombol "Approve Claim".
7. **Sistem** mengubah status dokumen klaim menjadi `approved`.
8. **Sistem** mengubah role Member pengaju menjadi `Business Owner` di database.
9. **Sistem** mengaitkan ID spot tersebut ke array `claimedSpots` pada profil pengguna tersebut.
10. **Sistem** menambahkan lencana `verified: true` pada dokumen spot.
11. **Sistem** mengirimkan notifikasi selamat dan instruksi kelola bisnis ke email/inbox pengguna.
12. **Sistem** menyegarkan antrean klaim admin.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Admin as Admin
    participant CD as Claims Dashboard
    participant API as System (API/Firestore)
    participant User as Member Applicant

    Admin->>CD: Buka menu "Business Claims"
    CD->>API: Query pengajuan klaim (status = waiting_verification)
    API-->>CD: Return daftar pengajuan klaim
    Admin->>CD: Pilih item & periksa dokumen legalitas
    Admin->>CD: Klik "Approve Claim"
    CD->>API: Update status klaim ke 'approved'
    API->>API: Ubah role user ke 'Business Owner'
    API->>API: Daftarkan spotId ke akun user
    API->>API: Set field verified = true pada Spot Document
    API->>User: Kirim notifikasi "Klaim Bisnis Anda Disetujui!"
    API-->>CD: Hapus item dari antrean & refresh
    CD-->>Admin: Visual status terupdate
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Penolakan Klaim (Reject Claim)**
    1. Admin menilai dokumen tidak sah, kedaluwarsa, atau tidak cocok dengan spot.
    2. Admin menekan tombol "Reject Claim".
    3. Sistem memunculkan kolom pengisian alasan penolakan.
    4. Admin memilih alasan (misal: "Dokumen buram/tidak terbaca", "Bukti kepemilikan tidak sesuai") dan mengirimkan penolakan.
    5. Sistem mengubah status klaim menjadi `rejected`, melepas kunci eksklusif spot, dan mengirim pesan penolakan beserta alasannya kepada pengaju.

---

### 4. Alur Eksepsi (Exception Flows)
- **Tidak ada alur eksepsi.**

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-42**: Jika klaim ditolak, status akun pemohon tetap sebagai `Member` biasa dan spot dikembalikan ke status `Unclaimed` (dapat diajukan klaim kembali oleh orang lain).
- **BR-43**: Admin dapat secara manual mencabut hak kepemilikan spot sewaktu-waktu jika ditemukan adanya pelanggaran hukum di kemudian hari, mengembalikan status spot menjadi `Unclaimed` dan meninjau kembali role pengguna tersebut.

---

### 6. Catatan UI/UX
- Gambar dokumen legalitas harus memiliki fitur lightbox modal (dapat diperbesar, diputar, dan di-download) untuk memudahkan pengecekan teks dokumen yang kecil.
- Layout dashboard moderasi klaim memisahkan kolom data pengaju dan dokumen legalitas secara berdampingan agar meminimalkan scroll layar.
- Formulir penolakan menyediakan template alasan penolakan cepat (pre-defined templates) untuk mempercepat kerja admin.

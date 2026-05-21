# 📄 Spesifikasi Detail Use Case: UC-07
## Pengajuan Klaim Kepemilikan Spot

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-07 |
| **Nama Use Case** | Pengajuan Klaim Kepemilikan Spot |
| **Aktor Utama** | Member (Calon Business Owner) |
| **Deskripsi** | Member mengajukan diri sebagai pemilik bisnis resmi dari suatu spot dengan mengunggah bukti legalitas hukum untuk diverifikasi oleh Admin. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
    - Spot tujuan sudah terdaftar di sistem Lokali dan saat ini belum memiliki Business Owner terverifikasi (Unclaimed).
- **Post-conditions**:
    - Data pengajuan klaim tersimpan di database dengan status `waiting_verification`.
    - Hak kelola spot dikunci sementara untuk mencegah pengajuan ganda dari member lain.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka detail spot yang ingin diklaim kepemilikannya.
2. **Sistem** menampilkan opsi "Claim this Spot" di panel menu detail.
3. **Aktor** menekan tombol "Claim this Spot".
4. **Sistem** menampilkan Formulir Pengajuan Klaim Kepemilikan.
5. **Aktor** mengisi informasi bisnis: Nama Lengkap Pengaju, Jabatan, Nomor Telepon Bisnis, dan Email Bisnis Resmi.
6. **Aktor** mengunggah file bukti identitas diri (KTP) dan minimal 2 dokumen legalitas bisnis (misal: NIB, NPWP, atau Foto Storefront Kafe dengan spanduk nama yang jelas).
7. **Sistem** mengunggah file-file dokumen tersebut ke Cloudinary.
8. **Aktor** menekan tombol "Kirim Pengajuan Klaim".
9. **Sistem** memverifikasi kelengkapan dokumen pengaju (minimal 2 jenis berkas legalitas terunggah).
10. **Sistem** menyimpan data pengajuan klaim ke Firestore dengan status `waiting_verification` dan mengirim notifikasi ke Admin (UC-18).
11. **Sistem** mengubah tampilan tombol klaim pada spot menjadi "Verification in Progress" bagi aktor tersebut.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member (Calon Owner)
    participant Page as Spot Detail Page
    participant Form as Claim Business Form
    participant Cloud as Cloudinary
    participant API as System (API/Firestore)

    User->>Page: Klik "Claim this Spot"
    Page->>API: Cek apakah spot sudah diklaim
    API-->>Page: Spot Status: Unclaimed
    Page->>Form: Tampilkan Formulir Klaim
    User->>Form: Isi detail kontak & unggah dokumen legalitas (Min. 2 berkas)
    Form->>Cloud: Upload dokumen hukum
    Cloud-->>Form: Return URL berkas
    User->>Form: Klik "Kirim Pengajuan Klaim"
    Form->>API: Simpan pengajuan klaim (status: waiting_verification)
    API->>API: Kunci spot dari klaim baru lainnya
    API-->>Form: Response Berhasil & Lock Status
    Form-->>User: Tampilkan pesan "Pengajuan terkirim, mohon tunggu verifikasi admin"
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Berkas Legalitas Kurang**
    1. Member hanya mengunggah 1 berkas (misal hanya foto KTP tanpa NIB/Foto Outlet).
    2. Member menekan "Kirim Pengajuan Klaim".
    3. Sistem mendeteksi berkas kurang dari batas minimal (2 berkas).
    4. Sistem membatalkan pengiriman dan menampilkan pesan error: "Silakan unggah minimal 2 dokumen bukti legalitas bisnis (NIB/NPWP/Foto Outlet) sebelum melanjutkan."
- **E2: Spot Sudah Memiliki Pemilik Terverifikasi**
    1. Member mencoba mengakses tautan formulir klaim spot yang sudah berhasil diklaim pihak lain.
    2. Sistem memblokir akses dan menampilkan pesan error: "Spot ini sudah diverifikasi milik Business Owner lain. Jika Anda merasa ini kesalahan, hubungi Support."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-18**: Pengajuan klaim memerlukan setidaknya **2 bukti legalitas dokumen resmi** (bisa berupa kombinasi NIB, NPWP bisnis, atau foto fisik outlet nyata bersama pemilik/spanduk nama).
- **BR-19**: Status awal klaim adalah `waiting_verification`. Selama status ini aktif, spot tidak dapat diajukan klaim ulang oleh orang lain.
- **BR-20**: Setelah klaim disetujui Admin (UC-18), role Member pengaju ditingkatkan menjadi `Business Owner` (khusus untuk pengelolaan spot tersebut).

---

### 6. Catatan UI/UX
- Menggunakan stepper form sederhana jika diperlukan untuk membagi pengisian kontak dan pengunggahan dokumen.
- Bagian dropzone unggahan berkas harus mendukung format PDF, JPG, dan PNG dengan visual preview yang bersih.
- Menampilkan alert warning kuning yang menginformasikan bahwa pemalsuan dokumen hukum dapat berakibat pada pemblokiran akun permanen.

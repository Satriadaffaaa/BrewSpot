# 📄 Spesifikasi Detail Use Case: UC-10
## Pelaporan Konten (Report System)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-10 |
| **Nama Use Case** | Pelaporan Konten (Report System) |
| **Aktor Utama** | Member |
| **Deskripsi** | Member melaporkan konten (spot, review, atau foto) yang dianggap melanggar syarat dan ketentuan (SARA, spam, kasar, atau menyesatkan) agar ditinjau oleh Admin. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
    - Konten yang ingin dilaporkan (Review/Spot/Foto) berstatus aktif (publik).
- **Post-conditions**:
    - Laporan tercatat di Firestore pada sub-koleksi `reports` dengan relasi ID konten terkait.
    - Status konten berubah menjadi `flagged` dan muncul di Dashboard Moderasi Admin.
    - Jika laporan untuk konten yang sama melebihi batas toleransi, konten disembunyikan otomatis sementara waktu.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** menemukan konten yang dianggap tidak pantas (misal: review kasar).
2. **Aktor** menekan ikon "Report" (bendera/tanda seru) di sudut kanan atas kartu konten tersebut.
3. **Sistem** menampilkan jendela dialog modal "Laporkan Konten".
4. **Aktor** memilih salah satu kategori pelanggaran (Spam, Harassment, Misleading, Inappropriate, SARA).
5. **Aktor** mengisi kolom deskripsi tambahan (opsional) untuk menjelaskan pelanggaran secara detail.
6. **Aktor** menekan tombol "Kirim Laporan".
7. **Sistem** mencatat dokumen laporan baru di Firestore, merekam ID pelapor, ID konten, kategori, deskripsi, dan waktu laporan.
8. **Sistem** meningkatkan counter `reportCount` pada dokumen konten terkait.
9. **Sistem** memberikan feedback terima kasih kepada Member atas partisipasinya menjaga keamanan komunitas.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant UI as Content Item UI
    participant Mod as Report Dialog Modal
    participant API as System (API/Firestore)
    participant Admin as Admin Dashboard

    User->>UI: Klik ikon "Report"
    UI->>Mod: Buka dialog pelaporan
    Mod-->>User: Tampilkan opsi kategori (Spam, SARA, dll.)
    User->>Mod: Pilih kategori & isi deskripsi tambahan
    User->>Mod: Klik "Kirim Laporan"
    Mod->>API: Simpan dokumen laporan & increment reportCount
    API->>API: Evaluasi jumlah reportCount untuk konten ini
    alt reportCount > 3
        API->>API: Ubah status konten menjadi 'hidden' (Auto-hide)
    else reportCount <= 3
        API->>API: Set status konten menjadi 'flagged' (tetap tampil namun ditandai)
    end
    API->>Admin: Push notifikasi/item ke antrean moderasi
    API-->>Mod: Response sukses
    Mod-->>User: Tampilkan toast "Laporan Anda telah diterima"
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Auto-Hide Konten Terlapor**
    1. Sistem mendeteksi bahwa total laporan unik (`reportCount`) untuk suatu konten (misal: review) telah mencapai lebih dari 3 kali.
    2. Sistem secara otomatis mengubah status visibilitas konten tersebut menjadi `hidden` (sementara waktu) untuk mencegah penyebaran konten negatif.
    3. Sistem mengirimkan alert prioritas tinggi ke Dashboard Admin untuk penanganan segera.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Melaporkan Konten Sendiri**
    1. Member mencoba menekan ikon report pada konten yang ia tulis sendiri.
    2. Sistem menyembunyikan ikon report atau memblokir aksi dengan pesan: "Anda tidak dapat melaporkan konten milik Anda sendiri."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-25**: Batas toleransi pelaporan otomatis adalah **3 laporan unik** dari user berbeda. Konten yang melebihi batas ini langsung disembunyikan dari publik (`auto-hide`) demi perlindungan komunitas, sambil menunggu keputusan final moderasi Admin.
- **BR-26**: Satu Member hanya dapat melaporkan konten tertentu sebanyak 1 kali (sistem memvalidasi kombinasi `reporterId` dan `contentId` untuk mencegah spam laporan).

---

### 6. Catatan UI/UX
- Ikon report diletakkan di area yang mudah diakses namun tidak mengganggu estetika (misal: di dalam dropdown menu opsi titik tiga).
- Dialog konfirmasi pelaporan harus memberikan kejelasan bahwa pelapor tidak akan diungkap identitasnya kepada pemilik konten yang dilaporkan (Anonymous reporting protection).
- Toast sukses menggunakan visual yang bersahabat untuk menghargai kontribusi member dalam menjaga kenyamanan platform.

# 📄 Spesifikasi Detail Use Case: UC-09
## Moderasi Konten (Admin)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-09 |
| **Nama Use Case** | Moderasi Konten |
| **Aktor Utama** | Admin |
| **Deskripsi** | Admin meninjau antrean spot baru, review, atau unggahan media yang tertunda (pending) atau dilaporkan (flagged) untuk disetujui, ditolak, atau disembunyikan. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Admin telah masuk (login) dengan akun berkredensial administrator.
    - Terdapat entitas (spot/review/foto) dalam status `pending` atau terdeteksi melanggar filter otomatis / dilaporkan pengguna.
- **Post-conditions**:
    - Status konten diperbarui di Firestore (`approved`, `rejected`, atau `hidden`).
    - Pemberitahuan status kontribusi dikirim ke Member yang mengajukan.
    - Member mendapatkan reward tambahan (100 XP untuk spot yang disetujui).

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka Dashboard Moderasi Admin.
2. **Sistem** menyajikan daftar antrean konten yang membutuhkan tinjauan (dibagi menjadi tab: Pending Spots, Flagged Reviews, Reported Photos).
3. **Aktor** memilih salah satu item untuk melihat detail kontribusinya.
4. **Sistem** menampilkan detail konten lengkap (termasuk informasi pengaju, isi ulasan, koordinat spot, lampiran foto, atau log alasan pelaporan).
5. **Aktor** menekan tombol "Approve" (Setujui).
6. **Sistem** mengubah status konten menjadi `approved` di Firestore, membuatnya terlihat publik.
7. **Sistem** memicu penambahan reward XP (100 XP) kepada Member pembuat spot jika item yang disetujui adalah spot baru.
8. **Sistem** mengirim notifikasi sukses/apresiasi ke inbox Member tersebut.
9. **Sistem** memperbarui antrean moderasi dengan menghapus item yang baru diproses.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Admin as Admin
    participant MD as Moderation Dashboard
    participant API as System (API/Firestore)
    participant User as Member Submitter

    Admin->>MD: Masuk ke Dashboard Moderasi
    MD->>API: Query antrean konten status pending/flagged
    API-->>MD: Kembalikan list konten
    Admin->>MD: Pilih item & klik "Approve"
    MD->>API: Update status konten ke 'approved'
    alt Item adalah Spot Baru
        API->>API: Tambahkan 100 XP ke Profile User Submitter
    end
    API->>User: Kirim notifikasi "Kontribusi Anda disetujui"
    API-->>MD: Hapus item dari antrean & refresh
    MD-->>Admin: Visual status terupdate
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Penolakan Konten (Reject Content)**
    1. Admin menekan tombol "Reject" (Tolak).
    2. Sistem memunculkan jendela dialog pengisian alasan penolakan.
    3. Admin memilih atau mengetikkan alasan penolakan (misal: "Duplikasi data", "Foto tidak jelas", "Informasi tidak akurat").
    4. Sistem mengubah status konten menjadi `rejected` di database (konten tidak tampil publik).
    5. Sistem mengirim notifikasi alasan penolakan ke Member pengaju agar dapat diperbaiki.
- **A2: Menyembunyikan Konten Dilaporkan (Hide Flagged Content)**
    1. Admin meninjau laporan review/foto negatif (flagged/reported).
    2. Admin memutuskan konten melanggar aturan dan menekan tombol "Hide".
    3. Sistem mengubah status konten menjadi `hidden` (diarsipkan secara internal di DB namun disembunyikan dari antarmuka pengguna).

---

### 4. Alur Eksepsi (Exception Flows)
- **Tidak ada alur eksepsi.**

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-23**: Menyetujui spot baru yang statusnya `pending` akan memberikan reward tambahan satu kali sebesar **100 XP** kepada Member pengusul (di luar reward kirim awal 50 XP).
- **BR-24**: Konten yang berstatus `rejected` tetap disimpan di database untuk kebutuhan audit internal selama 30 hari sebelum dihapus permanen secara otomatis oleh sistem scheduler.

---

### 6. Catatan UI/UX
- Dashboard moderasi menggunakan tata letak bento grid atau list kolom ganda yang efisien untuk mempercepat proses peninjauan (side-by-side comparison).
- Tombol aksi menggunakan warna kontras yang jelas: Hijau untuk Approve, Merah untuk Reject/Hide.
- Menyediakan pintasan keyboard (hotkeys) untuk admin tepercaya demi mempercepat proses moderasi skala besar (misal: tombol `A` untuk Approve, `R` untuk Reject).

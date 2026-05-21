# 📄 Spesifikasi Detail Use Case: UC-15
## Pengeditan & Penghapusan Konten Pribadi

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-15 |
| **Nama Use Case** | Pengeditan & Penghapusan Konten Pribadi |
| **Aktor Utama** | Member |
| **Deskripsi** | Member mengubah informasi atau menghapus secara permanen konten (ulasan atau usulan spot) yang pernah ia kontribusikan sebelumnya ke platform Lokali. |
| **Prioritas** | High (Must Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
    - Member merupakan pembuat sah (owner) dari konten spot/review yang ingin dikelola.
- **Post-conditions**:
    - Data konten diperbarui di Firestore (untuk aksi edit) atau dihapus dari koleksi (untuk aksi hapus).
    - Jika review dihapus, rata-rata rating spot dihitung ulang dan kontribusi XP yang diterima sebelumnya disesuaikan.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman detail spot di mana konten pribadinya (misal: review miliknya) berada.
2. **Sistem** menampilkan ikon menu opsi (titik tiga) di samping kanan baris review milik aktor tersebut.
3. **Aktor** menekan ikon opsi titik tiga.
4. **Sistem** menyajikan pilihan: "Edit Review" dan "Delete Review".
5. **Aktor** menekan opsi "Delete Review".
6. **Sistem** menampilkan dialog konfirmasi keamanan: "Apakah Anda yakin ingin menghapus ulasan ini secara permanen? Tindakan ini tidak dapat dibatalkan."
7. **Aktor** menekan tombol "Ya, Hapus".
8. **Sistem** menghapus dokumen review dari Firestore.
9. **Sistem** memicu penyesuaian:
    - Melakukan kalkulasi ulang rata-rata rating spot tersebut.
    - Menyesuaikan (mengurangi) XP Member sesuai dengan nilai XP review yang terhapus.
10. **Sistem** memperbarui visual halaman dengan menghapus baris review tersebut dari layar aktor.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Page as Spot Detail UI
    participant Mod as Confirm Dialog
    participant API as System (API/Firestore)

    User->>Page: Klik opsi menu (titik tiga) pada review miliknya
    Page-->>User: Tampilkan pilihan (Edit / Delete)
    User->>Page: Klik "Delete Review"
    Page->>Mod: Tampilkan modal konfirmasi hapus
    User->>Mod: Konfirmasi "Ya, Hapus"
    Mod->>API: Kirim request hapus (reviewId, userId)
    API->>API: Verifikasi kepemilikan (review.userId == request.userId)
    alt Owner Sah (Terverifikasi)
        API->>API: Hapus dokumen review dari Firestore
        API->>API: Hitung ulang rating rata-rata spot
        API->>API: Kurangi XP user (penyesuaian kontribusi)
        API-->>Mod: Response sukses hapus
        Mod->>Page: Hapus review dari list visual
        Page-->>User: Tampilkan toast "Ulasan berhasil dihapus"
    else Tidak Sah / Tidak Ada Akses
        API-->>Mod: Response Gagal (Unauthorized 403)
        Mod-->>User: Tampilkan pesan error "Aksi tidak diizinkan"
    end
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Pengeditan Konten (Edit Review)**
    1. Pengguna memilih opsi "Edit Review".
    2. Sistem membuka modal ulasan yang telah terisi data bintang dan teks ulasan lama.
    3. Pengguna mengubah teks ulasan atau jumlah bintang, lalu menekan "Update".
    4. Sistem memperbarui dokumen di Firestore, menghitung ulang rata-rata rating spot, dan langsung menampilkan ulasan versi terbaru di UI.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Mencoba Mengedit Spot Terverifikasi**
    1. Member mencoba mengedit spot yang ia buat tetapi status spot tersebut sudah diverifikasi (`approved` atau diklaim oleh Business Owner).
    2. Sistem menyembunyikan opsi edit dan menampilkan pesan informatif: "Spot ini sudah diverifikasi resmi. Perubahan informasi hanya dapat dilakukan oleh Business Owner terdaftar atau Admin."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-35**: Member hanya diizinkan mengedit spot yang berstatus `pending`. Jika spot sudah disetujui (`approved`) atau diklaim oleh pemilik usaha, hak edit dipindahkan sepenuhnya ke Business Owner dan Admin.
- **BR-36**: Menghapus review akan mengurangi total XP pengguna sebanyak poin yang pernah didapatkan dari ulasan tersebut (biasanya -10 XP, dan -5 XP per media terlampir).

---

### 6. Catatan UI/UX
- Modal konfirmasi penghapusan menggunakan warna tombol merah menyala (destructive color) untuk menghindari kesalahan klik yang tidak disengaja.
- Opsi edit/hapus hanya muncul pada baris review yang ID pembuatnya cocok dengan ID pengguna yang sedang masuk (Client-side permission check).
- Pengeditan data menggunakan animasi transisi yang halus tanpa memuat ulang (reload) seluruh halaman aplikasi.

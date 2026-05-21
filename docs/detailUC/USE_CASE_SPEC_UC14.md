# 📄 Spesifikasi Detail Use Case: UC-14
## Save Favorites (Menyukai & Koleksi Favorit)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-14 |
| **Nama Use Case** | Save Favorites (Menyukai & Koleksi Favorit) |
| **Aktor Utama** | Member |
| **Deskripsi** | Member menyukai (like) atau menyimpan (bookmark) suatu spot ke dalam daftar favorit pribadi agar dapat diakses kembali dengan cepat. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
    - Member sedang membuka detail spot tujuan.
- **Post-conditions**:
    - Spot ID tersimpan dalam koleksi favorit Member di database Firestore.
    - Jumlah like (likes count) pada dokumen spot bertambah (+1).
    - Pemilik/Pembuat spot awal menerima reward sebesar 2 XP.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman detail spot (misal: "Kopi Kenangan").
2. **Sistem** menampilkan ikon "Heart" atau "Bookmark" dalam keadaan kosong (outline) jika spot belum difavoritkan.
3. **Aktor** menekan ikon tersebut.
4. **Sistem** mengubah tampilan ikon secara instan menjadi berwarna penuh/aktif (fill color).
5. **Sistem** melakukan update ke Firestore:
    - Menambahkan dokumen baru di koleksi `favorites` dengan memetakan `userId` dan `spotId`.
    - Melakukan inkrementasi (+1) pada field `likesCount` di dokumen spot.
6. **Sistem** mengidentifikasi pengaju awal spot tersebut (`createdBy`) dan menambahkan 2 XP ke profil pembuat spot sebagai reward menerima like.
7. **Sistem** menampilkan notifikasi toast kecil konfirmasi keberhasilan menyimpan.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Page as Spot Detail Page
    participant API as System (API/Firestore)
    participant Submitter as Spot Creator Profile

    User->>Page: Klik ikon "Favorite" (Heart)
    Page->>Page: Ubah ikon (Outline -> Filled) - Optimistic Update
    Page->>API: Toggle Favorite (userId, spotId)
    API->>API: Cek status favorit saat ini
    alt Belum Favorit (Aksi: Like & Save)
        API->>API: Simpan data favorit ke koleksi 'favorites'
        API->>API: Inkrementasi likesCount (+1) pada Spot Document
        API->>Submitter: Tambahkan 2 XP ke akun pembuat spot
        API-->>Page: Response Sukses (Liked)
    else Sudah Favorit (Aksi: Unlike & Unsave)
        API->>API: Hapus data favorit dari koleksi 'favorites'
        API->>API: Dekrementasi likesCount (-1) pada Spot Document
        API->>Submitter: Kurangi 2 XP dari akun pembuat spot
        API-->>Page: Response Sukses (Unliked)
    end
    Page-->>User: Update state ikon visual permanen
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Menghapus dari Favorit (Unlike/Unfavorite)**
    1. Pengguna mengklik ikon "Heart" yang sudah aktif/berwarna penuh.
    2. Sistem mengubah ikon kembali ke bentuk outline.
    3. Sistem menghapus dokumen relasi di koleksi `favorites`, mendeskresikan `likesCount` spot (-1), dan mengurangi 2 XP dari pembuat spot asal.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Kegagalan Sinkronisasi Firebase**
    1. Koneksi jaringan terputus setelah ikon ditekan.
    2. API Firestore mengembalikan error.
    3. Sistem mengembalikan status ikon visual ke posisi semula (rollback optimistic update) dan memunculkan pesan error: "Gagal menyimpan ke favorit. Periksa koneksi internet Anda."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-32**: Aksi menyukai spot memberikan kontribusi langsung ke profil pembuat spot asli dengan memberikan **2 XP** per like yang diterima (UC-11).
- **BR-33**: Data favorit bersifat pribadi dan hanya dapat dibaca oleh pemilik akun terkait melalui menu dashboard/profil mereka sendiri.
- **BR-34**: Setiap Like menaikkan skor "Trending" spot bersangkutan sebanyak **1 poin** (UC-16).

---

### 6. Catatan UI/UX
- Menggunakan transisi mikro-animasi pada ikon hati (seperti efek membesar/denyut kilat kecil "pop effect" saat diklik).
- Menggunakan strategi "Optimistic UI Update" di mana ikon langsung berubah warna sebelum server merespon sukses untuk memberikan kesan aplikasi berjalan instan tanpa lag.
- Daftar koleksi favorit tertata rapi di halaman profil pengguna dengan dukungan navigasi cepat satu klik.

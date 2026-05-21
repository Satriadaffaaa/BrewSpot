# 📄 Spesifikasi Detail Use Case: UC-13
## View Leaderboard Global

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-13 |
| **Nama Use Case** | View Leaderboard Global |
| **Aktor Utama** | Member |
| **Deskripsi** | Member melihat daftar peringkat (leaderboard) global 50 kontributor teratas di platform Lokali berdasarkan akumulasi total XP yang dikumpulkan. |
| **Prioritas** | Low (Nice to Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login).
    - Database Firestore terisi data XP pengguna.
- **Post-conditions**:
    - Daftar ranking 50 kontributor dengan XP tertinggi tertampil secara teratur.
    - Posisi ranking dan XP pengguna yang sedang aktif terlihat jelas di bagian bawah/atas halaman jika ia tidak masuk dalam 50 besar.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman "Leaderboard" melalui menu navigasi utama.
2. **Sistem** melakukan query ke Firestore pada koleksi `users` terurut menurun (descending) berdasarkan field `xp` dengan limit 50 dokumen.
3. **Sistem** memproses daftar data untuk mendapatkan urutan peringkat ke-1 sampai ke-50.
4. **Sistem** mengecek apakah pengguna yang aktif saat ini termasuk dalam daftar 50 besar tersebut.
5. **Sistem** merender tampilan Leaderboard:
    - Urutan 3 teratas ditampilkan dengan desain khusus (Gold, Silver, Bronze badges/podium).
    - Daftar baris peringkat ke-4 hingga ke-50.
6. **Sistem** menampilkan widget mengambang (sticky widget) di bagian bawah layar yang menunjukkan profil, XP, dan posisi peringkat aktual aktor saat ini jika ia berada di peringkat > 50.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Page as Leaderboard Page
    participant API as System (API/Firestore)

    User->>Page: Klik menu "Leaderboard"
    Page->>API: Query 50 User Teratas (Order By XP Desc)
    API-->>Page: Return list 50 User Teratas
    Page->>API: Query peringkat spesifik User Aktif
    API-->>Page: Return ranking & XP User Aktif
    Page->>Page: Render podium (top 3) & list (4-50)
    Page-->>User: Tampilkan papan peringkat global & status posisi user
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Penyaringan Berdasarkan Wilayah (Regional Leaderboard)**
    1. Member menekan opsi filter wilayah (misal: "Berdasarkan Kota").
    2. Sistem menyaring daftar pengguna yang memiliki atribut lokasi kota yang sama.
    3. Sistem memuat ulang 50 peringkat teratas khusus wilayah tersebut.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Kegagalan Koneksi Database**
    1. Papan peringkat tidak dapat memuat data karena gangguan jaringan.
    2. Sistem menampilkan spinner tanpa akhir atau menampilkan tombol "Coba Lagi" disertai pesan kegagalan pemuatan.

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-30**: Skor XP diperbarui secara real-time setiap kali Member menyelesaikan aktivitas yang bernilai XP (UC-04, UC-05, UC-06, UC-14).
- **BR-31**: Apabila terdapat dua pengguna dengan jumlah XP yang sama persis, peringkat ditentukan berdasarkan tanggal pembuatan akun paling lama (prioritas pendaftar terdahulu).

---

### 6. Catatan UI/UX
- Tiga peringkat teratas menggunakan ilustrasi mahkota atau medali berwarna emas, perak, perunggu dengan ukuran foto profil yang lebih besar.
- Menggunakan animasi transisi baris (staggered animation) saat daftar peringkat pertama kali dimuat.
- Posisi baris pengguna aktif disorot dengan warna latar belakang yang berbeda (misal: warna primer semi-transparan) agar mudah ditemukan secara instan.

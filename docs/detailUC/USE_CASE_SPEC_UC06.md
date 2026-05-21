# 📄 Spesifikasi Detail Use Case: UC-06
## Check-in Geolocation

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-06 |
| **Nama Use Case** | Check-in Geolocation |
| **Aktor Utama** | Member |
| **Deskripsi** | Member melakukan check-in di lokasi fisik suatu spot menggunakan koordinat GPS perangkat untuk memvalidasi kunjungannya dan mendapatkan reward XP. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Member telah terautentikasi (login) pada aplikasi mobile/web.
    - Sensor GPS perangkat aktif dan izin akses lokasi diberikan oleh pengguna.
    - Member berada dalam radius fisik dekat dengan spot (< 100 meter).
- **Post-conditions**:
    - Aktivitas check-in tercatat di koleksi database check-in history.
    - Counter check-in spot bertambah, memicu pembaruan skor "Trending" (UC-16).
    - Akun Member mendapatkan reward sebesar 20 XP.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman detail spot yang sedang dikunjunginya.
2. **Sistem** menampilkan tombol "Check-in" (jika cooldown 18 jam tidak aktif).
3. **Aktor** menekan tombol "Check-in".
4. **Sistem** meminta akses koordinat GPS real-time dari API Geolocation browser/perangkat.
5. **Sistem** menerima data koordinat (Latitude, Longitude) beserta timestamp.
6. **Sistem** memverifikasi keaktualan GPS (harus kurang dari 1 menit sejak ditangkap).
7. **Sistem** menghitung jarak geodesik antara koordinat GPS perangkat dengan koordinat spot di database menggunakan rumus Haversine.
8. **Sistem** memverifikasi jarak (harus kurang dari 100 meter).
9. **Sistem** memvalidasi batasan cooldown check-in (maksimal 1 kali per 18 jam untuk spot yang sama).
10. **Sistem** mencatat transaksi check-in di Firestore.
11. **Sistem** menambahkan 20 XP ke profil Member.
12. **Sistem** memperbarui status tombol menjadi "Checked In" dengan tampilan cooldown.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Member
    participant Page as Spot Detail Page
    participant GPS as Device GPS API
    participant API as System (API/Firestore)

    User->>Page: Klik "Check-in"
    Page->>GPS: Request Lokasi Saat Ini (Lat, Lng)
    GPS-->>Page: Return Koordinat & Timestamp
    Page->>API: Kirim data lokasi & Spot ID
    API->>API: Verifikasi kesegaran koordinat (< 1 menit)
    API->>API: Hitung jarak koordinat vs Spot (< 100m)
    API->>API: Cek Cooldown 18 Jam untuk user & spot ini
    alt Valid (Jarak < 100m & Cooldown Lolos)
        API->>API: Catat Check-in di DB
        API->>API: Update Counter Check-in Spot
        API->>API: Tambahkan 20 XP ke Profile User
        API-->>Page: Response Sukses (XP Earned)
        Page-->>User: Tampilkan dialog sukses "Anda berhasil Check-in!"
    else Jarak > 100m
        API-->>Page: Response Gagal (Terlalu Jauh)
        Page-->>User: Tampilkan error "Anda berada di luar jangkauan (maks 100m)"
    else Cooldown Aktif (< 18 Jam)
        API-->>Page: Response Gagal (Cooldown)
        Page-->>User: Tampilkan error "Anda baru saja check-in di spot ini"
    end
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif yang signifikan.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Izin Lokasi Ditolak (Permission Denied)**
    1. Pengguna menolak izin akses lokasi browser/aplikasi.
    2. Sistem menampilkan pesan error: "Akses lokasi ditolak. Aktifkan GPS dan izinkan Lokali untuk mengakses lokasi Anda guna melakukan check-in."
- **E2: Sinyal GPS Lemah / Timeout**
    1. Sistem gagal mendapatkan koordinat akurat dalam batas waktu 10 detik.
    2. Sistem membatalkan proses dan menampilkan pesan: "Gagal mendapatkan lokasi Anda. Pastikan Anda berada di area terbuka dan coba lagi."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-14**: Jarak maksimum untuk melakukan check-in yang sah adalah **100 meter** dari koordinat spot yang terdaftar.
- **BR-15**: Koordinat GPS yang dikirim harus segar (umur data < **1 menit**) untuk mencegah spoofing lokasi menggunakan log lama.
- **BR-16**: Cooldown check-in pada spot yang sama adalah **18 jam** per member. Poin XP dibatasi maksimal 1 kali per hari per spot.
- **BR-17**: Reward check-in sukses adalah **20 XP**.

---

### 6. Catatan UI/UX
- Tombol check-in menggunakan indikator loading berputar saat GPS sedang membaca posisi perangkat.
- Jika pengguna sudah check-in, tombol berubah warna (misal dari solid primary menjadi muted outline) dan menampilkan countdown sisa waktu cooldown.
- Menggunakan modal animasi sukses bertema peta/lokasi dengan confetti halus saat verifikasi GPS berhasil.

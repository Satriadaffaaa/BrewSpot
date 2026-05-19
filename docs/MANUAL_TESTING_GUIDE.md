# Lokali: Manual Testing & QA Guide 🧪

Dokumen ini berisi daftar periksa (checklist) untuk melakukan pengujian manual sebelum aplikasi dideploy ke production. Pengujian dibagi berdasarkan peran pengguna (Role) dan alur fitur utama.

---

## 👥 1. Role: GUEST (Unauthenticated)
*Tujuan: Memastikan pengalaman pengguna baru lancar dan tidak ada kebocoran data.*

- [ ] **Home Page:** Slider, kategori, dan trending section muncul dengan benar.
- [ ] **Explore Map:** Mapbox muncul, marker spot terlihat, dan filter (Kota, Harga, dll) berfungsi.
- [ ] **Spot Detail:** Bisa melihat detail tempat, review, dan foto tanpa login.
- [ ] **Auth Navigation:** Klik tombol "Add Spot" atau "Like" mengarahkan user ke halaman Login.
- [ ] **Register:** Berhasil membuat akun baru dan diarahkan ke Dashboard/Explore.
- [ ] **Forgot Password:** Email reset password terkirim saat diminta.

---

## 👤 2. Role: USER (Authenticated)
*Tujuan: Memastikan fitur interaksi dan gamifikasi berjalan sesuai standar.*

- [ ] **Add BrewSpot:**
    - [ ] Berhasil memilih kategori & lokasi di peta.
    - [ ] Alamat terisi otomatis (Reverse Geocoding).
    - [ ] Foto berhasil diupload ke Cloudinary.
    - [ ] Setelah submit, muncul halaman sukses dan status spot "Pending".
- [ ] **Reviews & Vibe Check:**
    - [ ] Berhasil memberikan rating & review teks.
    - [ ] Review muncul di list setelah disubmit.
    - [ ] Check limit harian (Maks 5 review/hari).
- [ ] **Gamification:**
    - [ ] XP bertambah setelah melakukan aksi (Review, Add Spot).
    - [ ] Badge terbuka jika syarat terpenuhi (cek di Profile).
    - [ ] Nama muncul di Leaderboard.
- [ ] **Profile:** Berhasil mengedit nama dan foto profil.
- [ ] **Like System:** Bisa toggle like/unlike dan jumlah like di card terupdate.

---

## 🏢 3. Role: BUSINESS OWNER
*Tujuan: Memastikan fitur verifikasi dan pengelolaan spot resmi berfungsi.*

- [ ] **Verification Request:** Berhasil mengunggah dokumen KTP/NIB untuk verifikasi owner.
- [ ] **Claim Spot:** Berhasil mengajukan klaim kepemilikan pada spot yang sudah ada.
- [ ] **Owner Dashboard:** Bisa melihat list spot yang dimiliki secara eksklusif.
- [ ] **Edit Official Info:** Bisa mengupdate Menu URL atau Foto Official pada spot yang sudah diverifikasi.

---

## 🛡️ 4. Role: ADMIN
*Tujuan: Memastikan kontrol penuh atas platform dan keamanan konten.*

- [ ] **Admin Guard:** Pastikan user biasa tidak bisa mengetik `/admin` di URL (harus mental ke home).
- [ ] **Spot Approval:**
    - [ ] Melihat antrean spot pending.
    - [ ] Menyetujui spot (status berubah jadi "Approved" & muncul di Map).
    - [ ] Menolak spot dengan alasan.
- [ ] **User Management:**
    - [ ] Bisa melihat detail user, XP log, dan catatan internal.
    - [ ] Fitur Banned/Suspend berfungsi (User yang diban tidak bisa login/akses fitur).
- [ ] **Content Moderation:** Bisa menyembunyikan review yang melanggar aturan.
- [ ] **Verification Queue:** Menyetujui/Menolak permintaan Business Owner & Claim Spot.

---

## ⚡ 5. Technical & Edge Cases
- [ ] **Hydration:** Tidak ada warning kuning di Console Browser terkait "Hydration Mismatch".
- [ ] **Responsive Design:** Cek tampilan di Mobile (Chrome DevTools) untuk Header, Map, dan Form.
- [ ] **Empty States:** Cek tampilan jika hasil search kosong atau user belum punya review.
- [ ] **Error Handling:** Matikan internet sebentar dan pastikan aplikasi tidak crash (muncul pesan error yang sopan).
- [ ] **Performance:** Pastikan loading state (Skeleton) muncul saat fetching data lambat.

---

## 📝 Catatan Pengujian
- **Browser:** Chrome, Safari, Firefox.
- **Device:** Android, iOS, Desktop.
- **Environment:** Localhost / Staging URL.

# 📄 Dokumen Spesifikasi Use Case Komprehensif - Lokali 📍

Dokumen ini menyajikan seluruh skenario penggunaan platform **Lokali** secara mendalam dengan standar dokumentasi sistem informasi, mencakup prasyarat, alur kerja detail, dan kondisi akhir.

---

## 👥 Profil Aktor

| Aktor | Peran Utama |
| :--- | :--- |
| **Visitor** | Pengguna anonim yang mencari informasi dan eksplorasi lokasi. |
| **Member** | Kontributor terdaftar yang memberikan spot, review, dan melakukan check-in. |
| **Business Owner** | Pengguna yang memiliki hak kelola atas profil bisnis resmi. |
| **Admin** | Pengelola sistem, moderator konten, dan analis data platform. |

---

## 🛠️ Penelusuran Skenario Mendalam (UC-01 s/d UC-22)

### UC-01: Pencarian Lokasi dengan MapCn
- **Aktor**: Visitor, Member
- **Tujuan**: Menemukan lokasi spesifik atau area tujuan di peta.
- **Pre-condition**: Pengguna berada pada halaman eksplorasi dengan peta yang aktif.
- **Alur Utama**:
  1. Pengguna memfokuskan kursor pada kolom pencarian.
  2. Pengguna mengetikkan nama lokasi atau kategori (misal: "Cafe").
  3. Sistem memberikan saran autocomplete secara real-time dari database.
  4. Pengguna memilih salah satu hasil pencarian.
  5. Peta melakukan transisi visual (fly-to) menuju koordinat lokasi tersebut.
  6. Sistem menampilkan Marker aktif dan Card Preview berisi informasi ringkas.
- **Post-condition**: Lokasi tujuan tertampil jelas di peta dan siap untuk dieksplorasi lebih lanjut.

---

### UC-02: Filter Berbasis Kategori & Tags
- **Aktor**: Visitor, Member
- **Tujuan**: Mempersempit hasil pencarian sesuai preferensi tertentu.
- **Pre-condition**: Peta menampilkan berbagai marker lokasi.
- **Alur Utama**:
  1. Pengguna menekan tombol "Filter".
  2. Sistem menampilkan daftar kategori (Food, Sightseeing, Hangout) dan Tags (Hidden Gem, Viral, Work-friendly).
  3. Pengguna memilih satu atau beberapa filter sekaligus.
  4. Sistem melakukan query ulang pada database berdasarkan kriteria pilihan.
  5. Peta memperbarui marker yang muncul hanya sesuai dengan filter yang dipilih.
- **Post-condition**: Pengguna melihat daftar lokasi yang lebih relevan dengan kebutuhannya.

---

### UC-03: AI Vibe Check (Ringkasan Review)
- **Aktor**: Visitor, Member
- **Tujuan**: Mendapatkan ringkasan suasana tempat tanpa membaca seluruh review manual.
- **Pre-condition**: Spot memiliki minimal 3 review dari pengguna.
- **Alur Utama**:
  1. Pengguna membuka halaman detail spot tertentu.
  2. Pengguna menavigasi ke bagian "AI Vibe Check".
  3. Sistem menampilkan ringkasan otomatis yang dihasilkan oleh Gemini AI.
  4. Ringkasan mencakup: "Pros" (Keunggulan), "Cons" (Kekurangan), dan "The Verdict" (Kesimpulan suasana).
- **Post-condition**: Pengguna mendapatkan gambaran cepat mengenai kecocokan tempat dengan selera mereka.

---

### UC-04: Menambahkan Spot Baru
- **Aktor**: Member
- **Tujuan**: Memperkaya database lokasi platform.
- **Pre-condition**: Member telah login dan memiliki koneksi internet stabil.
- **Alur Utama**:
  1. Member menekan tombol "Add Spot" di dashboard atau peta.
  2. Member mengisi formulir data (Nama, Alamat, Kota, Jam Operasional, dan Fasilitas).
  3. Member menentukan lokasi koordinat secara presisi pada peta.
  4. Member mengunggah foto-foto autentik lokasi ke Cloudinary.
  5. Sistem (AI) memproses deskripsi dan foto untuk memberikan saran tag tambahan otomatis.
  6. Member menekan "Submit".
- **Post-condition**: Data spot tersimpan dengan status `pending` (atau `approved` jika Member memiliki role Contributor terpercaya).

---

### UC-05: Memberikan Review & Rating
- **Aktor**: Member
- **Tujuan**: Memberikan testimoni dan penilaian atas pengalaman di lokasi.
- **Pre-condition**: Member telah login dan berada di halaman detail spot.
- **Alur Utama**:
  1. Member menekan tombol "Add Review".
  2. Member memilih skala bintang (1-5).
  3. Member menuliskan opini atau cerita singkat mengenai kunjungan mereka.
  4. Member mengunggah foto atau video pendek sebagai bukti kunjungan.
  5. Member menekan "Post Review".
  6. Sistem memvalidasi isi review terhadap filter kata-kata kasar/spam secara otomatis.
- **Post-condition**: Review tampil secara publik, rating rata-rata spot diperbarui, dan Member mendapatkan reward XP.

---

### UC-06: Check-in Geolocation
- **Aktor**: Member
- **Tujuan**: Memvalidasi kehadiran fisik untuk keperluan gamifikasi dan popularitas spot.
- **Pre-condition**: Member berada di lokasi fisik dan mengaktifkan izin GPS.
- **Alur Utama**:
  1. Member membuka detail spot yang sedang dikunjungi.
  2. Member menekan tombol "Check-in".
  3. Sistem mengambil koordinat GPS perangkat secara real-time.
  4. Sistem menghitung jarak antara koordinat perangkat dengan koordinat spot di database.
  5. Jika jarak < 100 meter, sistem mencatat check-in tersebut.
- **Post-condition**: Counter check-in spot bertambah, status spot naik di algoritma "Trending", dan Member mendapatkan XP validasi.

---

### UC-07: Pengajuan Klaim Kepemilikan Spot
- **Aktor**: Member (Calon Business Owner)
- **Tujuan**: Mendapatkan hak kelola resmi atas profil bisnis.
- **Pre-condition**: Spot belum diklaim oleh orang lain.
- **Alur Utama**:
  1. Member menekan tombol "Claim this Spot" pada detail lokasi.
  2. Member mengunggah bukti legalitas kepemilikan (NIB, KTP, atau Foto Lokasi dengan spanduk nama).
  3. Member mengisi informasi kontak bisnis yang valid.
  4. Member mengirimkan pengajuan klaim.
- **Post-condition**: Pengajuan masuk ke antrean verifikasi Admin dengan status `waiting_verification`.

---

### UC-08: Manajemen Menu Resmi & Foto Official
- **Aktor**: Business Owner
- **Tujuan**: Menyediakan informasi produk dan visual resmi yang akurat.
- **Pre-condition**: Akun telah diverifikasi sebagai Business Owner untuk spot terkait.
- **Alur Utama**:
  1. Owner masuk ke Dashboard Bisnis.
  2. Owner memilih menu "Official Content".
  3. Owner mengunggah daftar menu terbaru (PDF/Image) dan foto profesional interior/eksterior.
  4. Owner menekan "Update Info".
  5. Sistem memperbarui tampilan spot dengan badge "Verified" dan menu yang dikunci hanya untuk Owner.
- **Post-condition**: Informasi resmi tertampil kepada seluruh user dan tidak dapat diubah oleh member biasa.

---

### UC-09: Moderasi Konten (Admin)
- **Aktor**: Admin
- **Tujuan**: Menjamin kualitas data dan kenyamanan komunitas.
- **Pre-condition**: Terdapat konten baru atau konten yang dilaporkan.
- **Alur Utama**:
  1. Admin membuka Dashboard Moderasi.
  2. Admin meninjau antrean spot baru, review baru, atau foto yang diunggah.
  3. Admin menekan tombol "Approve" (Setujui), "Reject" (Tolak), atau "Hide" (Sembunyikan).
  4. Jika ditolak/disembunyikan, Admin memberikan alasan singkat.
- **Post-condition**: Konten dipublikasikan atau dihapus dari tampilan publik secara permanen/sementara.

---

### UC-10: Pelaporan Konten (Report System)
- **Aktor**: Member, Admin
- **Tujuan**: Memberikan sarana pengawasan komunitas terhadap konten negatif.
- **Pre-condition**: Member menemukan konten yang dianggap melanggar aturan.
- **Alur Utama**:
  1. Member menekan ikon "Report" pada spot, review, atau foto.
  2. Member memilih kategori pelanggaran (Spam, Harassment, Misleading, Inappropriate).
  3. Member memberikan deskripsi tambahan (opsional).
  4. Member mengirimkan laporan.
- **Post-condition**: Laporan masuk ke antrean prioritas tinggi di Dashboard Admin untuk segera ditindaklanjuti.

---

### UC-11: Manajemen Profil & Visualisasi Progress
- **Aktor**: Member
- **Tujuan**: Mengelola identitas digital dan melihat hasil kontribusi.
- **Pre-condition**: Member telah login.
- **Alur Utama**:
  1. Member membuka halaman "Profile".
  2. Sistem menampilkan statistik kontribusi (Reviews, Spots, Likes).
  3. Sistem menampilkan progress bar XP menuju level berikutnya.
  4. Member menekan tombol "Edit Profile" untuk mengubah foto profil, bio, dan sosial media.
  5. Member menekan "Save".
- **Post-condition**: Profil diperbarui dan Member mendapatkan gambaran jelas atas status mereka di komunitas.

---

### UC-12: Riwayat Kontribusi (My Activity)
- **Aktor**: Member
- **Tujuan**: Melacak status kontribusi yang pernah dilakukan.
- **Pre-condition**: Member memiliki riwayat kontribusi spot atau review.
- **Alur Utama**:
  1. Member menavigasi ke bagian "My Contributions" di halaman profil.
  2. Sistem menampilkan daftar Spot yang pernah diajukan beserta statusnya (Pending/Approved/Rejected).
  3. Member melihat daftar Review yang pernah ditulis beserta jumlah upvote yang didapat.
- **Post-condition**: Member mendapatkan informasi transparan mengenai status kontribusi mereka.

---

### UC-13: Leaderboard Global & Ranking
- **Aktor**: Member
- **Tujuan**: Meningkatkan keterlibatan melalui kompetisi sehat.
- **Pre-condition**: Sistem telah melakukan kalkulasi XP mingguan/bulanan.
- **Alur Utama**:
  1. Member membuka halaman "Leaderboard".
  2. Sistem menampilkan daftar 50 Member dengan XP tertinggi secara global.
  3. Member dapat melihat posisi peringkat mereka sendiri di antara kontributor lain.
  4. Member dapat mengklik profil user lain untuk melihat detail pencapaiannya.
- **Post-condition**: Member termotivasi untuk meningkatkan kontribusi guna naik peringkat.

---

### UC-14: Menyukai (Like) & Koleksi Favorit
- **Aktor**: Member
- **Tujuan**: Menyimpan lokasi untuk referensi kunjungan di masa depan.
- **Pre-condition**: Member telah login.
- **Alur Utama**:
  1. Member membuka detail spot yang menarik perhatian.
  2. Member menekan ikon "Heart" atau "Bookmark".
  3. Sistem menyimpan ID spot tersebut ke dalam daftar koleksi pribadi Member.
  4. Sistem memberikan feedback visual berupa ikon yang berubah warna.
- **Post-condition**: Spot tersimpan di daftar "Favorites" dan dapat diakses cepat dari halaman profil.

---

### UC-15: Pengeditan & Penghapusan Konten Pribadi
- **Aktor**: Member
- **Tujuan**: Mengoreksi atau menarik kembali kontribusi yang pernah diberikan.
- **Pre-condition**: Member adalah pemilik sah dari konten (Review/Spot) tersebut.
- **Alur Utama**:
  1. Member membuka konten yang ingin dikelola.
  2. Member menekan menu opsi (titik tiga) dan memilih "Edit" atau "Delete".
  3. Jika Edit: Member mengubah data dan menekan "Update".
  4. Jika Delete: Member mengonfirmasi penghapusan permanen.
- **Post-condition**: Data di database diperbarui atau dihapus secara permanen dari tampilan publik.

---

### UC-16: Penelusuran Trending Spots Discovery
- **Aktor**: Visitor, Member
- **Tujuan**: Menemukan lokasi yang sedang populer di komunitas.
- **Pre-condition**: Sistem telah memproses data check-in dalam 7 hari terakhir.
- **Alur Utama**:
  1. Pengguna membuka halaman utama atau tab "Trending".
  2. Sistem menampilkan daftar spot dengan jumlah check-in valid tertinggi dalam periode waktu tertentu.
  3. Pengguna melihat label "Trending" pada marker di peta.
- **Post-condition**: Pengguna mendapatkan rekomendasi lokasi populer secara objektif berdasarkan aktivitas komunitas.

---

### UC-17: Analitik Kunjungan Bisnis
- **Aktor**: Business Owner
- **Tujuan**: Memantau performa lokasi dari perspektif data.
- **Pre-condition**: Akun terverifikasi sebagai Business Owner.
- **Alur Utama**:
  1. Owner masuk ke Dashboard Bisnis.
  2. Owner memilih tab "Analytics".
  3. Sistem menampilkan grafik "Views Count" (Berapa kali spot dilihat) dan "Check-in Count" (Berapa kali user datang).
  4. Owner dapat memfilter data berdasarkan hari, minggu, atau bulan.
- **Post-condition**: Owner memiliki data akurat untuk mengevaluasi strategi pemasaran bisnis mereka.

---

### UC-18: Verifikasi Klaim Bisnis (Admin)
- **Aktor**: Admin
- **Tujuan**: Memastikan integritas data kepemilikan bisnis.
- **Pre-condition**: Terdapat pengajuan klaim baru dari pengguna.
- **Alur Utama**:
  1. Admin membuka menu "Business Claims" di Dashboard Admin.
  2. Admin meninjau dokumen legalitas yang diunggah oleh pengaju.
  3. Admin melakukan verifikasi manual (menghubungi kontak atau cek database resmi).
  4. Admin menekan tombol "Approve" atau "Reject" dengan catatan.
- **Post-condition**: Jika disetujui, role pengaju berubah menjadi Business Owner dan spot mendapatkan label "Verified Business".

---

### UC-19: AI Control Panel (Manual Re-sync)
- **Aktor**: Admin
- **Tujuan**: Mengelola mesin AI dan memastikan hasil ringkasan akurat.
- **Pre-condition**: Admin mendeteksi anomali pada ringkasan AI atau tags suatu spot.
- **Alur Utama**:
  1. Admin masuk ke menu "AI Management".
  2. Admin memilih ID Spot yang ingin disinkronisasi ulang.
  3. Admin menekan tombol "Force Re-generate AI Vibe Check".
  4. Sistem memanggil Gemini API untuk memproses ulang seluruh database review spot tersebut.
  5. Sistem memperbarui metadata AI di database.
- **Post-condition**: Tampilan ringkasan AI pada spot tersebut menjadi lebih segar dan akurat.

---

### UC-20: Dashboard Analitik Pertumbuhan Platform
- **Aktor**: Admin
- **Tujuan**: Monitoring kesehatan dan pertumbuhan ekosistem platform.
- **Pre-condition**: Admin telah login.
- **Alur Utama**:
  1. Admin membuka menu "Growth Analytics".
  2. Sistem menyajikan grafik pertumbuhan: User Registrations, Total Reviews, dan Approved Spots.
  3. Admin melihat persebaran geografis aktivitas user melalui Heatmap.
  4. Admin mengamati tren kenaikan level rata-rata pengguna.
- **Post-condition**: Admin memiliki basis data kuat untuk perencanaan pengembangan platform di masa depan.

---

### UC-21: Monitoring Log Pencarian (Search Trends)
- **Aktor**: Admin
- **Tujuan**: Mengidentifikasi kesenjangan data antara kebutuhan user dan ketersediaan konten.
- **Pre-condition**: Pengguna telah melakukan aktivitas pencarian di platform.
- **Alur Utama**:
  1. Admin membuka menu "Search Insight".
  2. Sistem menampilkan daftar query pencarian yang paling sering digunakan.
  3. Admin mengamati daftar "Missed Searches" (Kata kunci yang dicari user namun tidak ada hasilnya).
  4. Admin menganalisis lokasi atau kota yang paling banyak dicari namun masih minim database spot.
- **Post-condition**: Admin dapat mengarahkan tim komunitas untuk memperbanyak database di area/kategori yang diminati user.

---

### UC-22: Snapshot Statistik Harian
- **Aktor**: Admin (Sistem)
- **Tujuan**: Mencatat riwayat performa data secara periodik untuk laporan historis.
- **Pre-condition**: Sistem berjalan normal dan mencapai waktu pergantian hari (00:00).
- **Alur Utama**:
  1. Sistem secara otomatis menjalankan skrip agregasi data harian.
  2. Sistem menghitung total entitas (Users, Spots, Reviews) saat itu.
  3. Sistem menghitung penambahan entitas baru dalam 24 jam terakhir.
  4. Sistem menyimpan hasil agregasi ke dalam koleksi `analytics_snapshots`.
- **Post-condition**: Tersedia data historis yang rapi untuk ditampilkan dalam grafik analitik bulanan/tahunan.

---

## 🤖 Logika Gamifikasi & Trust Score (Ringkasan)
- **Reward System**: Setiap aksi kontribusi divalidasi oleh sistem dan diberikan poin XP secara instan atau tertunda (menunggu moderasi).
- **Badge Achievement**: Pencapaian level tertentu atau kuantitas kontribusi tertentu akan membuka Badge secara otomatis yang tertampil di profil.
- **Moderasi Proaktif**: Sistem menggunakan AI untuk mendeteksi spam/kata kasar secara real-time sebelum Admin melakukan peninjauan manual.

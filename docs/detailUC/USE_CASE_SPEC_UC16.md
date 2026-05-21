# 📄 Spesifikasi Detail Use Case: UC-16
## Penelusuran Trending Spots Discovery

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-16 |
| **Nama Use Case** | Penelusuran Trending Spots Discovery |
| **Aktor Utama** | Visitor, Member |
| **Deskripsi** | Aktor menjelajahi daftar spot populer yang sedang ramai dikunjungi berdasarkan algoritma kalkulasi check-in, review baru, dan jumlah like dalam 7 hari terakhir. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Pengguna berada di halaman beranda (Home) atau menavigasi ke tab "Trending".
    - Database Firestore memiliki data riwayat check-in, review, dan like yang tercatat dalam 7 hari terakhir.
- **Post-conditions**:
    - Daftar spot terpopuler diurutkan berdasarkan skor tertinggi (minimal skor 50).
    - Marker spot yang sedang trending pada peta diberi label visual "Trending" yang menarik.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** mengakses tab "Trending Spots" pada halaman penjelajahan utama.
2. **Sistem** memicu query data statistik aktivitas 7 hari ke belakang.
3. **Sistem** menghitung skor popularitas (Trending Score) untuk setiap spot menggunakan formula yang ditentukan: `Score = (Check-ins * 5) + (New Reviews * 3) + (Likes * 1)`.
4. **Sistem** menyaring spot yang memiliki total skor minimal **50**.
5. **Sistem** mengurutkan daftar spot tersebut secara menurun (descending) dari skor tertinggi ke terendah.
6. **Sistem** merender antarmuka list dengan menampilkan kartu spot bertanda "Hot / Trending".
7. **Sistem** menampilkan ikon marker khusus (misal: ikon api atau pulse kuning) pada peta MapCn untuk spot-spot yang tergolong trending.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Visitor/Member
    participant Page as Explore Page
    participant API as System (API/Firestore)
    participant Map as MapCn Component

    User->>Page: Klik tab "Trending"
    Page->>API: Request daftar spot trending (7 hari terakhir)
    API->>API: Ambil data Check-ins, Reviews, & Likes
    API->>API: Hitung Trending Score per spot
    API->>API: Filter spot dengan Score >= 50
    API->>API: Urutkan Descending berdasarkan Score
    API-->>Page: Return list spot trending yang lolos ambang batas
    Page->>Map: Sorot marker trending dengan visual khusus (api/pulse)
    Page-->>User: Tampilkan layout grid Trending Spots
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Tidak Ada Spot yang Memenuhi Ambang Batas**
    1. Hasil kalkulasi trending score menunjukkan tidak ada satu pun spot yang mencapai skor >= 50.
    2. Sistem menyajikan rekomendasi fallback berupa spot dengan rating tertinggi keseluruhan (all-time top rated spots) dan menampilkan catatan informatif: "Belum ada spot yang trending minggu ini. Jelajahi rekomendasi terpopuler kami."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-37**: Rentang waktu analisis popularitas dibatasi pada **7 hari terakhir** (rolling 7 days) untuk memastikan keaktualan tren.
- **BR-38**: Formula Trending Score resmi:
    - Bobot Check-in: **5 poin** per check-in sah.
    - Bobot Review Baru: **3 poin** per ulasan baru.
    - Bobot Likes Baru: **1 poin** per like baru.
- **BR-39**: Batas minimum skor kelayakan masuk halaman trending adalah **50 poin**.

---

### 6. Catatan UI/UX
- Kartu spot trending memiliki badge animasi berkilau (shimmer badge) berwarna merah-oranye gradasi dengan ikon api (🔥).
- Marker di peta untuk spot trending didesain menggunakan animasi denyut (*pulse effect*) melingkar di sekeliling marker untuk menarik perhatian mata secara langsung.
- Transisi pemuatan list trending spots didukung oleh skeleton loading yang halus.

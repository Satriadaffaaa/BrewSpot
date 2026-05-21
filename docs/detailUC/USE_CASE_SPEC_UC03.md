# 📄 Spesifikasi Detail Use Case: UC-03
## AI Vibe Check (Ringkasan Review)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-03 |
| **Nama Use Case** | AI Vibe Check (Ringkasan Review) |
| **Aktor Utama** | Visitor, Member |
| **Deskripsi** | Aktor melihat ringkasan otomatis suasana (vibe) suatu lokasi yang di-generate menggunakan Gemini AI berdasarkan kumpulan review dari pengguna lain. |
| **Prioritas** | Medium (Should Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Pengguna berada di halaman detail spot.
    - Spot memiliki minimal 3 review aktif yang diunggah dalam 6 bulan terakhir.
- **Post-conditions**:
    - Ringkasan berupa "Pros", "Cons", dan "The Verdict" ditampilkan di tab AI Vibe Check.
    - Metadata waktu pembuatan AI summary tertampil untuk menunjukkan aktualitas data.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman detail spot tertentu (misal: "Brew & Co").
2. **Sistem** memuat halaman detail spot beserta tab informasi.
3. **Aktor** mengklik tab "AI Vibe Check".
4. **Sistem** mengecek ketersediaan data ringkasan AI yang sudah di-cache di dokumen spot.
5. **Sistem** menampilkan ringkasan visual yang terbagi menjadi pros (keunggulan), cons (kekurangan), dan kesimpulan akhir (verdict).
6. **Sistem** menampilkan stempel waktu kapan analisis AI terakhir diperbarui.

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor User as Visitor/Member
    participant SD as Spot Details Page
    participant AI_Tab as AI Vibe Check Tab
    participant FS as Firestore DB
    participant Gemini as Gemini AI Service

    User->>SD: Buka halaman detail spot
    SD->>FS: Load data spot (termasuk cached AI summary)
    FS-->>SD: Data spot & AI summary
    User->>AI_Tab: Klik tab "AI Vibe Check"
    alt Cached Summary Tersedia
        AI_Tab-->>User: Tampilkan Pros, Cons, Verdict
    else No Summary & Reviews >= 3
        AI_Tab->>Gemini: Kirim review (6 bulan terakhir) ke API
        Gemini-->>AI_Tab: Response Ringkasan AI
        AI_Tab->>FS: Simpan ringkasan AI ke Spot Document (Cache)
        AI_Tab-->>User: Tampilkan Pros, Cons, Verdict yang baru dibuat
    end
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **A1: Pembaruan Otomatis (Auto-update)**
    1. Sistem mendeteksi bahwa spot menerima review ke-5 sejak update AI terakhir.
    2. Sistem secara otomatis memicu background worker untuk meregenerasi AI Vibe Check.
    3. Firestore memperbarui field `aiSummary` untuk spot tersebut.

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Ulasan Kurang dari Batas Minimum**
    1. Sistem mendeteksi jumlah review spot kurang dari 3.
    2. Sistem menyembunyikan tab AI Vibe Check atau menampilkan pesan fallback: "AI Vibe Check belum tersedia. Tulis review pertama untuk membantu mengaktifkannya!"
- **E2: Kegagalan API Gemini**
    1. Koneksi ke API Gemini gagal atau limit API tercapai saat melakukan regenerasi.
    2. Sistem menampilkan data lama (jika ada cache) atau menampilkan pesan kesalahan: "Gagal memuat ringkasan AI saat ini. Coba beberapa saat lagi."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-05**: Minimal data untuk memicu AI Vibe Check adalah 3 reviews (tidak termasuk review yang disembunyikan/dihapus).
- **BR-06**: AI summary diperbarui otomatis setiap kelipatan 5 review baru, atau dapat dipaksa re-sync oleh Admin (UC-19).
- **BR-07**: Hanya review dalam rentang 6 bulan terakhir yang dianalisis untuk menjaga relevansi suasana terbaru.

---

### 6. Catatan UI/UX
- Tampilan Pros dan Cons menggunakan list dengan ikon menarik (misal: jempol hijau untuk pros, tanda seru merah/oranye untuk cons).
- Tampilan "The Verdict" menggunakan layout ala kutipan (blockquote) yang menonjol dengan latar belakang semi-transparan (glassmorphism).
- Terdapat animasi loading shimmer/skeleton khusus yang menggambarkan proses berpikir AI saat pertama kali dimuat.

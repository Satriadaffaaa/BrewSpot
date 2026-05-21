# 📄 Spesifikasi Detail Use Case: UC-19
## AI Control Panel (Manual Re-sync)

| Item | Deskripsi |
| :--- | :--- |
| **ID** | UC-19 |
| **Nama Use Case** | AI Control Panel (Manual Re-sync) |
| **Aktor Utama** | Admin |
| **Deskripsi** | Admin memaksa regenerasi (re-sync) ringkasan AI Vibe Check secara manual untuk spot tertentu melalui antarmuka admin panel. |
| **Prioritas** | Low (Nice to Have) |

---

### 1. Kondisi (Conditions)
- **Pre-conditions**: 
    - Admin telah masuk (login) dengan akun Administrator.
    - Spot ID sasaran terdaftar di database.
- **Post-conditions**:
    - Data `aiSummary` (Pros, Cons, Verdict) pada dokumen spot di Firestore diperbarui dengan hasil pemrosesan Gemini AI yang baru.
    - Timestamp `aiLastUpdated` diperbarui ke waktu eksekusi saat ini.

---

### 2. Alur Kerja Utama (Main Success Scenario)
1. **Aktor** membuka halaman "AI Management" di Admin Panel.
2. **Sistem** menyajikan kolom pencarian spot dan statistik penggunaan kuota API AI.
3. **Aktor** memasukkan kata kunci nama spot atau Spot ID pada kolom pencarian.
4. **Sistem** menampilkan detail spot terpilih beserta info status AI Vibe Check saat ini.
5. **Aktor** menekan tombol "Force Re-generate AI Vibe Check".
6. **Sistem** menampilkan dialog konfirmasi kuota API.
7. **Aktor** menekan tombol "Konfirmasi".
8. **Sistem** melakukan query untuk mengambil semua ulasan (review) spot tersebut dalam 6 bulan terakhir.
9. **Sistem** mengirimkan kumpulan teks ulasan tersebut ke API Gemini dengan instruksi prompt ringkasan terstruktur.
10. **Sistem** menerima respon ringkasan Pros, Cons, dan Verdict dari Gemini.
11. **Sistem** memperbarui dokumen spot di Firestore dengan field ringkasan baru dan stempel waktu terbaru.
12. **Sistem** menampilkan status sukses "AI Vibe Check Resynchronized Successfully".

---

### 2.1. Diagram Urutan (Sequence Diagram)
::: mermaid
sequenceDiagram
    actor Admin as Admin
    participant Panel as AI Management Panel
    participant API as System (API/Firestore)
    participant Gemini as Gemini AI Service

    Admin->>Panel: Cari Spot & Klik "Force Re-generate"
    Panel->>API: Minta regenerasi AI (spotId)
    API->>API: Query reviews spot (6 bulan terakhir)
    alt Total Reviews >= 3
        API->>Gemini: Kirim teks reviews + System Prompt
        Gemini-->>API: Return Ringkasan Pros, Cons, Verdict
        API->>API: Update Field aiSummary & aiLastUpdated di Firestore
        API-->>Panel: Return status sukses
        Panel-->>Admin: Tampilkan pesan "Regenerasi AI Vibe Check Berhasil"
    else Total Reviews < 3
        API-->>Panel: Return error (Ulasan kurang dari 3)
        Panel-->>Admin: Tampilkan peringatan "Minimal ulasan tidak terpenuhi (min. 3)"
    end
:::

---

### 3. Alur Alternatif (Alternative Flows)
- **Tidak ada alur alternatif.**

---

### 4. Alur Eksepsi (Exception Flows)
- **E1: Kegagalan API Gemini / Limit Kuota Tercapai**
    1. Saat memanggil API Gemini, sistem menerima respon error (status 429 atau 500).
    2. Sistem membatalkan proses pembaruan data.
    3. Sistem menampilkan pesan error: "Gagal menghubungkan ke mesin AI (Limit tercapai/Koneksi terputus). Silakan coba lagi nanti."

---

### 5. Aturan Bisnis (Business Rules) Terkait
- **BR-44**: Pemanggilan manual regenerasi AI memotong kuota harian API Gemini. Aksi ini direkomendasikan hanya jika ada laporan ulasan spam yang masuk yang merusak keakuratan ringkasan AI sebelumnya (setelah ulasan spam tersebut dihapus Admin).
- **BR-45**: Meskipun dipaksa secara manual, spot tetap harus memenuhi kriteria minimal **3 review** agar ringkasan AI dapat dijalankan dengan valid.

---

### 6. Catatan UI/UX
- Halaman panel menampilkan dashboard ringkas kuota penggunaan API (berupa grafik lingkaran/persentase konsumsi kuota).
- Tombol aksi regenerasi memiliki ikon sinkronisasi (sync) yang berputar (loading spin animation) selama API Gemini sedang memproses data (estimasi proses 3-5 detik).
- Menampilkan perbandingan ringkasan AI versi lama vs versi baru sebelum Admin menyimpan pembaruan secara permanen (Side-by-side comparison).

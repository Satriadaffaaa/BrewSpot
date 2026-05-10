# Panduan Setup Cloudflare Turnstile

**PENTING:** Anda **TIDAK PERLU** memindahkan domain anda ke Cloudflare (ganti nameserver). Turnstile adalah layanan gratis yang bisa berjalan di mana saja (Vercel, Firebase, dll) tanpa mengubah DNS.

Jika anda tidak bisa menemukan menu Turnstile di search bar, gunakan link langsung di bawah ini.

## Link Langsung (Direct Link)
Klik link ini untuk langsung menuju halaman Turnstile:  
👉 **[https://dash.cloudflare.com/?to=/:account/turnstile](https://dash.cloudflare.com/?to=/:account/turnstile)**

---

## Langkah-langkah Mendapatkan Site Key

1.  **Login & Buka Link Diatas**
    - Pastikan anda sudah login ke Cloudflare.
    - Klik link direct di atas untuk masuk ke dashboard Turnstile.

2.  **Add Site (Tambah Situs)**
    - Klik tombol **"Add Site"** (biasanya di pojok kanan atas halaman Turnstile).
    - **Site Name:** Isi bebas (contoh: `BrewSpot App`).
    - **Domain:**
        - Masukkan domain produksi anda (contoh: `my-brewspot.vercel.app`).
        - **PENTING:** Masukkan juga `localhost` agar bisa jalan saat testing di komputer anda.
        - Contoh input:
          ```
          my-brewspot.vercel.app
          localhost
          127.0.0.1
          ```
    - **Widget Mode:** Pilih **"Managed"** (Recommended). Ini opsi di tengah.

3.  **Create**
    - Klik tombol **"Create"**.

4.  **Copy Key**
    - Anda akan melihat dua kunci. Copy **Site Key** (Public).

5.  **Update Environment Variable**
    - Buka file `.env.local` di project anda.
    - Paste ke variabel `NEXT_PUBLIC_CLOUDFLARE_SITE_KEY`.
    - Contoh:
      ```env
      NEXT_PUBLIC_CLOUDFLARE_SITE_KEY=0x4AAAAAAABCwNmO_.......
      ```

6.  **Restart Server**
    - Matikan terminal (`Ctrl+C`).
    - Jalankan ulang `npm run dev`.

---

## Troubleshooting: Error "Unable to connect to website"

Jika anda melihat error ini di widget Turnstile, artinya domain `localhost` belum diizinkan.

**Cara Memperbaiki:**
1. Buka kembali halaman Turnstile Cloudflare (gunakan link di atas).
2. Di daftar "Sites", cari nama situs yang baru anda buat (misal `BrewSpot App`).
3. Klik tombol **Settings** (ikon **Gerigi / Gear**) di sebelah kanan nama situs tersebut.
   - *Jangan klik namanya, tapi klik tombol "Settings" di sebelah kanan.*
4. Scroll ke bawah sampai bagian **"General"**.
5. Di bagian **"Domain"** (atau kadang disebut **"Hostname"**), pastikan anda menambahkan SEMUA alamat di mana aplikasi berjalan:
   - `localhost` (Wajib untuk testing di komputer sendiri)
   - `127.0.0.1` (Sama dengan localhost, tapi dalam format angka IP. Wajib ditambah karena kadang browser pakai ini)
   - `nama-aplikasi-anda.vercel.app` (Domain produksi Vercel anda)
   - `domain-anda.com` (Jika punya custom domain)
6. Klik **"Update"** atau **"Save"**.
   - Perubahan mungkin butuh 1-2 menit untuk aktif.

Selesai! Aplikasi anda sekarang terlindungi oleh Cloudflare Turnstile.

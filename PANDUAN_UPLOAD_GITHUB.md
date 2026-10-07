# Panduan Upload WebGIS ke GitHub Pages

Panduan ini memakai cara **lewat browser** (tanpa instal aplikasi). Hasil akhirnya adalah situs publik dengan alamat
`https://<username>.github.io/<nama-repo>/`.

> Catatan: GitHub Pages gratis hanya untuk repository **Public**. Artinya semua file di repo, termasuk data peta di folder `data/` dan foto di `img/`, dapat diakses siapa saja yang membuka repo. Pastikan data sudah disetujui untuk dipublikasikan oleh LTKL/pemda sebelum diunggah.

---

## A. Persiapan (sekali saja)

1. Buat akun di <https://github.com> (gunakan email kantor, nama pengguna singkat, mis. `japesda-mel`).
2. Ekstrak `webgis-komoditas-ltkl.zip` di komputer. Anda akan mendapat folder `webgis-komoditas-ltkl` berisi:
   `index.html`, `statistik.html`, `README.md`, `PANDUAN_UPLOAD_GITHUB.md`, `.nojekyll`, dan folder `css`, `js`, `data`, `img`.
3. Uji dulu di komputer: klik dua kali `index.html`. Peta harus tampil (perlu internet), lalu klik tab **Statistik & grafik**.

> File `.nojekyll` diawali titik sehingga di Windows bisa tersembunyi. Aktifkan *View → Show → Hidden items* di File Explorer agar ikut terunggah. Kalau tertinggal, situs tetap jalan; file ini hanya mempercepat proses build GitHub.

## B. Membuat repository

1. Setelah login, klik tombol **+** di kanan atas → **New repository**.
2. Isi:
   - **Repository name**: `webgis-komoditas-ltkl` (huruf kecil, tanpa spasi; nama ini menjadi bagian alamat situs).
   - **Description**: `WebGIS sebaran komoditas & statistik tutupan lahan – Commodity Mapping LTKL`.
   - Pilih **Public**.
   - Biarkan *Add a README file* **tidak dicentang** (README sudah ada di folder).
3. Klik **Create repository**.

## C. Mengunggah file

1. Di halaman repo yang masih kosong, klik tautan **uploading an existing file**.
2. Buka folder `webgis-komoditas-ltkl` di File Explorer, **blok semua isinya** (Ctrl + A), lalu seret ke kotak unggah di browser.
   - Yang diseret adalah **isi** folder, bukan folder `webgis-komoditas-ltkl` itu sendiri. `index.html` harus berada di halaman depan repo.
   - Seret-lepas folder (css, js, data, img) didukung di Chrome dan Edge.
3. GitHub membatasi **100 file per unggahan**, sedangkan paket ini berisi 112 file (sekitar 30 MB). Unggah dalam dua tahap:
   - **Tahap 1:** seret folder `img` saja (94 file, termasuk 86 foto lapangan dan thumbnail), lalu **Commit changes**.
   - **Tahap 2:** klik lagi **Add file → Upload files**, seret semua file dan folder lainnya, lalu **Commit changes**.
4. Di bagian **Commit changes**, tulis pesan, mis. `Rilis awal WebGIS dan dashboard statistik`, lalu klik **Commit changes**.
5. Periksa halaman repo: harus terlihat `index.html` dan `statistik.html` di daftar file paling atas, beserta folder-foldernya.

Batas unggah lewat browser: maksimal 100 file per commit dan 25 MB per file. Paket ini masih jauh di bawah batas tersebut.

## D. Mengaktifkan GitHub Pages

1. Di repo, klik **Settings** (tab paling kanan) → menu kiri **Pages**.
2. Pada **Build and deployment**:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` dan folder `/ (root)` → klik **Save**.
3. Tunggu 1–3 menit, lalu muat ulang halaman Settings → Pages. Akan muncul kotak *Your site is live at* `https://<username>.github.io/webgis-komoditas-ltkl/`.
4. Buka alamat tersebut. Cek:
   - Peta satelit dan poligon komoditas tampil.
   - Tab **Statistik & grafik** menampilkan diagram.
   - Tautan desa bisa dibagikan, contoh `https://<username>.github.io/webgis-komoditas-ltkl/statistik.html#desa=BBL-BLU-ILOMATA`.

Status proses build bisa dilihat di tab **Actions** (centang hijau = berhasil).

## E. Memperbarui data atau tampilan

1. Buka repo → masuk ke folder yang ingin diperbarui (mis. `data`).
2. Klik **Add file → Upload files**, seret file pengganti **dengan nama yang sama persis**. File lama otomatis tertimpa.
3. Tulis pesan commit yang jelas, mis. `Update statistik.js – data Excel revisi 12 Okt 2026`, lalu **Commit changes**.
4. Situs diperbarui otomatis dalam 1–3 menit. Jika tampilan belum berubah, tekan **Ctrl + F5** (muat ulang tanpa cache).

Riwayat setiap perubahan tersimpan di tab **Commits**, sehingga versi lama selalu bisa dilacak atau dipulihkan (berguna sebagai *audit trail* data).

## F. Masalah yang sering terjadi

| Gejala | Penyebab | Solusi |
|---|---|---|
| Alamat situs menampilkan **404** | Pages belum selesai build, atau `index.html` tidak di root | Tunggu 3 menit; pastikan `index.html` terlihat langsung di halaman depan repo, bukan di dalam subfolder |
| Halaman terbuka tapi **peta/grafik kosong** | Folder `data` atau `js` tidak ikut terunggah | Bandingkan daftar file di repo dengan isi folder lokal, unggah yang kurang |
| Tampilan berantakan tanpa warna | Folder `css` tidak terunggah | Unggah folder `css` |
| Peta cetak desa tidak muncul di statistik | Folder `img` tidak terunggah | Unggah folder `img` |
| Perubahan tidak terlihat | Cache browser | Ctrl + F5, atau buka di jendela penyamaran |
| Nama file beda huruf besar/kecil | GitHub membedakan `Data/` dan `data/` | Gunakan nama persis seperti di paket ini (huruf kecil) |

## G. (Opsional) Cara alternatif dengan GitHub Desktop

Cocok bila pembaruan data akan sering dilakukan.

1. Instal **GitHub Desktop** (<https://desktop.github.com>) dan login.
2. **File → Clone repository** → pilih `webgis-komoditas-ltkl` → tentukan folder lokal.
3. Salin/timpa file di folder lokal tersebut.
4. Di GitHub Desktop, isi *Summary* (pesan commit) → **Commit to main** → **Push origin**.

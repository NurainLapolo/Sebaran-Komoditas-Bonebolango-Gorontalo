# WebGIS Sebaran Komoditas Pertanian – LTKL

Peta interaktif sebaran komoditas pertanian/perkebunan di **Kabupaten Gorontalo** (Kec. Asparaga, Telaga, Telaga Biru) dan **Kabupaten Bone Bolango** (Kec. Bulango Ulu, Suwawa Selatan, Tilongkabila) untuk program *Commodity Mapping* Lingkar Temu Kabupaten Lestari (LTKL).

Terdiri dari dua halaman: **Peta interaktif** (`index.html`) dan **Statistik & grafik** (`statistik.html`). Situs statis (HTML + CSS + JavaScript, Leaflet 1.9.4, Chart.js 4.4.1). Tidak memerlukan server/backend, cocok untuk **GitHub Pages**.

## Fitur

- Filter berjenjang Kabupaten → Kecamatan → Desa, plus tombol cepat 8 desa yang memiliki peta cetak.
- Legenda dinamis: luas (Ha) dan jumlah poligon per komoditas menyesuaikan filter; centang untuk menyembunyikan komoditas.
- Profil tutupan lahan desa (termasuk Hutan, Sawah, Permukiman, dll.) dari tabel Excel tutupan lahan.
- Popup poligon: ID poligon, ID desa, luas atribut, luas geodesik, titik tengah (Decimal Degrees).
- Peta dasar: citra satelit Esri, konsisten dengan peta cetak. Batas administrasi kabupaten, kecamatan, dan desa; kuning untuk Kab. Gorontalo, biru muda untuk Kab. Bone Bolango.
- Tautan bisa dibagikan, misalnya `.../#desa=BBL-BLU-ILOMATA`.

## Halaman statistik

- Ringkasan angka kunci dan narasi temuan utama yang berubah otomatis mengikuti filter.
- Diagram komposisi komoditas, luas komoditas per kecamatan/desa, tutupan lahan lengkap (hutan bisa ditampilkan/disembunyikan).
- Perbandingan komposisi komoditas 8 desa peta cetak (dalam persen).
- Peta cetak desa tampil otomatis saat desa fokus dipilih.
- Tabel pivot desa × komoditas yang bisa diurutkan.
- Sumber data: `LUAS_KOMODITAS_KECAMATAN_*.xlsx` sheet DATABASE.

## Foto lapangan

Seluruh foto di website adalah **dokumentasi lapangan tim survei (Juni 2026)**: 41 foto dari 8 desa, berupa foto drone lahan dan lanskap serta foto pascapanen. Tidak ada foto dari internet.

- Data foto: `data/foto_lapangan.js`. File gambar di `img/lapangan/`: versi 1600 px dan thumbnail 480 px.
- **12 foto ber-GPS** (Bihe dan Pangahu) tampil sebagai ikon kamera di peta pada posisi drone. Foto lain tampil di galeri desa.
- Foto dipakai di: legenda dan popup peta (foto komoditas dari desa yang sama bila ada), galeri profil desa, kartu "Mengenal komoditas", dan "Galeri foto lapangan" di halaman Statistik. Klik foto untuk memperbesar.
- ID foto: `FOTO-<ID_DESA tanpa awalan>-<nomor>`, misalnya `FOTO-GTO-ASP-BIHE-03`.
- Menambah foto: simpan JPG di `img/lapangan/` lalu tambahkan barisnya di `data/foto_lapangan.js` (kolom `KATEGORI` = nama komoditas, Lanskap, atau Permukiman; `JENIS` = Lahan, Lanskap, atau Pascapanen).

## Simbologi (sama dengan peta cetak)

| Kelas | Warna |
|---|---|
| Komoditas Campuran | `#FF7F7F` |
| Komoditas Jagung | `#D1FFBE` |
| Komoditas Kelapa | `#00E6A9` |
| Komoditas Sawit | `#38A800` |
| Komoditas Kemiri | `#FFFF00` |
| Komoditas Tebu | `#C77DFF` |
| Komoditas Cengkeh | `#55FF00` |
| Komoditas Jeruk | `#3D5AFE` |
| Hutan | `#00734C` |
| Sawah | `#4CE600` |
| Semak Belukar | `#CDF57A` |
| Lahan Terbuka | `#CDCD66` |
| Permukiman | `#FFAA00` |
| Jalan | `#E60000` |
| Sungai | `#00C5FF` |
| Kolam | `#73B2FF` |

## Struktur folder

```
index.html             halaman peta
statistik.html         halaman statistik & grafik
css/  js/  img/
data/                  data yang dimuat peta (format .js agar bisa dibuka tanpa server)
  komoditas.js         poligon tutupan lahan & komoditas (disederhanakan untuk web)
  batas_admin.js       garis batas desa, kecamatan, kabupaten
  desa.js              62 desa kajian (kode desa, luas wilayah resmi, titik label)
  label_desa.js        label seluruh desa di 2 kabupaten
  sampel.js            137 titik sampel komoditas (sudah dibersihkan)
  foto_lapangan.js     metadata 41 foto lapangan
  statistik.js         rekap luas per desa per kelas
  tutupan_lahan.js     profil tutupan per desa
```

## Sumber data dan kontrol mutu

- Poligon: `KOMODITAS_PERTANIAN_KECAMATAN_*_AR.shp` (5 kecamatan, 8.186 poligon, seluruh kelas tutupan lahan).
- Titik sampel: `DESA_*_PT.shp` (8 desa, 137 titik). Desa setiap titik ditentukan dari batas desa resmi.
- Batas desa: `BATAS_ADMIN_DESA_KEL_AR.shp` (BIG, delineasi 2019), dipotong untuk Kab. Gorontalo dan Kab. Bone Bolango.
- Kontrol mutu: luas per desa per kelas identik dengan tabel Excel `LUAS_KOMODITAS_KECAMATAN_*.xlsx` (528 kombinasi desa–kelas, selisih 0), dan total tutupan ke-62 desa sama dengan luas wilayah resmi desa (`LUASWH`).

## Publikasi ke GitHub Pages

Panduan lengkap langkah demi langkah ada di `PANDUAN_UPLOAD_GITHUB.md`. Ringkasnya:

1. Buat repository baru di GitHub (mis. `webgis-komoditas-ltkl`), visibilitas **Public**.
2. Unggah **isi** folder ini ke root repository (Add file → Upload files, seret semua file dan folder, lalu Commit). Pastikan `index.html` berada di root, bukan di dalam subfolder.
3. Buka **Settings → Pages**. Pada *Build and deployment*, pilih *Source: Deploy from a branch*, branch `main`, folder `/ (root)`, lalu **Save**.
4. Tunggu 1–2 menit. Alamat situs: `https://<username>.github.io/webgis-komoditas-ltkl/`.

Uji lokal: cukup klik dua kali `index.html` (butuh internet untuk peta dasar dan Leaflet).

## Kamus data

**Poligon tutupan lahan dan komoditas**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `ID_POLIGON` | Teks (PK) | `TL-<kode kecamatan>-<nomor urut>` |
| `ID_DESA` | Teks (FK) | `<GTO/BBL>-<kode kecamatan>-<NAMADESA>` |
| `KODE_DESA` | Teks | Kode desa Kemendagri (`KDEPUM`) |
| `KOMODITAS` | Teks | Kelas tutupan: komoditas (Campuran, Jagung, Kelapa, dst.) atau kelas lain (Hutan, Sawah, Permukiman, dst.) |
| `JENIS` | Teks | `Komoditas` / `Tutupan lain` |
| `DESA`, `KECAMATAN`, `KABUPATEN`, `PROVINSI` | Teks | Wilayah administrasi |
| `LUAS_HA` | Desimal | Luas dari atribut SHP (sama dengan tabel Excel) |
| `LUAS_GEODESIK_HA` | Desimal | Luas dihitung ulang pada elipsoid WGS 84 (kontrol mutu) |
| `LAT`, `LON` | Desimal (DD) | Titik representatif di dalam poligon |
| `SUMBER_SHP` | Teks | Nama shapefile asal |

**Titik sampel komoditas**

| Kolom | Tipe | Keterangan |
|---|---|---|
| `ID_SAMPEL` | Teks (PK) | `SPL-<ID_DESA>-<nomor>` |
| `KOMODITAS_SAMPEL` | Teks | Kategori hasil pembersihan |
| `KOMPONEN` | Teks | Komoditas penyusun bila campuran |
| `ID_DESA`, `DESA`, `KECAMATAN`, `KABUPATEN` | Teks | Ditentukan dari lokasi titik pada batas desa resmi |
| `LAT`, `LON` | Desimal (DD) | WGS 84 |

Kode kecamatan: ASP Asparaga, TLG Telaga, TLB Telaga Biru, BLU Bulango Ulu, SWS Suwawa Selatan, TLK Tilongkabila.

## Pemutakhiran data

Ganti isi `data/*.js` dengan hasil konversi SHP terbaru (WGS 84, EPSG:4326), lalu commit ulang. Struktur atribut harus mengikuti kamus data di atas.

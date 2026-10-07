/* Foto lapangan komoditas – dokumentasi drone & pascapanen tim survei (Juni 2026).
   Seluruh foto berasal dari tim lapangan; tidak ada foto dari internet.
   Data foto: data/foto_lapangan.js (window.DATA_FOTO). */
(function () {
  'use strict';

var KATALOG = {
    'Jagung': { ilmiah: 'Zea mays' },
    'Campuran': { ilmiah: '' },
    'Kelapa': { ilmiah: 'Cocos nucifera' },
    'Sawit': { ilmiah: 'Elaeis guineensis' },
    'Tebu': { ilmiah: 'Saccharum officinarum' },
    'Kemiri': { ilmiah: 'Aleurites moluccanus' },
    'Cengkeh': { ilmiah: 'Syzygium aromaticum' },
    'Jeruk': { ilmiah: 'Citrus spp.' }
  };

  // Narasi diambil dari Laporan Pertengahan Pemetaan Komoditas Unggulan LTKL (revisi 6 September 2026).
  // umum: tingkat kabupaten/kecamatan; desa: khusus desa kajian.
  var NARASI = {
    'Jagung': {
      umum: 'Komoditas dengan cakupan lahan terluas di kedua kabupaten. Didukung tingkat adopsi yang tinggi dan jaringan pemasaran yang telah berkembang, namun budidaya pada kawasan berlereng berisiko meningkatkan erosi dan degradasi lahan sehingga perlu diarahkan pada agroforestri, tumpangsari, atau teknik konservasi tanah dan air.',
      desa: {
        'BBL-SWS-MOLINTOGUPO': 'Skor MCDA 22. Unggul pada akses pasar karena permintaan dan saluran pemasarannya relatif stabil, namun budidaya pada lahan miring berisiko meningkatkan degradasi lahan bila tanpa teknik konservasi tanah yang memadai.',
        'BBL-TLK-LONUO': 'Skor MCDA 24. Didukung tingkat adopsi yang tinggi dan akses pasar yang terhubung dengan gudang pengumpul di Kota Gorontalo; pada musim kemarau panjang petani kerap mengalami penurunan produksi hingga gagal panen.',
        'BBL-BLU-SUKAMAKMUR': 'Sistem pertanian desa masih bertumpu pada tanaman semusim, dengan tanaman tahunan berkembang dalam skala lebih terbatas.',
        'BBL-BLU-ILOMATA': 'Dominasi jagung membentuk lanskap pertanian homogen dengan fragmentasi tinggi; sebagian berkembang pada zona transisi antara permukiman dan kawasan hutan sehingga berpotensi meningkatkan risiko erosi, sedimentasi DAS, dan limpasan permukaan.',
        'GTO-ASP-PANGAHU': 'Skor MCDA 24. Tetap menjadi sumber pendapatan utama karena pasar yang kuat dan tingkat adopsi tinggi, namun budidaya pada lahan berlereng berisiko meningkatkan erosi dan limpasan permukaan yang dapat memperburuk potensi banjir di wilayah hilir.',
        'GTO-ASP-BIHE': 'Skor MCDA 25. Komoditas utama dari sisi luas budidaya dan akses pasar, namun pengembangannya pada lahan berlereng berisiko lingkungan tinggi tanpa praktik konservasi tanah dan air.',
        'GTO-TLB-DULAMAYOUTARA': 'Skor MCDA 23. Tingkat adopsi dan akses pasarnya baik, namun pengembangannya pada kawasan berlereng berisiko tinggi terhadap erosi dan longsor.',
        'GTO-TLG-DULAMAYOSELATAN': 'Skor MCDA 24. Komoditas paling luas dibudidayakan dengan akses pasar yang kuat, namun pola budidayanya pada lereng curam berisiko tinggi terhadap degradasi lahan.'
      }
    },
    'Kelapa': {
      umum: 'Komoditas dengan basis produksi dan tingkat adopsi masyarakat paling luas di kedua kabupaten. Dipasarkan dalam bentuk kelapa butiran dan kopra melalui pedagang pengumpul desa, dengan peluang hilirisasi melalui minyak kelapa, virgin coconut oil (VCO), arang tempurung, dan produk berbasis serat kelapa.',
      desa: {
        'BBL-SWS-MOLINTOGUPO': 'Skor MCDA 25 (peringkat kedua). Unggul pada stabilitas produksi, fungsi konservasi, dan jaringan pemasaran kopra yang sudah terbentuk.',
        'BBL-TLK-LONUO': 'Skor MCDA 27. Didukung populasi tanaman yang besar dan jaringan pemasaran kopra yang telah lama berkembang, meski minat generasi muda menurun karena siklus panen yang panjang.',
        'BBL-BLU-SUKAMAKMUR': 'Komoditas unggulan utama (skor MCDA 31). Hampir seluruh rumah tangga petani memiliki tanaman kelapa, dengan jaringan pemasaran kopra dan kelapa segar yang relatif stabil.',
        'BBL-BLU-ILOMATA': 'Skor MCDA tertinggi (32). Penopang pendapatan utama yang relatif stabil sepanjang tahun, dengan jalur pemasaran kopra dan kelapa segar yang telah terbentuk.',
        'GTO-ASP-PANGAHU': 'Komoditas unggulan utama (skor MCDA 30). Didukung tingkat adopsi yang tinggi, ketersediaan lahan yang masih luas, serta kontribusinya menjaga stabilitas lahan pada wilayah rawan banjir.',
        'GTO-ASP-BIHE': 'Komoditas unggulan (skor MCDA 28). Didukung fungsi ekologis yang baik, tingkat adopsi masyarakat yang tinggi, serta sistem pemasaran kopra yang telah berkembang.'
      }
    },
    'Kemiri': {
      umum: 'Berfungsi sebagai tanaman konservasi yang menjaga stabilitas lereng dan mengurangi risiko erosi maupun tanah longsor. Dipasarkan dalam bentuk kemiri gabah dan kemiri kupas; potensi nilai tambah terbesar berada pada pengembangan minyak kemiri.',
      desa: {
        'GTO-TLB-DULAMAYOUTARA': 'Skor MCDA 28. Unggul pada keberlanjutan lingkungan dan kemudahan budidaya, namun pemanfaatannya sebagai sumber pendapatan utama masih terbatas karena dipandang sebagai komoditas pelengkap.',
        'GTO-TLG-DULAMAYOSELATAN': 'Komoditas unggulan (skor MCDA 33). Menggabungkan manfaat ekonomi dengan fungsi ekologis sebagai penstabil lereng, namun sistem pemasarannya belum terorganisasi.'
      }
    },
    'Cengkeh': {
      umum: 'Komoditas perkebunan bernilai tinggi di kawasan dataran tinggi yang berkontribusi penting terhadap pendapatan rumah tangga pada musim panen; produksinya bersifat musiman dan dipengaruhi kondisi iklim.',
      desa: {
        'GTO-TLB-DULAMAYOUTARA': 'Skor MCDA 29 (peringkat kedua) dan telah menjadi identitas pertanian masyarakat. Karakter panennya yang musiman membuat pendapatan petani sangat dipengaruhi fluktuasi produksi dan harga.'
      }
    },
    'Campuran': {
      umum: 'Kebun campuran yang memadukan tanaman tahunan dan semusim. Berkontribusi pada diversifikasi pendapatan dan fungsi hidrologi, serta berperan sebagai penyangga antara lahan budidaya dan kawasan hutan.',
      desa: {
        'BBL-SWS-MOLINTOGUPO': 'Sistem usaha tani didominasi kombinasi tanaman kehutanan, perkebunan, dan tanaman semusim.',
        'BBL-TLK-LONUO': 'Sistem usaha tani didominasi kombinasi tanaman tahunan dan tanaman semusim yang berkembang pada kawasan perbukitan di sekitar hutan lindung.',
        'BBL-BLU-SUKAMAKMUR': 'Kebun campuran berupa kelapa, aren, sagu, pisang, dan langsat di sekitar permukiman berkontribusi pada diversifikasi pendapatan dan fungsi hidrologi.',
        'BBL-BLU-ILOMATA': 'Kebun agroforestri di antara lahan jagung dan kawasan hutan berfungsi sebagai penyangga hidrologi dan koridor ekologis.',
        'GTO-TLB-DULAMAYOUTARA': 'Pengelolaan ruang perlu diarahkan pada penguatan kebun campuran dan agroforestri agar fungsi hidrologi kawasan hulu tetap terjaga.',
        'GTO-TLG-DULAMAYOSELATAN': 'Tanaman buah dan komoditas lokal berkembang dalam sistem kebun campuran di sekitar permukiman.'
      }
    },
    'Sawit': {
      umum: 'Terdapat di Kecamatan Asparaga, tersebar berselang-seling dengan tebu dan meluas ke arah Tiohu di tenggara.',
      desa: {
        'GTO-ASP-BIHE': 'Perkebunan sawit perusahaan membentuk blok-blok lahan homogen yang berpotensi meningkatkan fragmentasi bentang alam dan mengurangi konektivitas habitat di kawasan penyangga Suaka Margasatwa Nantu.'
      }
    },
    'Tebu': {
      umum: 'Terkonsentrasi dalam beberapa klaster padat di bagian tengah Kecamatan Asparaga, terutama di sekitar Mohiyolo, Karya Baru, dan Olimohulo.',
      desa: {}
    },
    'Jeruk': {
      umum: 'Muncul dalam bercak-bercak kecil di Kecamatan Asparaga, terutama di sepanjang pesisir barat.',
      desa: {}
    }
  };
  function narasi(nama, idDesa) {
    var n = NARASI[nama]; if (!n) return '';
    return (idDesa && n.desa[idDesa]) || n.umum;
  }

  var D = window.DATA_FOTO || { foto: [], utama: {} };
  var BY_ID = {};
  D.foto.forEach(function (f) { BY_ID[f.ID_FOTO] = f; });

  function bentuk(f) {
    if (!f) return null;
    return { id: f.ID_FOTO, thumb: f.THUMB, full: f.FILE, desa: f.DESA, idDesa: f.ID_DESA, ket: f.KETERANGAN,
             jenis: f.JENIS, kategori: f.KATEGORI, catatan: f.CATATAN, lat: f.LAT, lon: f.LON, tanggal: f.TANGGAL, peta: f.PETA !== false };
  }
  // Foto hanya untuk desa kajian yang sama (berdasarkan nama desa); tidak dipinjam dari desa lain.
  function pilih(nama, idDesa) {
    if (!idDesa) return null;
    var sama = D.foto.filter(function (f) { return f.KATEGORI === nama && f.ID_DESA === idDesa; });
    if (!sama.length) return null;
    return bentuk(sama.filter(function (f) { return f.JENIS === 'Lahan'; })[0] || sama[0]);
  }
  function ambil(nama, idDesa) { return Promise.resolve(pilih(nama, idDesa)); }

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function kredit(f) {
    if (!f) return '';
    return 'Desa ' + esc(f.desa) + (f.jenis === 'Pascapanen' ? ' · Pascapanen' : '');
  }

  // ---------- Lightbox ----------
  var box, daftar = [], pos = 0;
  function buatBox() {
    box = document.createElement('div');
    box.className = 'lb'; box.hidden = true;
    box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true'); box.setAttribute('aria-label', 'Foto lapangan');
    box.innerHTML = '<button type="button" class="lb-x" aria-label="Tutup">×</button>' +
      '<button type="button" class="lb-prev" aria-label="Foto sebelumnya">‹</button>' +
      '<figure><img alt=""><figcaption></figcaption></figure>' +
      '<button type="button" class="lb-next" aria-label="Foto berikutnya">›</button>';
    document.body.appendChild(box);
    box.querySelector('.lb-x').onclick = tutup;
    box.querySelector('.lb-prev').onclick = function () { geser(-1); };
    box.querySelector('.lb-next').onclick = function () { geser(1); };
    box.addEventListener('click', function (e) { if (e.target === box) tutup(); });
    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') tutup(); else if (e.key === 'ArrowLeft') geser(-1); else if (e.key === 'ArrowRight') geser(1);
    });
  }
  function tampil() {
    var f = daftar[pos];
    box.querySelector('img').src = f.full; box.querySelector('img').alt = f.ket;
    box.querySelector('figcaption').innerHTML = '<strong>' + esc(f.ket) + '</strong> · Desa ' + esc(f.desa) +
      (f.tanggal ? ' · ' + esc(f.tanggal) : '') + (f.lat ? ' · ' + f.lat.toFixed(6) + ', ' + f.lon.toFixed(6) : '') +
      (f.catatan ? '<br><em>' + esc(f.catatan) + '</em>' : '') + '<br><span>' + esc(f.id) + ' · ' + (pos + 1) + ' / ' + daftar.length + '</span>';
    box.querySelector('.lb-prev').hidden = box.querySelector('.lb-next').hidden = daftar.length < 2;
  }
  function geser(d) { pos = (pos + d + daftar.length) % daftar.length; tampil(); }
  function tutup() { box.hidden = true; document.body.style.overflow = ''; }
  function lightbox(list, i) {
    if (!box) buatBox();
    daftar = list; pos = i || 0; tampil(); box.hidden = false; document.body.style.overflow = 'hidden';
    box.querySelector('.lb-x').focus();
  }

  window.FotoKomoditas = {
    katalog: KATALOG, narasi: narasi, ambil: ambil, pilih: pilih, kredit: kredit, lightbox: lightbox,
    semua: function () { return D.foto.map(bentuk); },
    perDesa: function (idDesa) { return D.foto.filter(function (f) { return f.ID_DESA === idDesa; }).map(bentuk); }
  };
})();

/* WebGIS Sebaran Komoditas – LTKL (Kab. Gorontalo & Kab. Bone Bolango)
   Warna mengikuti simbologi peta cetak (palet ArcGIS). */
(function () {
  'use strict';

  // ---------- Simbologi (sama dengan peta cetak) ----------
  var COLORS = {
    'Campuran': '#FF7F7F',
    'Jagung': '#D1FFBE',
    'Kelapa': '#00E6A9',
    'Sawit': '#38A800',
    'Tebu': '#C77DFF',
    'Kemiri': '#FFFF00',
    'Cengkeh': '#55FF00',
    'Jeruk': '#3D5AFE',
    // kelas tutupan lahan lain (untuk tabel profil desa)
    'Hutan': '#00734C',
    'Sawah': '#4CE600',
    'Semak Belukar': '#CDF57A',
    'Lahan Terbuka': '#CDCD66',
    'Permukiman': '#FFAA00',
    'Jalan': '#E60000',
    'Sungai': '#00C5FF',
    'Kolam': '#73B2FF',
    'Kolam Ikan': '#73B2FF',
    'Danau': '#00C5FF',
    'Waduk/Embung': '#00C5FF',
    'Saluran Irigasi dan Drainase': '#00C5FF',
    'Tambang Pasir dan Batuan': '#A87000',
    'Lapangan': '#D7C29E',
    'Makam': '#9C9C9C'
  };
  // warna titik sampel (jenis yang tidak punya kelas poligon)
  var SAMPEL_COLORS = { 'Aren': '#E8D21D', 'Pisang': '#1FA38A', 'Lemon': '#C7E000', 'Jati': '#8C7A1E', 'Langsat': '#E8502A',
    'Terong': '#9B30D9', 'Sagu': '#6B4E2E', 'Rawa': '#4F7FBF' };
  var KOM_ORDER = ['Campuran', 'Jagung', 'Kelapa', 'Sawit', 'Tebu', 'Kemiri', 'Cengkeh', 'Jeruk'];
  var FOCUS = ['GTO-ASP-BIHE', 'GTO-ASP-PANGAHU', 'GTO-TLG-DULAMAYOSELATAN', 'GTO-TLB-DULAMAYOUTARA',
               'BBL-BLU-ILOMATA', 'BBL-BLU-SUKAMAKMUR', 'BBL-TLK-LONUO', 'BBL-SWS-MOLINTOGUPO'];
  var ALL = '__all__';

  var FEATURES = window.DATA_KOMODITAS.features;
  var DESA = window.DATA_DESA;
  var TUTUPAN = {};
  window.DATA_TUTUPAN.forEach(function (d) { TUTUPAN[d.ID_DESA] = d; });
  var DESA_BY_ID = {};
  DESA.forEach(function (d) { DESA_BY_ID[d.ID_DESA] = d; });
  // lengkapi atribut wilayah poligon dari daftar desa (menghemat ukuran data)
  FEATURES.forEach(function (f) {
    var p = f.properties, d = DESA_BY_ID[p.ID_DESA] || {};
    p.DESA = d.DESA; p.KECAMATAN = d.KECAMATAN; p.KABUPATEN = d.KABUPATEN; p.KODE_DESA = d.KODE_DESA;
  });
  function isKom(k) { return KOM_ORDER.indexOf(k) > -1; }
  // kelas non-komoditas digambar lebih dulu (di bawah)
  FEATURES.sort(function (x, y) { return (isKom(x.properties.KOMODITAS) ? 1 : 0) - (isKom(y.properties.KOMODITAS) ? 1 : 0); });

  var state = { kab: ALL, kec: ALL, desa: ALL, hidden: {}, opacity: 0.85 };

  var fmt = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var fmtInt = new Intl.NumberFormat('id-ID');
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function color(k) { return COLORS[k] || '#BDBDBD'; }

  // ---------- Peta ----------
  var map = L.map('map', { preferCanvas: true, zoomControl: false, minZoom: 8 }).setView([0.62, 122.85], 10);
  L.control.zoom({ position: 'topright', zoomInTitle: 'Perbesar', zoomOutTitle: 'Perkecil' }).addTo(map);
  L.control.scale({ position: 'bottomright', imperial: false }).addTo(map);

  // Peta dasar: citra satelit (konsisten dengan peta cetak)
  L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    maxZoom: 19, attribution: 'Citra &copy; Esri, Maxar, Earthstar Geographics'
  }).addTo(map);

  // Batas administrasi (gaya garis mengikuti peta cetak)
  // Warna batas administrasi per kabupaten
  var KAB_COLOR = { 'Gorontalo': '#FFB703', 'Bone Bolango': '#3FC5F0' };
  var ADMIN_STYLE = {
    kabupaten: { dash: null, w: 3.2 },
    kecamatan: { dash: '10 5', w: 2 },
    desa: { dash: '4 4', w: 1.1 }
  };
  function adminColor(p) { return p.JENIS === 'kabupaten' ? '#FFFFFF' : (KAB_COLOR[p.KABUPATEN] || '#FFFFFF'); }
  var adminLayer = L.layerGroup([
    L.geoJSON(window.DATA_BATAS, { interactive: false, style: function (f) {
      return { color: '#000000', weight: ADMIN_STYLE[f.properties.JENIS].w + 2, opacity: f.properties.JENIS === 'desa' ? 0.35 : 0.6 };
    } }),
    L.geoJSON(window.DATA_BATAS, { interactive: false, style: function (f) {
      var s = ADMIN_STYLE[f.properties.JENIS];
      return { color: adminColor(f.properties), weight: s.w, opacity: 1, dashArray: s.dash };
    } })
  ]).addTo(map);

  // Poligon komoditas
  function inScope(p) {
    if (state.kab !== ALL && p.KABUPATEN !== state.kab) return false;
    if (state.kec !== ALL && p.KECAMATAN !== state.kec) return false;
    if (state.desa !== ALL && p.ID_DESA !== state.desa) return false;
    return true;
  }
  function baseStyle(f) {
    return { fillColor: color(f.properties.KOMODITAS), fillOpacity: state.opacity,
             color: '#3b3b3b', weight: 0.35, opacity: 0.45 };
  }
  var komLayer = L.geoJSON(null, {
    style: baseStyle,
    onEachFeature: function (f, layer) {
      layer.on({
        mouseover: function (e) { e.target.setStyle({ weight: 2.2, color: '#000', opacity: 1 }); },
        mouseout: function (e) { komLayer.resetStyle(e.target); },
        click: function (e) {
          var node = document.createElement('div'); node.innerHTML = popupHtml(f.properties);
          var pop = L.popup({ maxWidth: 320, minWidth: 260 }).setLatLng(e.latlng).setContent(node.firstChild).openOn(map);
          isiFoto(pop, f.properties.KOMODITAS, f.properties.ID_DESA);
        }
      });
    }
  }).addTo(map);

  function isiFoto(pop, kom, idDesa) {
    if (!window.FotoKomoditas) return;
    window.FotoKomoditas.ambil(kom, idDesa).then(function (f) {
      var el = pop.getElement(); if (!el) return;
      var box = el.querySelector('.pop-foto'); if (!box) return;
      if (!f) { box.remove(); pop.update(); return; }
      var lain = idDesa && f.idDesa !== idDesa;
      box.innerHTML = '<img src="' + esc(f.thumb) + '" alt="Foto lapangan ' + esc(f.ket) + '" title="Klik untuk memperbesar">' +
        '<div class="kredit">' + window.FotoKomoditas.kredit(f) +  + '</div>';
      box.classList.remove('loading');
      var img = box.querySelector('img');
      img.addEventListener('load', function () { pop.update(); });
      img.addEventListener('click', function () { window.FotoKomoditas.lightbox([f], 0); });
    });
  }
  // Angka di popup diambil dari tabel Excel (sama dengan peta cetak), level desa
  var STAT_DESA = {};
  (window.DATA_STAT || []).forEach(function (r) {
    var d = STAT_DESA[r.ID_DESA] || (STAT_DESA[r.ID_DESA] = { kelas: {}, n: {}, kom: 0, all: 0 });
    d.kelas[r.KELAS] = (d.kelas[r.KELAS] || 0) + r.LUAS_HA; d.n[r.KELAS] = (d.n[r.KELAS] || 0) + r.N;
  });
  // total dihitung dari luas per kelas yang dibulatkan 2 desimal, agar sama dengan tabel profil desa
  Object.keys(STAT_DESA).forEach(function (id) {
    var d = STAT_DESA[id]; d.all = 0; d.kom = 0;
    Object.keys(d.kelas).forEach(function (k) {
      var v = d.kelas[k]; d.all += v;
      if (KOM_ORDER.indexOf(k) > -1) d.kom += v;
    });
  });
  function popupHtml(p) {
    var s = STAT_DESA[p.ID_DESA], ha = s ? (s.kelas[p.KOMODITAS] || 0) : null;
    var kom = isKom(p.KOMODITAS);
    var rows = '<tr><td>Luas poligon ini</td><td><strong>' + fmt.format(p.LUAS_HA) + ' Ha</strong></td></tr>' +
      '<tr><td>Desa</td><td>' + esc(p.DESA) + '</td></tr>' +
      '<tr><td>Kecamatan</td><td>' + esc(p.KECAMATAN) + '</td></tr>' +
      '<tr><td>Kabupaten</td><td>' + esc(p.KABUPATEN) + '</td></tr>';
    if (s && ha) {
      rows += '<tr><td>Total di desa</td><td>' + fmt.format(ha) + ' Ha (' + fmtInt.format(s.n[p.KOMODITAS]) + ' poligon)</td></tr>' +
        (kom ? '<tr><td>Porsi lahan komoditas</td><td>' + (ha / s.kom * 100).toFixed(1).replace('.', ',') + '%</td></tr>' : '') +
        '<tr><td>Porsi wilayah desa</td><td>' + (ha / s.all * 100).toFixed(1).replace('.', ',') + '%</td></tr>';
    } else {
      rows += '<tr><td>Luas di desa</td><td>Belum tercatat di tabel tutupan</td></tr>';
    }
    rows += '<tr><td>Koordinat</td><td>' + p.LAT.toFixed(6) + ', ' + p.LON.toFixed(6) + '</td></tr>';
    return '<div class="pop"><div class="pop-foto loading" aria-hidden="false"></div><h3><span class="sw" style="background:' + color(p.KOMODITAS) + '"></span>' + (kom ? 'Komoditas ' : '') + esc(p.KOMODITAS) + '</h3>' +
      '<div class="id">' + esc(p.ID_POLIGON) + ' · ' + esc(p.ID_DESA) + '</div><table>' + rows + '</table>' +
      '</div>';
  }

  // Label desa
  var labelLayer = L.layerGroup().addTo(map);
  var FOCUS_NAMES = FOCUS.map(function (id) { return DESA_BY_ID[id] ? DESA_BY_ID[id].KECAMATAN + '|' + DESA_BY_ID[id].DESA : ''; });
  (window.DATA_LABEL || DESA).forEach(function (d) {
    var isFocus = FOCUS_NAMES.indexOf(d.KECAMATAN + '|' + d.DESA) > -1;
    L.tooltip({ permanent: true, direction: 'center', className: 'desa-label' + (isFocus ? ' focus' : ''), interactive: false })
      .setLatLng([d.LAT, d.LON]).setContent(esc(d.DESA)).addTo(labelLayer);
  });
  function syncLabels() {
    var show = $('chkLabel').checked && map.getZoom() >= 12;
    if (show && !map.hasLayer(labelLayer)) labelLayer.addTo(map);
    if (!show && map.hasLayer(labelLayer)) map.removeLayer(labelLayer);
  }
  map.on('zoomend', syncLabels);

  // ---------- Titik sampel komoditas ----------
  var sampelLayer = L.layerGroup();
  function sampelColor(k) { return SAMPEL_COLORS[k] || COLORS[k] || '#BDBDBD'; }
  function renderSampel() {
    sampelLayer.clearLayers();
    (window.DATA_SAMPEL || []).forEach(function (s) {
      if (!inScope({ KABUPATEN: s.KABUPATEN, KECAMATAN: s.KECAMATAN, ID_DESA: s.ID_DESA })) return;
      var m = L.circleMarker([s.LAT, s.LON], { radius: 6, color: '#1D2B24', weight: 1.6, fillColor: sampelColor(s.KOMODITAS_SAMPEL), fillOpacity: 1 });
      m.on('click', function () {
        var node = document.createElement('div');
        node.innerHTML = '<div class="pop"><div class="pop-foto loading"></div><h3><span class="sw dot" style="background:' + sampelColor(s.KOMODITAS_SAMPEL) + '"></span>Sampel ' + esc(s.KOMODITAS_SAMPEL) + '</h3>' +
          '<div class="id">' + esc(s.ID_SAMPEL) + '</div><table>' +
          (s.KOMPONEN && s.KOMPONEN !== s.KOMODITAS_SAMPEL ? '<tr><td>Komponen</td><td>' + esc(s.KOMPONEN) + '</td></tr>' : '') +
          '<tr><td>Desa</td><td>' + esc(s.DESA) + '</td></tr><tr><td>Kecamatan</td><td>' + esc(s.KECAMATAN) + '</td></tr>' +
          '<tr><td>Kabupaten</td><td>' + esc(s.KABUPATEN) + '</td></tr>' +
          '<tr><td>Koordinat (DD)</td><td>' + s.LAT.toFixed(6) + ', ' + s.LON.toFixed(6) + '</td></tr></table></div>';
        var pop = L.popup({ maxWidth: 320, minWidth: 250 }).setLatLng([s.LAT, s.LON]).setContent(node.firstChild).openOn(map);
        isiFoto(pop, s.KOMODITAS_SAMPEL, s.ID_DESA);
      });
      m.bindTooltip(esc(s.KOMODITAS_SAMPEL), { direction: 'top', offset: [0, -6] });
      m.addTo(sampelLayer);
    });
  }
  $('chkSampel').addEventListener('change', function (e) { if (e.target.checked) sampelLayer.addTo(map); else map.removeLayer(sampelLayer); });
  if ($('chkSampel').checked) sampelLayer.addTo(map);

  // ---------- Foto lapangan (titik kamera, foto ber-GPS) ----------
  var fotoLayer = L.layerGroup();
  var kameraIcon = L.divIcon({ className: 'cam-ico', iconSize: [26, 26], iconAnchor: [13, 13],
    html: '<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M9 4 7.2 6H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-3.2L15 4H9zm3 4.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/></svg>' });
  function renderFotoLayer() {
    fotoLayer.clearLayers();
    if (!window.FotoKomoditas) return;
    var semua = window.FotoKomoditas.semua().filter(function (f) { return f.lat && f.peta; });
    semua.forEach(function (f) {
      var d = DESA_BY_ID[f.idDesa] || {};
      if (!inScope({ KABUPATEN: d.KABUPATEN, KECAMATAN: d.KECAMATAN, ID_DESA: f.idDesa })) return;
      var m = L.marker([f.lat, f.lon], { icon: kameraIcon, title: f.ket, keyboard: true });
      m.on('click', function () {
        var node = document.createElement('div');
        node.innerHTML = '<div class="pop"><div class="pop-foto"><img src="' + esc(f.thumb) + '" alt="' + esc(f.ket) + '" title="Klik untuk memperbesar"></div>' +
          '<h3>' + esc(f.ket) + '</h3><div class="id">' + esc(f.id) + '</div><table>' +
          '<tr><td>Desa</td><td>' + esc(f.desa) + '</td></tr>' +
          (f.tanggal ? '<tr><td>Tanggal</td><td>' + esc(f.tanggal) + '</td></tr>' : '') +
          '<tr><td>Koordinat</td><td>' + f.lat.toFixed(6) + ', ' + f.lon.toFixed(6) + '</td></tr></table>' +
          (f.catatan ? '<p class="pop-src">' + esc(f.catatan) + '</p>' : '') + '</div>';
        var pop = L.popup({ maxWidth: 320, minWidth: 260 }).setLatLng([f.lat, f.lon]).setContent(node.firstChild).openOn(map);
        var img = pop.getElement().querySelector('img');
        img.addEventListener('load', function () { pop.update(); });
        img.addEventListener('click', function () { window.FotoKomoditas.lightbox([f], 0); });
      });
      m.addTo(fotoLayer);
    });
  }
  $('chkFoto').addEventListener('change', function (e) { if (e.target.checked) fotoLayer.addTo(map); else map.removeLayer(fotoLayer); });
  if ($('chkFoto').checked) fotoLayer.addTo(map);

  // galeri foto lapangan pada profil desa
  function renderGaleriDesa() {
    var box = $('galeriDesa'); if (!box) return;
    box.innerHTML = '';
    if (state.desa === ALL || !window.FotoKomoditas) { $('galeriWrap').hidden = true; return; }
    var list = window.FotoKomoditas.perDesa(state.desa);
    $('galeriWrap').hidden = !list.length;
    list.forEach(function (f, i) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'gthumb'; b.title = f.ket;
      b.innerHTML = '<img src="' + esc(f.thumb) + '" alt="' + esc(f.ket) + '" loading="lazy"><span>' + esc(f.kategori === 'Lanskap' || f.kategori === 'Permukiman' ? f.kategori : f.kategori + (f.jenis === 'Pascapanen' ? ' · pascapanen' : '')) + '</span>';
      b.addEventListener('click', function () { window.FotoKomoditas.lightbox(list, i); });
      box.appendChild(b);
    });
  }

  // ---------- Render ----------
  function scopeFeatures() { return FEATURES.filter(function (f) { return inScope(f.properties); }); }

  function render(fit) {
    var scoped = scopeFeatures();
    komLayer.clearLayers();
    komLayer.addData({ type: 'FeatureCollection', features: scoped.filter(function (f) { return !state.hidden[f.properties.KOMODITAS]; }) });
    renderLegend(scoped);
    renderSampel();
    renderFotoLayer();
    renderGaleriDesa();
    renderProfile(scoped);
    if (fit && scoped.length) {
      var b = L.geoJSON({ type: 'FeatureCollection', features: scoped }).getBounds();
      var p = $('panel');
      var mobileOpen = window.innerWidth <= 820 && !p.classList.contains('closed');
      map.fitBounds(b, mobileOpen
        ? { paddingTopLeft: [16, 60], paddingBottomRight: [16, p.offsetHeight + 16], maxZoom: 15 }
        : { padding: [24, 24], maxZoom: 15 });
    }
    writeHash();
  }

  function scopeText() {
    if (state.desa !== ALL) { var d = DESA_BY_ID[state.desa]; return 'Desa ' + d.DESA; }
    if (state.kec !== ALL) return 'Kec. ' + state.kec;
    if (state.kab !== ALL) return 'Kab. ' + state.kab;
    return 'Seluruh wilayah';
  }

  // Angka luas resmi: tabel Excel (sheet DATABASE) = angka peta cetak
  function excelKomoditas() {
    var agg = {};
    (window.DATA_STAT || []).forEach(function (r) {
      if (r.JENIS !== 'Komoditas') return;
      if (!inScope({ KABUPATEN: r.KAB, KECAMATAN: r.KEC, ID_DESA: r.ID_DESA })) return;
      agg[r.KELAS] = agg[r.KELAS] || { ha: 0, n: 0 };
      agg[r.KELAS].ha += r.LUAS_HA; agg[r.KELAS].n += r.N;
    });
    return agg;
  }
  function aggAll() {
    var agg = {};
    (window.DATA_STAT || []).forEach(function (r) {
      if (!inScope({ KABUPATEN: r.KAB, KECAMATAN: r.KEC, ID_DESA: r.ID_DESA })) return;
      agg[r.KELAS] = (agg[r.KELAS] || 0) + r.LUAS_HA;
    });
    return agg;
  }
  function renderLegend(scoped) {
    var agg = aggAll();
    var komKeys = KOM_ORDER.filter(function (k) { return agg[k]; });
    var lainKeys = Object.keys(agg).filter(function (k) { return !isKom(k); }).sort(function (x, y) { return agg[y] - agg[x]; });
    var tb = $('legendTable').tBodies[0]; tb.innerHTML = '';
    var keys = [{ head: 'Komoditas' }].concat(komKeys).concat(lainKeys.length ? [{ head: 'Tutupan lahan lain' }] : []).concat(lainKeys);
    keys.forEach(function (k) {
      if (typeof k === 'object') { var h = document.createElement('tr'); h.className = 'grp'; h.innerHTML = '<td></td><td>' + k.head + '</td>'; tb.appendChild(h); return; }
      var off = !!state.hidden[k];
      var tr = document.createElement('tr'); if (off) tr.className = 'off';
      var id = 'chk_' + k.replace(/\W/g, '');
      tr.innerHTML = '<td><input type="checkbox" id="' + id + '"' + (off ? '' : ' checked') + '></td>' +
        '<td><label for="' + id + '"><span class="sw" style="background:' + color(k) + '"></span><img class="thumb" alt="" hidden>' + esc(k) + '</label></td>';
      tr.querySelector('input').addEventListener('change', function (e) {
        if (e.target.checked) delete state.hidden[k]; else state.hidden[k] = true;
        render(false);
      });
      tb.appendChild(tr);
      if (window.FotoKomoditas && isKom(k)) {
        var im = tr.querySelector('img.thumb');
        window.FotoKomoditas.ambil(k, state.desa !== ALL ? state.desa : null).then(function (f) {
          if (!f) return;
          im.src = f.thumb; im.hidden = false;
          im.title = k + ' – foto lapangan Desa ' + f.desa;
        });
      }
    });
    $('scopeLabel').textContent = scopeText();
  }

  function renderProfile(scoped) {
    var blk = $('profileBlock');
    if (state.desa === ALL) { blk.hidden = true; return; }
    var t = TUTUPAN[state.desa]; var d = DESA_BY_ID[state.desa];
    blk.hidden = false;
    $('profileDesa').textContent = d.DESA;
    // komposisi komoditas (dari tabel Excel, sama dengan peta cetak)
    var ex = excelKomoditas(), agg = {}, tot = 0;
    Object.keys(ex).forEach(function (k) { agg[k] = ex[k].ha; tot += ex[k].ha; });
    var bar = $('shareBar'); bar.innerHTML = '';
    KOM_ORDER.forEach(function (k) {
      if (!agg[k]) return;
      var s = document.createElement('span');
      s.style.width = (agg[k] / tot * 100) + '%'; s.style.background = color(k);
      s.title = k + ': ' + fmt.format(agg[k]) + ' Ha (' + (agg[k] / tot * 100).toFixed(1) + '%)';
      bar.appendChild(s);
    });
    var tb = $('landuseTable').tBodies[0]; tb.innerHTML = '';
    if (!t) { tb.innerHTML = '<tr><td colspan="3">Data tidak tersedia.</td></tr>'; return; }
    var sum = 0; (window.DATA_STAT || []).forEach(function (r) { if (r.ID_DESA === state.desa) sum += r.LUAS_HA; });
    function persen(v) { var p = v / sum * 100; return p > 0 && p < 0.05 ? '&lt;0,1' : p.toFixed(1).replace('.', ','); }
    Object.keys(t.TUTUPAN).forEach(function (k) {
      var v = t.TUTUPAN[k];
      var label = KOM_ORDER.indexOf(k) > -1 ? 'Komoditas ' + k : k;
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><span class="sw" style="background:' + color(k) + '"></span>' + esc(label) + '</td>' +
        '<td class="num">' + fmt.format(v) + '</td><td class="num">' + persen(v) + '</td>';
      tb.appendChild(tr);
    });
    var tf = document.createElement('tr');
    tf.innerHTML = '<td><strong>Total</strong></td><td class="num"><strong>' + fmt.format(sum) + '</strong></td><td class="num">100</td>';
    tb.appendChild(tf);
    if (d.LUAS_WILAYAH) {
      $('profileNote').textContent = 'Luas wilayah desa: ' + fmt.format(d.LUAS_WILAYAH) + ' Ha (BIG, 2019).';
    }
  }

  // ---------- Filter wilayah ----------
  function uniq(arr) { return arr.filter(function (v, i) { return arr.indexOf(v) === i; }).sort(); }
  function fillSelect(sel, items, allLabel, value) {
    sel.innerHTML = '<option value="' + ALL + '">' + allLabel + '</option>' +
      items.map(function (it) { return '<option value="' + esc(it.v) + '">' + esc(it.t) + '</option>'; }).join('');
    sel.value = value;
  }
  function refreshSelects() {
    var kabs = uniq(DESA.map(function (d) { return d.KABUPATEN; }));
    fillSelect($('selKab'), kabs.map(function (k) { return { v: k, t: k }; }), 'Semua kabupaten', state.kab);
    var kecs = uniq(DESA.filter(function (d) { return state.kab === ALL || d.KABUPATEN === state.kab; }).map(function (d) { return d.KECAMATAN; }));
    fillSelect($('selKec'), kecs.map(function (k) { return { v: k, t: k }; }), 'Semua kecamatan', state.kec);
    var ds = DESA.filter(function (d) {
      return (state.kab === ALL || d.KABUPATEN === state.kab) && (state.kec === ALL || d.KECAMATAN === state.kec);
    }).sort(function (a, b) { return a.DESA.localeCompare(b.DESA); });
    fillSelect($('selDesa'), ds.map(function (d) { return { v: d.ID_DESA, t: d.DESA + (state.kec === ALL ? ' (' + d.KECAMATAN + ')' : '') }; }), 'Semua desa', state.desa);
    document.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', c.dataset.id === state.desa ? 'true' : 'false'); });
  }
  function selectDesa(id) {
    var d = DESA_BY_ID[id];
    if (!d) { state.desa = ALL; } else { state.kab = d.KABUPATEN; state.kec = d.KECAMATAN; state.desa = id; }
    refreshSelects(); render(true);
  }
  $('selKab').addEventListener('change', function (e) { state.kab = e.target.value; state.kec = ALL; state.desa = ALL; refreshSelects(); render(true); });
  $('selKec').addEventListener('change', function (e) { state.kec = e.target.value; state.desa = ALL; refreshSelects(); render(true); });
  $('selDesa').addEventListener('change', function (e) {
    if (e.target.value === ALL) { state.desa = ALL; refreshSelects(); render(true); } else selectDesa(e.target.value);
  });

  var chipBox = $('focusChips');
  FOCUS.forEach(function (id) {
    var d = DESA_BY_ID[id]; if (!d) return;
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'chip'; b.dataset.id = id; b.textContent = d.DESA; b.title = 'Kec. ' + d.KECAMATAN + ', Kab. ' + d.KABUPATEN;
    b.addEventListener('click', function () { selectDesa(state.desa === id ? '' : id); });
    chipBox.appendChild(b);
  });

  // ---------- Lapisan ----------
  $('chkAdmin').addEventListener('change', function (e) { if (e.target.checked) adminLayer.addTo(map); else map.removeLayer(adminLayer); });
  $('chkLabel').addEventListener('change', syncLabels);
  $('rngOpacity').addEventListener('input', function (e) {
    state.opacity = e.target.value / 100; $('outOpacity').textContent = e.target.value + '%';
    komLayer.setStyle(baseStyle);
  });

  // ---------- Koordinat kursor ----------
  map.on('mousemove', function (e) { $('coord').textContent = 'Lat ' + e.latlng.lat.toFixed(6) + ', Lon ' + e.latlng.lng.toFixed(6); });

  // ---------- Panel (mobile) ----------
  $('panelToggle').addEventListener('click', function () {
    var p = $('panel'); var closed = p.classList.toggle('closed');
    this.textContent = closed ? 'Buka panel' : 'Tutup panel'; this.setAttribute('aria-expanded', String(!closed));
    setTimeout(function () { map.invalidateSize(); }, 260);
  });

  // ---------- URL hash (tautan bisa dibagikan) ----------
  function writeHash() {
    var h = state.desa !== ALL ? 'desa=' + state.desa : state.kec !== ALL ? 'kec=' + encodeURIComponent(state.kec) : state.kab !== ALL ? 'kab=' + encodeURIComponent(state.kab) : '';
    history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
    $('linkStat').href = 'statistik.html' + (h ? '#' + h : '');
  }
  function readHash() {
    var h = location.hash.replace(/^#/, ''); if (!h) return false;
    var kv = h.split('='); var v = decodeURIComponent(kv[1] || '');
    if (kv[0] === 'desa' && DESA_BY_ID[v]) { selectDesa(v); return true; }
    if (kv[0] === 'kec') { var d = DESA.filter(function (x) { return x.KECAMATAN === v; })[0]; if (d) { state.kab = d.KABUPATEN; state.kec = v; refreshSelects(); render(true); return true; } }
    if (kv[0] === 'kab') { state.kab = v; refreshSelects(); render(true); return true; }
    return false;
  }

  refreshSelects();
  if (!readHash()) render(true);
  syncLabels();
})();

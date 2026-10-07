/* Dashboard statistik komoditas & tutupan lahan – LTKL */
(function () {
  'use strict';
  var COLORS = {
    'Campuran': '#FF7F7F', 'Jagung': '#D1FFBE', 'Kelapa': '#00E6A9', 'Sawit': '#38A800',
    'Tebu': '#C77DFF', 'Kemiri': '#FFFF00', 'Cengkeh': '#55FF00', 'Jeruk': '#3D5AFE',
    'Hutan': '#00734C', 'Sawah': '#4CE600', 'Semak Belukar': '#CDF57A', 'Lahan Terbuka': '#CDCD66',
    'Permukiman': '#FFAA00', 'Jalan': '#E60000', 'Sungai': '#00C5FF', 'Kolam': '#73B2FF', 'Kolam Ikan': '#73B2FF',
    'Danau': '#00C5FF', 'Waduk/Embung': '#00C5FF', 'Saluran Irigasi dan Drainase': '#00C5FF',
    'Tambang Pasir dan Batuan': '#A87000', 'Lapangan': '#D7C29E', 'Makam': '#9C9C9C'
  };
  var KOM = ['Jagung', 'Campuran', 'Kelapa', 'Sawit', 'Tebu', 'Kemiri', 'Cengkeh', 'Jeruk'];
  var FOCUS = ['GTO-ASP-BIHE', 'GTO-ASP-PANGAHU', 'GTO-TLG-DULAMAYOSELATAN', 'GTO-TLB-DULAMAYOUTARA',
               'BBL-BLU-ILOMATA', 'BBL-BLU-SUKAMAKMUR', 'BBL-TLK-LONUO', 'BBL-SWS-MOLINTOGUPO'];
  var ALL = '__all__';
  var DATA = window.DATA_STAT;
  var state = { kab: ALL, kec: ALL, desa: ALL, hutan: false };
  var charts = {};
  var sortState = { col: null, dir: -1 };

  var nf = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  var nf0 = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 });
  var nf1 = new Intl.NumberFormat('id-ID', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  function $(id) { return document.getElementById(id); }
  function col(k) { return COLORS[k] || '#BDBDBD'; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }).sort(function (x, y) { return x.localeCompare(y); }); }
  function sumBy(rows, key) { var o = {}; rows.forEach(function (r) { o[r[key]] = (o[r[key]] || 0) + r.LUAS_HA; }); return o; }
  function pct(a, b) { return b ? a / b * 100 : 0; }

  var DESA = {};
  DATA.forEach(function (r) { DESA[r.ID_DESA] = { id: r.ID_DESA, desa: r.DESA, kec: r.KEC, kab: r.KAB }; });
  var DESA_LIST = Object.keys(DESA).map(function (k) { return DESA[k]; });

  // ---------- Chart.js defaults ----------
  Chart.defaults.font.family = '"Plus Jakarta Sans", system-ui, sans-serif';
  Chart.defaults.font.size = 12.5;
  Chart.defaults.color = '#1D2B24';
  Chart.defaults.plugins.legend.labels.boxWidth = 14;
  Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(29,43,36,.95)';
  var EDGE = 'rgba(0,0,0,.28)';

  // ---------- scope ----------
  function inScope(r) {
    return (state.kab === ALL || r.KAB === state.kab) && (state.kec === ALL || r.KEC === state.kec) && (state.desa === ALL || r.ID_DESA === state.desa);
  }
  function scopeName() {
    if (state.desa !== ALL) return 'Desa ' + DESA[state.desa].desa;
    if (state.kec !== ALL) return 'Kecamatan ' + state.kec;
    if (state.kab !== ALL) return 'Kabupaten ' + state.kab;
    return 'seluruh wilayah kajian';
  }

  // ---------- filters ----------
  function fill(sel, items, allText, val) {
    sel.innerHTML = '<option value="' + ALL + '">' + allText + '</option>' + items.map(function (i) {
      return '<option value="' + esc(i.v) + '">' + esc(i.t) + '</option>';
    }).join('');
    sel.value = val;
  }
  function refreshFilters() {
    fill($('fKab'), uniq(DESA_LIST.map(function (d) { return d.kab; })).map(function (k) { return { v: k, t: k }; }), 'Semua kabupaten', state.kab);
    fill($('fKec'), uniq(DESA_LIST.filter(function (d) { return state.kab === ALL || d.kab === state.kab; }).map(function (d) { return d.kec; }))
      .map(function (k) { return { v: k, t: k }; }), 'Semua kecamatan', state.kec);
    var ds = DESA_LIST.filter(function (d) { return (state.kab === ALL || d.kab === state.kab) && (state.kec === ALL || d.kec === state.kec); })
      .sort(function (a, b) { return a.desa.localeCompare(b.desa); });
    fill($('fDesa'), ds.map(function (d) { return { v: d.id, t: d.desa + (FOCUS.indexOf(d.id) > -1 ? ' ●' : '') + (state.kec === ALL ? ' (' + d.kec + ')' : '') }; }), 'Semua desa', state.desa);
  }
  $('fKab').addEventListener('change', function (e) { state.kab = e.target.value; state.kec = ALL; state.desa = ALL; update(); });
  $('fKec').addEventListener('change', function (e) {
    state.kec = e.target.value; state.desa = ALL;
    if (state.kec !== ALL) state.kab = DESA_LIST.filter(function (d) { return d.kec === state.kec; })[0].kab;
    update();
  });
  $('fDesa').addEventListener('change', function (e) {
    state.desa = e.target.value;
    if (state.desa !== ALL) { state.kab = DESA[state.desa].kab; state.kec = DESA[state.desa].kec; }
    update();
  });
  $('fHutan').addEventListener('change', function (e) { state.hutan = e.target.checked; drawTutupan(DATA.filter(inScope)); });
  $('fReset').addEventListener('click', function () { state.kab = state.kec = state.desa = ALL; update(); });

  // ---------- KPI + narasi ----------
  function drawSummary(rows) {
    var kom = rows.filter(function (r) { return r.JENIS === 'Komoditas'; });
    var byKom = sumBy(kom, 'KELAS');
    var totKom = 0; Object.keys(byKom).forEach(function (k) { totKom += byKom[k]; });
    var totAll = 0; rows.forEach(function (r) { totAll += r.LUAS_HA; });
    var hutan = 0; rows.forEach(function (r) { if (r.KELAS === 'Hutan') hutan += r.LUAS_HA; });
    var ranked = Object.keys(byKom).sort(function (a, b) { return byKom[b] - byKom[a]; });
    var desaIds = uniq(rows.map(function (r) { return r.ID_DESA; }));

    $('kKom').textContent = nf0.format(totKom);
    $('kDom').textContent = ranked[0] || '–';
    $('kDomL').textContent = ranked[0] ? 'komoditas dominan, ' + nf1.format(pct(byKom[ranked[0]], totKom)) + '% luas komoditas' : 'komoditas dominan';
    $('kHut').textContent = nf0.format(hutan);
    if (state.desa !== ALL) { $('kDesa').textContent = nf1.format(pct(totKom, totAll)) + '%'; $('kDesaL').textContent = 'porsi lahan komoditas dari total tutupan'; }
    else { $('kDesa').textContent = desaIds.length; $('kDesaL').textContent = 'desa tercakup'; }
    $('scopeName').textContent = '– ' + scopeName();

    var s = [];
    if (!ranked.length) { $('narasi').textContent = 'Belum ada data komoditas pada wilayah ini.'; return; }
    s.push('Lahan komoditas di ' + scopeName() + ' tercatat <strong>' + nf.format(totKom) + ' Ha</strong>' +
      (desaIds.length > 1 ? ' yang tersebar di ' + desaIds.length + ' desa' : '') + '.');
    var top = ranked.slice(0, 3).map(function (k) { return '<strong>' + esc(k) + '</strong> (' + nf1.format(pct(byKom[k], totKom)) + '%)'; });
    s.push(ranked.length > 1 ? 'Komoditas terluas berturut-turut ' + top.join(', ') + '.' : 'Seluruhnya berupa komoditas ' + top[0] + '.');
    s.push('Lahan komoditas mencakup ' + nf1.format(pct(totKom, totAll)) + '% dari total tutupan lahan terpetakan (' + nf0.format(totAll) +
      ' Ha), sedangkan hutan ' + nf1.format(pct(hutan, totAll)) + '%.');
    if (desaIds.length > 1) {
      var byDesa = sumBy(kom, 'ID_DESA');
      var best = Object.keys(byDesa).sort(function (a, b) { return byDesa[b] - byDesa[a]; })[0];
      s.push('Desa dengan lahan komoditas terluas adalah <strong>' + esc(DESA[best].desa) + '</strong> (' + nf.format(byDesa[best]) + ' Ha).');
    }
    $('narasi').innerHTML = s.join(' ');
  }

  // ---------- Galeri komoditas ----------
  function drawGaleri(rows) {
    var kom = rows.filter(function (r) { return r.JENIS === 'Komoditas'; });
    var by = sumBy(kom, 'KELAS'), tot = 0; Object.keys(by).forEach(function (k) { tot += by[k]; });
    var desaN = {}, desaTop = {};
    kom.forEach(function (r) {
      desaN[r.KELAS] = desaN[r.KELAS] || {}; desaN[r.KELAS][r.ID_DESA] = (desaN[r.KELAS][r.ID_DESA] || 0) + r.LUAS_HA;
    });
    Object.keys(desaN).forEach(function (k) {
      desaTop[k] = Object.keys(desaN[k]).sort(function (a, b) { return desaN[k][b] - desaN[k][a]; })[0];
    });
    var order = KOM.slice().sort(function (a, b) { return (by[b] || 0) - (by[a] || 0); });
    $('galeriScope').textContent = scopeName().charAt(0).toUpperCase() + scopeName().slice(1);
    var box = $('galeri'); box.innerHTML = '';
    var KAT = window.FotoKomoditas ? window.FotoKomoditas.katalog : {};
    order.forEach(function (k) {
      var ada = !!by[k]; var info = KAT[k] || {};
      var card = document.createElement('article');
      card.className = 'kartu' + (ada ? '' : ' absen');
      var nDesa = ada ? Object.keys(desaN[k]).length : 0;
      card.innerHTML =
        '<div class="foto" style="--c:' + col(k) + '"><span class="tag" style="background:' + col(k) + '"></span></div>' +
        '<div class="isi">' +
          '<h4>' + esc(k) + '</h4>' +
          (info.ilmiah ? '<p class="ilmiah">' + esc(info.ilmiah) + '</p>' : '') +
          (ada
            ? '<p class="angka"><strong>' + nf.format(by[k]) + ' Ha</strong> · ' + nf1.format(pct(by[k], tot)) + '% · ' + nDesa + ' desa</p>' +
              (nDesa > 1 ? '<p class="terluas">Terluas di ' + esc(DESA[desaTop[k]].desa) + ' (' + nf0.format(desaN[k][desaTop[k]]) + ' Ha)</p>' : '')
            : '<p class="angka">Tidak terdapat di wilayah ini</p>') +
          '<p class="ket">' + esc(window.FotoKomoditas ? window.FotoKomoditas.narasi(k, state.desa !== ALL ? state.desa : null) : '') + '</p>' +
          '<p class="kredit"></p>' +
        '</div>';
      box.appendChild(card);
      if (window.FotoKomoditas) {
        window.FotoKomoditas.ambil(k, state.desa !== ALL ? state.desa : null).then(function (f) {
          if (!f) { card.querySelector('.foto').classList.add('kosong'); return; }
          var img = new Image(); img.alt = 'Foto lapangan ' + f.ket; img.loading = 'lazy'; img.src = f.thumb;
          img.title = 'Klik untuk memperbesar';
          img.addEventListener('click', function () { window.FotoKomoditas.lightbox([f], 0); });
          card.querySelector('.foto').appendChild(img);
          card.querySelector('.kredit').innerHTML = window.FotoKomoditas.kredit(f);
        });
      }
    });
  }

  // ---------- Galeri foto lapangan ----------
  var FILTER_FOTO = 'Semua';
  function drawFotoLapangan(rows) {
    var box = $('fotoGrid'); if (!box || !window.FotoKomoditas) return;
    var ids = uniq(rows.map(function (r) { return r.ID_DESA; }));
    var semua = window.FotoKomoditas.semua().filter(function (f) { return ids.indexOf(f.idDesa) > -1; });
    var list = semua.filter(function (f) { return FILTER_FOTO === 'Semua' || f.jenis === FILTER_FOTO; });
    $('fotoInfo').textContent = semua.length
      ? semua.length + ' foto · ' + uniq(semua.map(function (f) { return f.desa; })).length + ' desa'
      : '';
    $('fotoPanel').hidden = !semua.length;
    document.querySelectorAll('#fotoFilter button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.f === FILTER_FOTO ? 'true' : 'false'); });
    box.innerHTML = '';
    var desaUrut = uniq(list.map(function (f) { return f.desa; }));
    desaUrut.forEach(function (dn) {
      var sub = list.filter(function (f) { return f.desa === dn; });
      var h = document.createElement('h4'); h.className = 'foto-desa'; h.textContent = 'Desa ' + dn + ' (' + sub.length + ')';
      box.appendChild(h);
      var g = document.createElement('div'); g.className = 'foto-grid';
      sub.forEach(function (f) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'foto-item';
        b.innerHTML = '<img src="' + esc(f.thumb) + '" alt="' + esc(f.ket) + '" loading="lazy">' +
          '<span class="cap"><strong>' + esc(f.kategori) + '</strong>' + (f.jenis === 'Pascapanen' ? ' · pascapanen' : '') + '<br>' + esc(f.ket) + '</span>' +
          (f.lat ? '<span class="gps" title="Foto memiliki koordinat GPS">GPS</span>' : '');
        b.addEventListener('click', function () { window.FotoKomoditas.lightbox(list, list.indexOf(f)); });
        g.appendChild(b);
      });
      box.appendChild(g);
    });
  }
  document.querySelectorAll('#fotoFilter button').forEach(function (b) {
    b.addEventListener('click', function () { FILTER_FOTO = b.dataset.f; drawFotoLapangan(DATA.filter(inScope)); });
  });

  // ---------- Donut ----------
  function drawDonut(rows) {
    var by = sumBy(rows.filter(function (r) { return r.JENIS === 'Komoditas'; }), 'KELAS');
    var keys = KOM.filter(function (k) { return by[k]; });
    var tot = keys.reduce(function (a, k) { return a + by[k]; }, 0);
    var cfg = {
      type: 'doughnut',
      data: { labels: keys, datasets: [{ data: keys.map(function (k) { return +by[k].toFixed(2); }), backgroundColor: keys.map(col), borderColor: '#fff', borderWidth: 2 }] },
      options: {
        maintainAspectRatio: false, cutout: '58%',
        plugins: {
          legend: { position: 'bottom' },
          tooltip: { callbacks: { label: function (c) { return ' ' + c.label + ': ' + nf.format(c.raw) + ' Ha (' + nf1.format(pct(c.raw, tot)) + '%)'; } } }
        }
      }
    };
    replace('cDonut', cfg);
  }

  // ---------- Per unit ----------
  function drawUnit(rows) {
    var kom = rows.filter(function (r) { return r.JENIS === 'Komoditas'; });
    var unitKey, title;
    if (state.desa !== ALL) { unitKey = null; title = 'Luas komoditas desa ' + DESA[state.desa].desa; }
    else if (state.kec !== ALL) { unitKey = 'DESA'; title = 'Luas komoditas per desa'; }
    else { unitKey = 'KEC'; title = 'Luas komoditas per kecamatan'; }
    $('hUnit').textContent = title;
    $('pUnit').textContent = '';
    var cfg;
    if (!unitKey) {
      var by = sumBy(kom, 'KELAS'); var keys = KOM.filter(function (k) { return by[k]; }).sort(function (a, b) { return by[b] - by[a]; });
      cfg = { type: 'bar', data: { labels: keys, datasets: [{ label: 'Luas (Ha)', data: keys.map(function (k) { return +by[k].toFixed(2); }),
        backgroundColor: keys.map(col), borderColor: EDGE, borderWidth: 1 }] },
        options: baseBarOpts(false) };
    } else {
      var units = uniq(kom.map(function (r) { return r[unitKey]; }));
      var tot = {}; kom.forEach(function (r) { tot[r[unitKey]] = (tot[r[unitKey]] || 0) + r.LUAS_HA; });
      units.sort(function (a, b) { return tot[b] - tot[a]; });
      var present = KOM.filter(function (k) { return kom.some(function (r) { return r.KELAS === k; }); });
      cfg = { type: 'bar', data: { labels: units, datasets: present.map(function (k) {
        return { label: k, backgroundColor: col(k), borderColor: EDGE, borderWidth: 1,
          data: units.map(function (u) { var v = 0; kom.forEach(function (r) { if (r[unitKey] === u && r.KELAS === k) v += r.LUAS_HA; }); return +v.toFixed(2); }) };
      }) }, options: baseBarOpts(true) };
      $('cUnit').parentNode.style.height = Math.max(300, units.length * 34 + 90) + 'px';
    }
    if (!unitKey) $('cUnit').parentNode.style.height = '';
    replace('cUnit', cfg);
  }
  function baseBarOpts(stacked) {
    return {
      indexAxis: 'y', maintainAspectRatio: false,
      scales: {
        x: { stacked: stacked, title: { display: true, text: 'Hektare (Ha)' }, ticks: { callback: function (v) { return nf0.format(v); } }, grid: { color: '#EEF0EA' } },
        y: { stacked: stacked, grid: { display: false } }
      },
      plugins: {
        legend: { display: stacked, position: 'bottom' },
        tooltip: { callbacks: { label: function (c) { return ' ' + (c.dataset.label === 'Luas (Ha)' ? c.label : c.dataset.label) + ': ' + nf.format(c.raw) + ' Ha'; } } }
      }
    };
  }

  // ---------- Tutupan ----------
  function drawTutupan(rows) {
    var by = sumBy(rows, 'KELAS');
    var tot = 0; Object.keys(by).forEach(function (k) { tot += by[k]; });
    var keys = Object.keys(by).filter(function (k) { return state.hutan || k !== 'Hutan'; }).sort(function (a, b) { return by[b] - by[a]; });
    var label = function (k) { return KOM.indexOf(k) > -1 && window.innerWidth > 600 ? 'Komoditas ' + k : k; };
    $('tutupWrap').style.height = Math.max(260, keys.length * 30 + 70) + 'px';
    $('tutupNote').textContent = state.hutan ? '' : 'Tidak termasuk hutan (' + nf.format(by['Hutan'] || 0) + ' Ha).';
    replace('cTutup', {
      type: 'bar',
      data: { labels: keys.map(label), datasets: [{ label: 'Luas (Ha)', data: keys.map(function (k) { return +by[k].toFixed(2); }),
        backgroundColor: keys.map(col), borderColor: EDGE, borderWidth: 1 }] },
      options: {
        indexAxis: 'y', maintainAspectRatio: false,
        scales: { x: { title: { display: true, text: 'Hektare (Ha)' }, ticks: { callback: function (v) { return nf0.format(v); } }, grid: { color: '#EEF0EA' } }, y: { grid: { display: false } } },
        plugins: { legend: { display: false }, tooltip: { callbacks: { label: function (c) { return ' ' + nf.format(c.raw) + ' Ha (' + nf1.format(pct(c.raw, tot)) + '% dari total tutupan)'; } } } }
      }
    });
  }

  // ---------- Desa fokus (100%) ----------
  function drawFocus() {
    var rows = DATA.filter(function (r) { return r.JENIS === 'Komoditas' && FOCUS.indexOf(r.ID_DESA) > -1; });
    var tot = {}; rows.forEach(function (r) { tot[r.ID_DESA] = (tot[r.ID_DESA] || 0) + r.LUAS_HA; });
    var ids = FOCUS.filter(function (id) { return tot[id]; });
    var present = KOM.filter(function (k) { return rows.some(function (r) { return r.KELAS === k; }); });
    var ha = function (id, k) { var v = 0; rows.forEach(function (r) { if (r.ID_DESA === id && r.KELAS === k) v += r.LUAS_HA; }); return v; };
    replace('cFocus', {
      type: 'bar',
      data: { labels: ids.map(function (id) { return [DESA[id].desa, DESA[id].kec + ' · ' + nf0.format(tot[id]) + ' Ha']; }),
        datasets: present.map(function (k) {
          return { label: k, backgroundColor: col(k), borderColor: EDGE, borderWidth: 1,
            data: ids.map(function (id) { return +pct(ha(id, k), tot[id]).toFixed(2); }), ha: ids.map(function (id) { return ha(id, k); }) };
        }) },
      options: {
        indexAxis: 'y', maintainAspectRatio: false,
        scales: { x: { stacked: true, max: 100, ticks: { callback: function (v) { return v + '%'; } }, grid: { color: '#EEF0EA' } }, y: { stacked: true, grid: { display: false } } },
        plugins: { legend: { position: 'bottom' },
          tooltip: { callbacks: { label: function (c) { return ' ' + c.dataset.label + ': ' + nf1.format(c.raw) + '% (' + nf.format(c.dataset.ha[c.dataIndex]) + ' Ha)'; } } } }
      }
    });
    $('cFocus').parentNode.style.height = (ids.length * 52 + 90) + 'px';
  }

  // ---------- Peta cetak ----------
  function drawMap() {
    var show = state.desa !== ALL && FOCUS.indexOf(state.desa) > -1;
    $('mapPanel').hidden = !show;
    if (!show) return;
    var src = 'img/peta_' + state.desa + '.jpg';
    $('mapImg').src = src; $('mapImg').alt = 'Peta sebaran komoditas pertanian Desa ' + DESA[state.desa].desa;
    $('mapImgLink').href = src;
    $('mapName').textContent = DESA[state.desa].desa;
    $('mapLink').href = 'index.html#desa=' + state.desa;
  }

  // ---------- Tabel pivot ----------
  var pivotRows = [], pivotCols = [];
  function buildPivot(rows) {
    var present = KOM.filter(function (k) { return rows.some(function (r) { return r.KELAS === k; }); });
    pivotCols = [{ key: 'desa', label: 'Desa', text: true }, { key: 'kec', label: 'Kecamatan', text: true }]
      .concat(present.map(function (k) { return { key: k, label: k, kom: true }; }))
      .concat([{ key: '_kom', label: 'Total komoditas' }, { key: '_hutan', label: 'Hutan' }, { key: '_all', label: 'Total tutupan' }]);
    var map = {};
    rows.forEach(function (r) {
      var o = map[r.ID_DESA] || (map[r.ID_DESA] = { id: r.ID_DESA, desa: r.DESA, kec: r.KEC, _kom: 0, _hutan: 0, _all: 0 });
      if (r.JENIS === 'Komoditas') { o[r.KELAS] = (o[r.KELAS] || 0) + r.LUAS_HA; o._kom += r.LUAS_HA; }
      if (r.KELAS === 'Hutan') o._hutan += r.LUAS_HA;
      o._all += r.LUAS_HA;
    });
    pivotRows = Object.keys(map).map(function (k) { return map[k]; });
    if (!sortState.col || !pivotCols.some(function (c) { return c.key === sortState.col; })) { sortState = { col: '_kom', dir: -1 }; }
    renderPivot();
  }
  function renderPivot() {
    var c = sortState.col, d = sortState.dir;
    pivotRows.sort(function (a, b) {
      var x = a[c] || 0, y = b[c] || 0;
      if (typeof x === 'string') return x.localeCompare(y) * d;
      return (x - y) * d;
    });
    $('pivot').tHead.innerHTML = '<tr>' + pivotCols.map(function (p) {
      var sort = p.key === c ? (d > 0 ? 'ascending' : 'descending') : 'none';
      return '<th scope="col" data-key="' + esc(p.key) + '" aria-sort="' + sort + '" tabindex="0">' +
        (p.kom ? '<span class="sw" style="background:' + col(p.key) + '"></span>' : '') + esc(p.label) + '</th>';
    }).join('') + '</tr>';
    var komKeys = pivotCols.filter(function (p) { return p.kom; }).map(function (p) { return p.key; });
    $('pivot').tBodies[0].innerHTML = pivotRows.map(function (r) {
      var mx = komKeys.reduce(function (m, k) { return (r[k] || 0) > (r[m] || 0) ? k : m; }, komKeys[0]);
      return '<tr>' + pivotCols.map(function (p) {
        if (p.text) return '<td>' + esc(r[p.key]) + (p.key === 'desa' && FOCUS.indexOf(r.id) > -1 ? ' ●' : '') + '</td>';
        var v = r[p.key] || 0;
        var cls = v === 0 ? 'zero' : (p.kom && p.key === mx ? 'max' : '');
        return '<td class="' + cls + '">' + (v === 0 ? '–' : nf.format(v)) + '</td>';
      }).join('') + '</tr>';
    }).join('');
    var tot = {}; pivotRows.forEach(function (r) { pivotCols.forEach(function (p) { if (!p.text) tot[p.key] = (tot[p.key] || 0) + (r[p.key] || 0); }); });
    $('pivot').tFoot.innerHTML = '<tr><td>Total (' + pivotRows.length + ' desa)</td><td></td>' + pivotCols.slice(2).map(function (p) {
      return '<td>' + nf.format(tot[p.key] || 0) + '</td>';
    }).join('') + '</tr>';
    Array.prototype.forEach.call($('pivot').tHead.querySelectorAll('th'), function (th) {
      var act = function () { var k = th.dataset.key; sortState = { col: k, dir: sortState.col === k ? -sortState.dir : (th.cellIndex < 2 ? 1 : -1) }; renderPivot(); };
      th.addEventListener('click', act);
      th.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); act(); } });
    });
  }

  // ---------- util ----------
  function replace(id, cfg) { if (charts[id]) charts[id].destroy(); charts[id] = new Chart($(id), cfg); }
  function writeHash() {
    var h = state.desa !== ALL ? 'desa=' + state.desa : state.kec !== ALL ? 'kec=' + encodeURIComponent(state.kec) : state.kab !== ALL ? 'kab=' + encodeURIComponent(state.kab) : '';
    history.replaceState(null, '', h ? '#' + h : location.pathname + location.search);
  }
  function readHash() {
    var kv = location.hash.replace(/^#/, '').split('='); var v = decodeURIComponent(kv[1] || '');
    if (kv[0] === 'desa' && DESA[v]) { state.desa = v; state.kec = DESA[v].kec; state.kab = DESA[v].kab; }
    else if (kv[0] === 'kec') { var d = DESA_LIST.filter(function (x) { return x.kec === v; })[0]; if (d) { state.kec = v; state.kab = d.kab; } }
    else if (kv[0] === 'kab' && DESA_LIST.some(function (x) { return x.kab === v; })) state.kab = v;
  }

  function update() {
    refreshFilters();
    var rows = DATA.filter(inScope);
    drawSummary(rows); drawGaleri(rows); drawFotoLapangan(rows); drawDonut(rows); drawUnit(rows); drawTutupan(rows); drawMap(); buildPivot(rows);
    writeHash();
  }

  readHash();
  drawFocus();
  update();
})();

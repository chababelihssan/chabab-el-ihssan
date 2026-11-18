/* =====================================================================
   لوحة تحكم شباب الإحسان — النسخة المستقلة (بدون Decap CMS)
   الدخول: GitHub ثم الرقم السري ← صفحة «الرئيسية» ← كل التعديلات منها.
   الحفظ = commit واحد على GitHub (نصوص + صور) ثم يُعاد نشر الموقع تلقائياً.
   ===================================================================== */
(function () {
  'use strict';

  var REPO = 'chababELihsan/chabab-el-ihssan', BRANCH = 'main', UP_DIR = 'public/images/uploads/';
  /* الرقم السري مخزّن كبصمة SHA-256 وليس نصاً صريحاً */
  var PIN_SALT = 'cei-admin-v1:', PIN_HASH = '4d44bbc40b3da36856c74d7e49e78bd52126d7342535bf15d75528284ad12333';
  var TOKEN_KEY = 'cei-admin-token';

  /* ---------------- أدوات ---------------- */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function T3(o) { return (o && (o.ar || o.fr || o.en)) || ''; }
  function todayStr() { var d = new Date(); return d.getFullYear() + '-' + ('0' + (d.getMonth() + 1)).slice(-2) + '-' + ('0' + d.getDate()).slice(-2); }
  function ago(d) {
    var s = (Date.now() - new Date(d).getTime()) / 1000, m = Math.floor(s / 60), h = Math.floor(m / 60), dd = Math.floor(h / 24);
    return s < 60 ? 'الآن' : m < 60 ? 'منذ ' + m + ' دقيقة' : h < 24 ? 'منذ ' + h + ' ساعة' : 'منذ ' + dd + ' يوم';
  }
  function kb(n) { return n > 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB'; }
  function slugify(v) {
    return String(v || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 5); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, v); } catch (e) { return null; } }
  function sess(k, v) { try { if (v === undefined) return sessionStorage.getItem(k); if (v === null) sessionStorage.removeItem(k); else sessionStorage.setItem(k, v); } catch (e) { return null; } }

  /* SHA-256 (للتحقق من الرقم السري دون الاعتماد على crypto.subtle) */
  function sha256(s) {
    var K = [], H = [], i, j, p = 2, n = 0;
    function frac(x) { return ((x - Math.floor(x)) * 4294967296) | 0; }
    while (n < 64) { var pr = true; for (j = 2; j * j <= p; j++) if (p % j === 0) { pr = false; break; } if (pr) { if (n < 8) H[n] = frac(Math.sqrt(p)); K[n++] = frac(Math.cbrt(p)); } p++; }
    var b = new TextEncoder().encode(s), l = b.length, len = ((l + 9 + 63) >> 6) << 6, m = new Uint8Array(len);
    m.set(b); m[l] = 0x80;
    var dv = new DataView(m.buffer); dv.setUint32(len - 4, (l * 8) >>> 0); dv.setUint32(len - 8, Math.floor(l * 8 / 4294967296));
    var W = new Array(64);
    function rr(x, k) { return (x >>> k) | (x << (32 - k)); }
    for (var o = 0; o < len; o += 64) {
      for (i = 0; i < 16; i++) W[i] = dv.getUint32(o + i * 4);
      for (i = 16; i < 64; i++) W[i] = (W[i - 16] + (rr(W[i - 15], 7) ^ rr(W[i - 15], 18) ^ (W[i - 15] >>> 3)) + W[i - 7] + (rr(W[i - 2], 17) ^ rr(W[i - 2], 19) ^ (W[i - 2] >>> 10))) | 0;
      var v = H.slice();
      for (i = 0; i < 64; i++) {
        var e = v[4], a = v[0];
        var t1 = (v[7] + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25)) + ((e & v[5]) ^ (~e & v[6])) + K[i] + W[i]) | 0;
        var t2 = ((rr(a, 2) ^ rr(a, 13) ^ rr(a, 22)) + ((a & v[1]) ^ (a & v[2]) ^ (v[1] & v[2]))) | 0;
        v = [(t1 + t2) | 0, v[0], v[1], v[2], (v[3] + t1) | 0, v[4], v[5], v[6]];
      }
      for (i = 0; i < 8; i++) H[i] = (H[i] + v[i]) | 0;
    }
    return H.map(function (x) { return ('00000000' + (x >>> 0).toString(16)).slice(-8); }).join('');
  }

  /* ---------------- مسارات داخل الكائنات ---------------- */
  function getPath(d, path) { var o = d; for (var i = 0; i < path.length && o != null; i++) o = o[path[i]]; return o; }
  function setPath(d, path, v) {
    var o = d;
    for (var i = 0; i < path.length - 1; i++) {
      if (o[path[i]] == null || typeof o[path[i]] !== 'object') o[path[i]] = /^\d+$/.test(path[i + 1]) ? [] : {};
      o = o[path[i]];
    }
    o[path[path.length - 1]] = v;
  }
  function findField(fields, parts) {
    var cur = null, fs = fields;
    for (var i = 0; i < parts.length; i++) {
      if (/^\d+$/.test(parts[i])) continue;
      if (!fs) return null;
      cur = null;
      for (var j = 0; j < fs.length; j++) if (fs[j].k === parts[i]) { cur = fs[j]; break; }
      if (!cur) return null;
      fs = cur.f || null;
    }
    return cur;
  }
  function blank(fields) {
    var o = {};
    fields.forEach(function (f) {
      if (f.def !== undefined) o[f.k] = JSON.parse(JSON.stringify(f.def));
      else if (f.t === 'i18n') o[f.k] = { ar: '', fr: '', en: '' };
      else if (f.t === 'num') o[f.k] = 0;
      else if (f.t === 'bool') o[f.k] = false;
      else if (f.t === 'list') o[f.k] = [];
      else if (f.t === 'group') o[f.k] = blank(f.f);
      else if (f.t === 'select') o[f.k] = f.o[0][0];
      else if (f.t === 'hidden') o[f.k] = 'n' + uid();
      else o[f.k] = '';
    });
    return o;
  }

  /* ---------------- الحالة ---------------- */
  var S = {
    screen: 'boot', user: null, view: { t: 'home' }, cache: {}, counts: {}, commits: null, edit: null, undo: null,
    pending: {}, dark: store('cei_dark') === '1', gfilter: 'all', q: '', loginErr: '', listData: {}
  };

  /* ---------------- GitHub API ---------------- */
  function token() { return store(TOKEN_KEY); }
  function api(url, opt) {
    var tk = token();
    if (!tk) return Promise.reject(new Error('no-token'));
    opt = opt || {}; opt.cache = 'no-store';
    opt.headers = Object.assign({ Authorization: 'token ' + tk, Accept: 'application/vnd.github+json' }, opt.headers || {});
    return fetch(url, opt).then(function (r) {
      if (r.status === 401) { store(TOKEN_KEY, null); sess('cei_pin_ok', null); S.screen = 'login'; S.loginErr = 'انتهت صلاحية الدخول، سجّل الدخول من جديد.'; render(); throw new Error('انتهت صلاحية الدخول'); }
      if (!r.ok) return r.text().then(function (t) { var m = ''; try { m = JSON.parse(t).message; } catch (e) { m = t.slice(0, 120); } throw new Error('GitHub ' + r.status + (m ? ' — ' + m : '')); });
      return r.status === 204 ? null : r.json();
    });
  }
  function ghr(p, opt) { return api('https://api.github.com/repos/' + REPO + '/' + p, opt); }
  function utf8b64(b64) { var bin = atob(b64.replace(/\s/g, '')), a = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) a[i] = bin.charCodeAt(i); return new TextDecoder().decode(a); }
  function readJson(path, fresh) {
    if (!fresh && S.cache[path]) return Promise.resolve(S.cache[path]);
    return ghr('contents/' + path + '?ref=' + BRANCH).then(function (r) {
      var o = { sha: r.sha, path: path, data: JSON.parse(utf8b64(r.content)) };
      S.cache[path] = o; return o;
    });
  }
  function listDir(path) { return ghr('contents/' + path + '?ref=' + BRANCH).then(function (a) { return a.filter(function (f) { return /\.json$/.test(f.name); }); }); }
  function jsonText(d) { return JSON.stringify(d, null, 2) + '\n'; }

  /* commit واحد لعدة ملفات: [{path,text}|{path,b64}|{path,del:true}] */
  function commitFiles(files, msg) {
    var base, baseTree;
    return ghr('git/ref/heads/' + BRANCH).then(function (ref) {
      base = ref.object.sha; return ghr('git/commits/' + base);
    }).then(function (c) {
      baseTree = c.tree.sha;
      return Promise.all(files.map(function (f) {
        if (f.del) return { path: f.path, mode: '100644', type: 'blob', sha: null };
        var body = f.b64 != null ? { content: f.b64, encoding: 'base64' } : { content: f.text, encoding: 'utf-8' };
        return ghr('git/blobs', { method: 'POST', body: JSON.stringify(body) }).then(function (b) { return { path: f.path, mode: '100644', type: 'blob', sha: b.sha }; });
      }));
    }).then(function (tree) {
      return ghr('git/trees', { method: 'POST', body: JSON.stringify({ base_tree: baseTree, tree: tree }) });
    }).then(function (t) {
      return ghr('git/commits', { method: 'POST', body: JSON.stringify({ message: 'لوحة التحكم — ' + msg, tree: t.sha, parents: [base] }) });
    }).then(function (c) {
      return ghr('git/refs/heads/' + BRANCH, { method: 'PATCH', body: JSON.stringify({ sha: c.sha }) });
    }).then(function () {
      files.forEach(function (f) { delete S.cache[f.path]; });
    });
  }

  /* ---------------- الصور ---------------- */
  var MAX_SIDE = 1600;
  var IMG_EXT = /\.(jpe?g|png|webp|gif|bmp|avif|heic|heif|tiff?|jfif|svg)$/i;
  function isImage(f) { return !!f && (/^image\//.test(f.type) || IMG_EXT.test(f.name || '')); }
  /* يفكّ أي صورة (jpg, png, webp, gif, bmp, avif, heic عند دعم المتصفح…) إلى عنصر قابل للرسم */
  function decode(file) {
    if (window.createImageBitmap) {
      return createImageBitmap(file, { imageOrientation: 'from-image' }).catch(function () { return createImageBitmap(file); }).catch(function () { return viaImg(file); });
    }
    return viaImg(file);
  }
  function viaImg(file) {
    return new Promise(function (res, rej) {
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function () { URL.revokeObjectURL(u); res(im); };
      im.onerror = function () { URL.revokeObjectURL(u); rej(new Error('decode')); };
      im.src = u;
    });
  }
  function toBlob(c, type, q) { return new Promise(function (res) { try { c.toBlob(res, type, q); } catch (e) { res(null); } }); }
  /* كل صورة تُحوَّل تلقائياً إلى WebP (أو JPEG) ومصغّرة إلى 1600px → تُقبل دائماً وتظهر في الموقع */
  function shrink(file) {
    if (/svg/i.test(file.type) || /\.svg$/i.test(file.name || '')) return Promise.resolve(file);
    return decode(file).then(function (bmp) {
      var bw = bmp.width || bmp.naturalWidth, bh = bmp.height || bmp.naturalHeight;
      if (!bw || !bh) throw new Error('size');
      var s = Math.min(1, MAX_SIDE / Math.max(bw, bh)), w = Math.max(1, Math.round(bw * s)), h = Math.max(1, Math.round(bh * s));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      c.getContext('2d').drawImage(bmp, 0, 0, w, h);
      if (bmp.close) bmp.close();
      var base = (file.name || 'image').replace(/\.[^.]+$/, '');
      return toBlob(c, 'image/webp', 0.82).then(function (blob) {
        if (blob && blob.type === 'image/webp') return new File([blob], base + '.webp', { type: 'image/webp' });
        return toBlob(c, 'image/jpeg', 0.85).then(function (jb) {
          if (!jb) throw new Error('encode');
          return new File([jb], base + '.jpg', { type: 'image/jpeg' });
        });
      });
    }).catch(function () {
      /* تعذّر التحويل: نُبقي الملف الأصلي فقط إن كان بصيغة يعرضها المتصفح مباشرة */
      if (/^image\/(jpeg|png|webp|gif|avif)$/.test(file.type)) return file;
      throw new Error('تعذّر قراءة هذه الصورة — جرّب صورة JPG أو PNG');
    });
  }
  function fileToB64(file) { return new Promise(function (res, rej) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.onerror = rej; r.readAsDataURL(file); }); }
  /* تُحفظ الصورة في الذاكرة وتُرفع مع الحفظ في commit واحد */
  function addPending(file) {
    if (!isImage(file)) return Promise.reject(new Error('هذا ليس ملف صورة'));
    return shrink(file).then(function (f) {
      var m = f.name.match(/\.([a-z0-9]+)$/i), ext = m ? m[1].toLowerCase() : '';
      if (ext === 'jpeg' || ext === 'jfif') ext = 'jpg';
      if (!/^(jpg|png|webp|gif|avif|svg)$/.test(ext)) ext = 'jpg';
      var name = 'img-' + uid() + '.' + ext, url = '/images/uploads/' + name;
      return fileToB64(f).then(function (b64) { S.pending[url] = { path: UP_DIR + name, b64: b64, blob: URL.createObjectURL(f) }; return url; });
    });
  }
  function imgSrc(v) { if (!v) return ''; if (S.pending[v]) return S.pending[v].blob; return /^https?:/.test(v) ? v : location.origin + v; }
  function pickFiles(multi, cb) {
    var i = document.createElement('input'); i.type = 'file'; i.accept = 'image/*,.heic,.heif,.avif,.jfif'; i.multiple = !!multi;
    i.onchange = function () { if (i.files && i.files.length) cb(Array.prototype.slice.call(i.files)); }; i.click();
  }

  /* ---------------- تعريف المحررات (الحقول) ---------------- */
  var L3 = function (k, l, o) { o = o || {}; return { k: k, t: 'i18n', l: l, area: o.area, req: o.req, h: o.h }; };
  var ICONS_IMPACT = [['meals', 'وجبات'], ['clothes', 'ملابس'], ['moon', 'هلال / رمضان'], ['caravan', 'قوافل'], ['people', 'أشخاص'], ['heart', 'قلب'], ['water', 'ماء'], ['school', 'مدرسة'], ['ambulance', 'سيارة إسعاف'], ['home', 'مسكن'], ['basket', 'قفة'], ['donation', 'تبرع']];
  var ED = {
    announce: { icon: '📢', title: 'شريط الإعلان', sub: 'شريط يظهر أعلى كل صفحات الموقع', file: 'src/content/announcement.json', f: [
      { k: 'enabled', t: 'bool', l: 'تفعيل الشريط (يظهر أعلى كل صفحات الموقع)' },
      L3('text', 'نص الإعلان'),
      { k: 'link', t: 'text', l: 'رابط الزر', h: 'مثال: /donate  أو  /news', dir: 'ltr' },
      L3('button', 'نص الزر'),
      { k: 'color', t: 'select', l: 'اللون', o: [['red', 'أحمر'], ['green', 'أخضر'], ['gold', 'ذهبي'], ['dark', 'أسود']] },
      { k: 'end_date', t: 'date', l: 'يختفي تلقائياً بعد يوم', h: 'اتركه فارغاً ليبقى ظاهراً', nullable: false }
    ] },
    hero: { icon: '🏠', title: 'الواجهة الكبيرة', sub: 'أول صورة يراها الزائر (+ فيديو اختياري)', file: 'src/content/media.json', f: [
      { k: 'heroImage', t: 'image', l: 'الصورة الكبيرة', h: '📐 الأفضل: أفقية 1600×900 أو أكبر' },
      { k: 'heroVideo', t: 'group', l: '🎬 فيديو الصفحة الرئيسية (اختياري)', f: [
        { k: 'youtubeId', t: 'text', l: 'معرّف فيديو يوتيوب', h: 'الجزء الأخير من الرابط، مثال: dQw4w9WgXcQ — اتركه فارغاً لإخفاء الزر', dir: 'ltr' },
        { k: 'src', t: 'text', l: 'أو رابط ملف فيديو', dir: 'ltr' },
        { k: 'poster', t: 'image', l: 'صورة الغلاف' }
      ] }
    ] },
    ramadan: { icon: '🌙', title: 'وضع رمضان', sub: 'العدّ التنازلي + سلة رمضان + زكاة الفطر', file: 'src/content/ramadan.json', f: [
      { k: 'enabled', t: 'bool', l: 'تفعيل قسم رمضان', h: 'يظهر القسم تلقائياً قبل رمضان بعدد الأيام أدناه، ويختفي بعد نهايته.' },
      { k: 'start_date', t: 'date', l: 'أول يوم من رمضان', h: 'عدّله حسب الرؤية الرسمية في الجزائر.' },
      { k: 'days', t: 'num', l: 'عدد أيام رمضان', min: 29, max: 30 },
      { k: 'show_days_before', t: 'num', l: 'يظهر القسم قبل رمضان بـ (يوم)', h: 'ارفع الرقم (مثلاً 120) إن أردت معاينة القسم الآن.' },
      { k: 'basket_price', t: 'num', l: 'سعر سلة رمضان (دج)', h: '0 = إخفاء بطاقة السلة' },
      { k: 'fitr_amount', t: 'num', l: 'زكاة الفطر للفرد (دج)', h: '0 = إخفاء بطاقة الزكاة' }
    ] },
    campaign: { icon: '💰', title: 'الحملة الحالية', sub: 'المبلغ المجموع والعدّ التنازلي', file: 'src/content/campaign.json', f: [
      { k: 'enabled', t: 'bool', l: 'إظهار الحملة في الصفحة الرئيسية' },
      L3('title', 'عنوان الحملة', { req: true }),
      L3('description', 'وصف الحملة', { area: true }),
      { k: 'raised', t: 'num', l: 'المبلغ المجموع (دج)', min: 0 },
      { k: 'goal', t: 'num', l: 'الهدف (دج)', min: 0 },
      { k: 'endDate', t: 'datetime', l: 'تاريخ ووقت نهاية الحملة', h: 'العدّ التنازلي يتوقف عند هذا الموعد.' }
    ] },
    impact: { icon: '📊', title: 'أرقام «أثرنا في المجتمع»', sub: 'وجبات، قوافل، مستفيدون…', file: 'src/content/impact.json', f: [
      L3('title', 'عنوان القسم'),
      L3('description', 'جملة تحت العنوان'),
      { k: 'stats', t: 'list', l: 'الأرقام', add: 'رقم جديد', lab: function (it) { return (it.number || '') + ' — ' + T3(it.label); }, f: [
        { k: 'number', t: 'text', l: 'الرقم', h: 'مثال: 13,000+ أو 318', dir: 'ltr' },
        { k: 'icon', t: 'select', l: 'الأيقونة', o: ICONS_IMPACT, def: 'heart' },
        L3('label', 'الوصف تحت الرقم')
      ] }
    ] },
    programs: { icon: '🏗️', title: 'برامجنا', sub: 'بطاقات الفئات والمشاريع بصورها', file: 'src/content/projects.json', f: [
      { k: 'categories', t: 'list', l: 'فئات المشاريع', add: 'فئة جديدة', lab: function (it) { return T3(it.title); }, f: [
        { k: 'id', t: 'hidden' },
        { k: 'image', t: 'image', l: 'صورة الفئة' },
        L3('title', 'عنوان الفئة', { req: true }),
        L3('description', 'وصف قصير', { area: true }),
        { k: 'items', t: 'list', l: 'المشاريع داخل الفئة', add: 'مشروع جديد', lab: function (it) { return T3(it.title); }, f: [
          { k: 'id', t: 'hidden' },
          { k: 'image', t: 'image', l: 'صورة المشروع' },
          L3('title', 'اسم المشروع', { req: true })
        ] }
      ] }
    ] },
    ba: { icon: '↔️', title: 'قبل / بعد', sub: 'شريط التمرير بين صورتين', file: 'src/content/media.json', f: [
      { k: 'beforeAfter', t: 'list', l: 'مقارنات قبل / بعد', add: 'مقارنة جديدة', lab: function (it) { return T3(it.title); }, f: [
        { k: 'before', t: 'image', l: 'صورة «قبل»', h: 'اتركها فارغة لعرض لون رمادي تلقائياً' },
        { k: 'after', t: 'image', l: 'صورة «بعد»' },
        L3('title', 'العنوان', { req: true }),
        L3('caption', 'التعليق', { area: true })
      ] }
    ] },
    map: { icon: '🗺️', title: 'خريطة الإنجازات', sub: 'الولايات والأعمال المنجزة فيها', file: 'src/content/media.json', f: [
      { k: 'achievementPlaces', t: 'list', l: 'الولايات', add: 'ولاية جديدة', lab: function (it) { return T3(it.name); }, f: [
        L3('name', 'اسم الولاية', { req: true }),
        { k: 'lat', t: 'num', l: 'خط العرض (Latitude)', step: 0.0001, min: -90, max: 90 },
        { k: 'lng', t: 'num', l: 'خط الطول (Longitude)', step: 0.0001, min: -180, max: 180 },
        { k: 'label_side', t: 'select', l: 'جهة ظهور الاسم على الخريطة', o: [['right', 'يمين'], ['left', 'يسار'], ['top', 'فوق'], ['bottom', 'تحت']] },
        { k: 'actions', t: 'list', l: 'الأعمال المنجزة هناك', add: 'عمل جديد', lab: function (it) { return T3(it); }, f: [
          { k: 'ar', t: 'text', l: 'العربية' }, { k: 'fr', t: 'text', l: 'Français' }, { k: 'en', t: 'text', l: 'English' }
        ] }
      ] }
    ] },
    sadaqa: { icon: '🤲', title: 'الصدقة الجارية', sub: 'مشاريع صفحة «صدقة جارية»', file: 'src/content/media.json', f: [
      { k: 'sadaqaProjects', t: 'list', l: 'المشاريع', add: 'مشروع جديد', lab: function (it) { return T3(it.title); }, f: [
        { k: 'icon', t: 'select', l: 'الأيقونة', o: [['well', 'بئر / ماء'], ['school', 'مدرسة'], ['ambulance', 'سيارة إسعاف'], ['tank', 'خزان']], def: 'well' },
        L3('title', 'العنوان', { req: true }),
        L3('description', 'الوصف', { area: true })
      ] }
    ] },
    contact: { icon: '🏷️', title: 'الشعار والاتصال', sub: 'الشعار، الهاتف، البريد، العنوان', file: 'src/content/settings.json', f: [
      { k: 'logo_url', t: 'image', l: 'الشعار (الشريط العلوي)' },
      { k: 'email', t: 'text', l: 'البريد الإلكتروني', dir: 'ltr' },
      { k: 'phone_display', t: 'text', l: 'الهاتف (كما يظهر)', dir: 'ltr', h: 'مثال: 0557343528 / 0774068287' },
      L3('address', 'العنوان')
    ] },
    social: { icon: '📱', title: 'التواصل ومنشورات السوشيال', sub: 'روابط الحسابات + منشورات فيسبوك وإنستغرام', file: 'src/content/settings.json', f: [
      { k: 'social', t: 'group', l: 'روابط الحسابات', f: [
        { k: 'facebook', t: 'text', l: 'فيسبوك', dir: 'ltr' }, { k: 'instagram', t: 'text', l: 'إنستغرام', dir: 'ltr' },
        { k: 'x', t: 'text', l: 'X (تويتر)', dir: 'ltr' }, { k: 'youtube', t: 'text', l: 'يوتيوب', dir: 'ltr' }, { k: 'tiktok', t: 'text', l: 'تيك توك', dir: 'ltr' }
      ] },
      { k: 'social_feed', t: 'group', l: 'قسم «آخر المنشورات»', f: [
        { k: 'enabled', t: 'bool', l: 'إظهار القسم في الصفحة الرئيسية' },
        { k: 'facebook_page_url', t: 'text', l: 'رابط صفحة فيسبوك', dir: 'ltr', h: 'يجب أن تكون الصفحة عامة وغير مقيّدة بالعمر/البلد' },
        { k: 'instagram_feed_url', t: 'text', l: 'رابط خلاصة إنستغرام (behold.so)', dir: 'ltr', h: 'يبدأ بـ https://feeds.behold.so/ — اتركه فارغاً لاستعمال المنشورات اليدوية' },
        { k: 'instagram_manual_posts', t: 'list', l: 'منشورات إنستغرام اليدوية (حتى 6)', add: 'منشور جديد', max: 6, lab: function (it) { return it.caption || it.link || ''; }, f: [
          { k: 'image', t: 'image', l: 'الصورة (مربعة 800×800)' },
          { k: 'link', t: 'text', l: 'رابط المنشور', dir: 'ltr' },
          { k: 'caption', t: 'text', l: 'تعليق قصير' }
        ] }
      ] }
    ] },
    payment: { icon: '💳', title: 'معلومات التبرع (الحساب)', sub: 'الحساب البنكي / البريدي الظاهر في صفحة التبرع', file: 'src/content/settings.json', f: [
      { k: 'payment', t: 'group', l: 'بيانات الحساب', f: [
        { k: 'account_name', t: 'text', l: 'اسم صاحب الحساب' },
        { k: 'cpa_account', t: 'text', l: 'رقم حساب CPA', dir: 'ltr' },
        { k: 'ccp_number', t: 'text', l: 'رقم CCP', dir: 'ltr' },
        { k: 'ccp_key', t: 'text', l: 'مفتاح CCP', dir: 'ltr' },
        { k: 'rip', t: 'text', l: 'RIP', dir: 'ltr' }
      ] }
    ] },
    branches: { icon: '📍', title: 'الفروع والخريطة', sub: 'المقرات، العناوين، الهاتف', file: 'src/content/branches.json', f: [
      { k: 'branches', t: 'list', l: 'الفروع / المقرات', add: 'فرع جديد', lab: function (it) { return (it.city || '') + ' — ' + (it.name || ''); }, f: [
        { k: 'city', t: 'text', l: 'المدينة' }, { k: 'name', t: 'text', l: 'اسم الفرع' }, { k: 'address', t: 'text', l: 'العنوان' },
        { k: 'phone', t: 'text', l: 'الهاتف', dir: 'ltr' }, { k: 'email', t: 'text', l: 'البريد', dir: 'ltr' },
        { k: 'lat', t: 'num', l: 'خط العرض (Latitude)', step: 0.0001 }, { k: 'lng', t: 'num', l: 'خط الطول (Longitude)', step: 0.0001 },
        { k: 'google_map_link', t: 'text', l: 'رابط Google Maps', dir: 'ltr' }
      ] }
    ] },
    gallery: { icon: '🖼️', title: 'معرض الصور', sub: 'الشريط المتحرك + صفحة «المعرض»', file: 'src/content/gallery.json', special: 'gallery', f: [
      { k: 'categories', t: 'list', l: 'فئات المعرض', add: 'فئة جديدة', lab: function (it) { return T3(it.label); }, f: [
        { k: 'id', t: 'hidden' }, L3('label', 'اسم الفئة', { req: true })
      ] }
    ] }
  };

  var COLS = {
    news: { icon: '📰', title: 'الأخبار', one: 'خبر', dir: 'src/content/news', sub: 'بطاقات صفحة «الأخبار»', f: [
      { k: 'date', t: 'date', l: 'تاريخ النشر', req: true, h: '⏰ للجدولة: اختر تاريخاً مستقبلياً — يبقى الخبر مخفياً ويظهر تلقائياً في ذلك اليوم.' },
      { k: 'image_url', t: 'image', l: 'الصورة', h: '📐 الأفضل: أفقية 1200×800' },
      { k: 'is_pinned', t: 'bool', l: '📌 تثبيت في الأعلى' },
      L3('title', 'العنوان', { req: true }),
      L3('description', 'نص الخبر', { area: true, req: true }),
      L3('location', 'المكان')
    ], file: function (d) { return (d.date || todayStr()) + '-' + (slugify(d.title && (d.title.fr || d.title.en)) || 'item-' + uid()) + '.json'; } },
    activities: { icon: '🎯', title: 'الأنشطة والمشاريع', one: 'نشاط', dir: 'src/content/activities', sub: 'صفحة «برامجنا»', f: [
      { k: 'category', t: 'select', l: 'النوع', o: [['project', 'مشروع'], ['event', 'حدث / فعالية'], ['program', 'برنامج']], def: 'project' },
      { k: 'date', t: 'date', l: 'تاريخ البداية', req: true },
      { k: 'end_date', t: 'date', l: 'تاريخ النهاية (اختياري)', nullable: true },
      { k: 'image_url', t: 'image', l: 'الصورة', h: '📐 الأفضل: أفقية 1200×800' },
      { k: 'is_pinned', t: 'bool', l: '📌 تثبيت في الأعلى' },
      L3('title', 'العنوان', { req: true }),
      L3('description', 'الوصف', { area: true, req: true }),
      L3('location', 'المكان')
    ], file: function (d) { return (d.category || 'project') + '-' + (slugify(d.title && (d.title.fr || d.title.en)) || 'item-' + uid()) + '.json'; } },
    testimonials: { icon: '💬', title: 'آراء المتابعين', one: 'رأي', dir: 'src/content/testimonials', sub: 'الصور الدائرية مع الآراء', f: [
      { k: 'name', t: 'text', l: 'الاسم', req: true },
      { k: 'is_approved', t: 'bool', l: 'إظهار الرأي في الموقع', def: true },
      { k: 'image_url', t: 'image', l: 'الصورة (دائرية، مربعة 300×300)' },
      L3('role', 'الصفة (مثال: متبرع، متطوع)'),
      L3('content', 'نص الرأي', { area: true, req: true })
    ], file: function () { return 'temoignage-' + uid() + '.json'; } }
  };

  var CEI = window.CEI = { ED: ED, COLS: COLS, sha256: sha256, PIN_HASH: PIN_HASH, PIN_SALT: PIN_SALT, blank: blank, findField: findField };
  if (typeof document === 'undefined') return;

  /* ---------------- رسم النماذج ---------------- */
  function P(p) { return esc(p.join('.')); }
  function F(fields, data, path) { return fields.map(function (f) { return fld(f, data ? data[f.k] : undefined, path.concat(f.k)); }).join(''); }
  function fld(f, v, p) {
    if (f.t === 'hidden') return '';
    var ps = P(p), h = f.h ? '<small class="hint">' + esc(f.h) + '</small>' : '', rq = f.req ? '<i class="rq">*</i>' : '';
    var lab = '<span class="lb">' + esc(f.l || '') + rq + '</span>', dir = f.dir ? ' dir="' + f.dir + '"' : '';
    switch (f.t) {
      case 'text': return '<label class="fd">' + lab + '<input data-p="' + ps + '" data-t="text" value="' + esc(v) + '"' + dir + '>' + h + '</label>';
      case 'area': return '<label class="fd">' + lab + '<textarea rows="4" data-p="' + ps + '" data-t="text">' + esc(v) + '</textarea>' + h + '</label>';
      case 'num': return '<label class="fd">' + lab + '<input type="number" data-p="' + ps + '" data-t="num" step="' + (f.step || 'any') + '"' + (f.min != null ? ' min="' + f.min + '"' : '') + (f.max != null ? ' max="' + f.max + '"' : '') + ' value="' + esc(v) + '" dir="ltr">' + h + '</label>';
      case 'bool': return '<label class="fd sw"><input type="checkbox" data-p="' + ps + '" data-t="bool"' + (v ? ' checked' : '') + '><b></b><span>' + esc(f.l) + '</span>' + h + '</label>';
      case 'select': return '<label class="fd">' + lab + '<select data-p="' + ps + '" data-t="text">' + f.o.map(function (o) { return '<option value="' + esc(o[0]) + '"' + (v === o[0] ? ' selected' : '') + '>' + esc(o[1]) + '</option>'; }).join('') + '</select>' + h + '</label>';
      case 'date': return '<label class="fd">' + lab + '<input type="date" data-p="' + ps + '" data-t="' + (f.nullable ? 'datenull' : 'date') + '" value="' + esc(String(v || '').slice(0, 10)) + '" dir="ltr">' + h + '</label>';
      case 'datetime': return '<label class="fd">' + lab + '<input type="datetime-local" data-p="' + ps + '" data-t="dt" value="' + esc(String(v || '').slice(0, 16)) + '" dir="ltr">' + h + '</label>';
      case 'image':
        var src = v ? imgSrc(v) : '';
        return '<div class="fd img can-drop" data-ip="' + ps + '">' + lab + '<div class="ib"><div class="th">' + (src ? '<img src="' + esc(src) + '" alt="" onerror="this.style.display=\'none\'">' : '<span>🖼️</span>') + '</div><div class="ia">' +
          '<div class="row"><button type="button" class="btn red" data-act="pick" data-p="' + ps + '">📷 ' + (v ? 'تغيير الصورة' : 'اختر صورة') + '</button>' + (v ? '<button type="button" class="btn ghost" data-act="clr" data-p="' + ps + '">✖ حذف</button>' : '') + '</div>' +
          '<input data-p="' + ps + '" data-t="text" dir="ltr" placeholder="أو الصق رابط صورة…" value="' + esc(v) + '"><small class="hint">يمكنك أيضاً سحب صورة وإفلاتها هنا — تُصغَّر تلقائياً.</small></div></div>' + h + '</div>';
      case 'i18n':
        var langs = [['ar', 'ع', 'العربية', 'rtl'], ['fr', 'Fr', 'Français', 'ltr'], ['en', 'En', 'English', 'ltr']];
        v = v || {};
        return '<div class="fd">' + lab + '<div class="i18n">' + langs.map(function (g) {
          var a = ps + '.' + g[0], val = esc(v[g[0]]);
          return '<div class="ln"><em>' + g[1] + '</em>' + (f.area ? '<textarea rows="3" data-p="' + a + '" data-t="text" dir="' + g[3] + '" placeholder="' + g[2] + '">' + val + '</textarea>' : '<input data-p="' + a + '" data-t="text" dir="' + g[3] + '" placeholder="' + g[2] + '" value="' + val + '">') + '</div>';
        }).join('') + '</div>' + h + '</div>';
      case 'group': return '<div class="grp"><h4>' + esc(f.l) + '</h4>' + F(f.f, v || {}, p) + '</div>';
      case 'list':
        var arr = Array.isArray(v) ? v : [], out = '<div class="lst"><div class="lh"><b>' + esc(f.l) + ' <small>(' + arr.length + ')</small></b></div>' + h;
        arr.forEach(function (it, i) {
          var ip = p.concat(i), ips = P(ip);
          out += '<details class="li"' + (arr.length <= 6 ? ' open' : '') + '><summary><span class="n">' + (i + 1) + '</span><span class="tt">' + esc(f.lab ? f.lab(it) : '') + '</span><span class="ia">' +
            (i ? '<button type="button" data-act="lup" data-p="' + ips + '" title="للأعلى">↑</button>' : '') + (i < arr.length - 1 ? '<button type="button" data-act="ldown" data-p="' + ips + '" title="للأسفل">↓</button>' : '') +
            '<button type="button" class="del" data-act="ldel" data-p="' + ips + '" title="حذف">🗑</button></span></summary><div class="lib">' + F(f.f, it, ip) + '</div></details>';
        });
        if (!f.max || arr.length < f.max) out += '<button type="button" class="btn add" data-act="ladd" data-p="' + ps + '">＋ ' + esc(f.add || 'إضافة') + '</button>';
        return out + '</div>';
    }
    return '';
  }
  function validate(fields, data, errs, pre) {
    fields.forEach(function (f) {
      var v = data ? data[f.k] : undefined;
      if (f.req && (f.t === 'i18n' ? !(v && (v.ar || v.fr || v.en)) : !v)) errs.push((pre ? pre + ' ← ' : '') + f.l);
      if (f.t === 'group' && v) validate(f.f, v, errs, pre);
      if (f.t === 'list' && Array.isArray(v)) v.forEach(function (it, i) { validate(f.f, it, errs, (f.l || '') + ' #' + (i + 1)); });
    });
  }

  /* ---------------- واجهة عامة ---------------- */
  var $app = document.getElementById('app');
  var bannerT;
  function toast(msg, bad) {
    var t = document.getElementById('toast');
    if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
    t.className = bad ? 'bad' : ''; t.textContent = msg; t.style.display = 'block';
    clearTimeout(toast._t); toast._t = setTimeout(function () { t.style.display = 'none'; }, bad ? 7000 : 4000);
  }
  function busy(on, msg) {
    var b = document.getElementById('busy');
    if (!b) { b = document.createElement('div'); b.id = 'busy'; document.body.appendChild(b); }
    b.textContent = '⏳ ' + (msg || 'جارٍ التنفيذ…') + ' لا تغلق الصفحة'; b.style.display = on ? 'block' : 'none';
  }
  function deployBanner() {
    var b = document.getElementById('deploy');
    if (!b) { b = document.createElement('div'); b.id = 'deploy'; document.body.appendChild(b); }
    clearInterval(bannerT); var left = 90;
    function paint() {
      if (left > 0) b.innerHTML = '<b>⏳ تم الحفظ — الموقع يتحدّث الآن</b><span>سيظهر التغيير خلال ' + left + ' ثانية</span><i style="width:' + (100 - left / 90 * 100) + '%"></i>';
      else { b.innerHTML = '<b>✅ التغيير أصبح مباشراً</b><a href="/?v=' + Date.now() + '" target="_blank" rel="noopener">👁 شاهد الموقع</a><button type="button">إغلاق</button>'; clearInterval(bannerT); }
      b.style.display = 'flex';
    }
    paint(); bannerT = setInterval(function () { left--; paint(); }, 1000);
    b.onclick = function (e) { if (e.target.tagName === 'BUTTON') b.style.display = 'none'; };
  }
  function fail(err) { busy(false); toast('⚠️ ' + ((err && err.message) || 'تعذّر التنفيذ'), true); }

  /* ---------------- الدخول: GitHub ثم الرقم السري ---------------- */
  function pinOk() { return sess('cei_pin_ok') === '1'; }
  function verifyToken() {
    return Promise.all([api('https://api.github.com/repos/' + REPO), api('https://api.github.com/user')]).then(function (r) {
      if (!r[0].permissions || !r[0].permissions.push) { store(TOKEN_KEY, null); throw new Error('حسابك (@' + r[1].login + ') ليس له صلاحية التعديل على المستودع. اطلب إضافتك Collaborator.'); }
      S.user = r[1];
    });
  }
  function afterAuth() { S.screen = pinOk() ? 'app' : 'pin'; pin = ''; render(); if (S.screen === 'app') enterApp(); }
  function loginGithub() {
    S.loginErr = ''; var w = window.open('/oauth/auth?provider=github', 'cei_oauth', 'width=620,height=760');
    if (!w) { S.loginErr = 'المتصفح منع النافذة المنبثقة. اسمح بها ثم أعد المحاولة.'; return render(); }
    function onMsg(e) {
      if (e.origin !== location.origin || typeof e.data !== 'string') return;
      if (e.data === 'authorizing:github') { w.postMessage('authorizing:github', e.origin); return; }
      var m = e.data.match(/^authorization:github:(success|error):(.*)$/);
      if (!m) return;
      window.removeEventListener('message', onMsg); try { w.close(); } catch (x) { /* */ }
      var d = {}; try { d = JSON.parse(m[2]); } catch (x) { /* */ }
      if (m[1] === 'success' && d.token) { store(TOKEN_KEY, d.token); busy(true, 'جارٍ التحقق من الحساب'); verifyToken().then(function () { busy(false); afterAuth(); }).catch(function (er) { busy(false); S.loginErr = er.message; S.screen = 'login'; render(); }); }
      else { S.loginErr = 'تعذّر الدخول بحساب GitHub' + (d.message ? ' (' + d.message + ')' : '') + '.'; render(); }
    }
    window.addEventListener('message', onMsg);
  }
  function loginToken() {
    var el = document.getElementById('tok'), v = el && el.value.trim(); if (!v) return;
    store(TOKEN_KEY, v); busy(true, 'جارٍ التحقق من المفتاح');
    verifyToken().then(function () { busy(false); afterAuth(); }).catch(function (er) { busy(false); store(TOKEN_KEY, null); S.loginErr = er.message; render(); });
  }
  function logout() { store(TOKEN_KEY, null); sess('cei_pin_ok', null); S.user = null; S.cache = {}; S.edit = null; S.view = { t: 'home' }; S.screen = 'login'; S.loginErr = ''; render(); }

  var pin = '';
  function lockLeft() { return Math.max(0, Math.ceil((+sess('cei_lock') - Date.now()) / 1000)) || 0; }
  function paintPin() {
    var ds = document.querySelectorAll('.dots i'); for (var i = 0; i < ds.length; i++) ds[i].classList.toggle('on', i < pin.length);
    var m = document.getElementById('pinmsg'), l = lockLeft();
    if (m && l) m.textContent = '🔒 محاولات كثيرة — انتظر ' + l + ' ثانية';
  }
  function pinKey(d) {
    if (S.screen !== 'pin' || lockLeft()) return;
    if (d === 'del') pin = pin.slice(0, -1); else if (/^\d$/.test(d) && pin.length < 4) pin += d; else return;
    paintPin();
    if (pin.length === 4) {
      var ok = sha256(PIN_SALT + pin) === PIN_HASH; pin = '';
      if (ok) { sess('cei_pin_ok', '1'); sess('cei_tries', null); S.screen = 'app'; render(); enterApp(); return; }
      var tries = (+sess('cei_tries') || 0) + 1; sess('cei_tries', String(tries));
      var box = document.querySelector('.pinbox'), m = document.getElementById('pinmsg');
      if (box) { box.classList.remove('shake'); void box.offsetWidth; box.classList.add('shake'); }
      if (tries >= 5) { sess('cei_lock', String(Date.now() + 60000)); sess('cei_tries', '0'); if (m) m.textContent = '🔒 محاولات كثيرة — انتظر 60 ثانية'; var iv = setInterval(function () { if (!lockLeft()) { clearInterval(iv); if (m) m.textContent = ''; } else paintPin(); }, 1000); }
      else if (m) m.textContent = '❌ الرقم السري غير صحيح (' + (5 - tries) + ' محاولات متبقية)';
      setTimeout(paintPin, 50);
    }
  }

  /* ---------------- الشاشات ---------------- */
  function logoUrl() { var s = S.cache['src/content/settings.json']; return s && s.data.logo_url; }
  function logoImg() { var u = logoUrl(); return u ? '<img src="' + esc(imgSrc(u)) + '" alt="" onerror="this.style.display=\'none\'">' : '<span>🤝</span>'; }
  function vLogin() {
    return '<div class="gate"><div class="gbox"><div class="lg">' + logoImg() + '</div><h1>لوحة تحكم شباب الإحسان</h1><p>سجّل الدخول بحساب GitHub المصرّح له، ثم أدخل الرقم السري.</p>' +
      (S.loginErr ? '<div class="err">⚠️ ' + esc(S.loginErr) + '</div>' : '') +
      '<button class="btn red big" type="button" data-act="login">🔐 الدخول بحساب GitHub</button>' +
      '<details class="adv"><summary>لديك مفتاح GitHub (Personal Access Token)؟</summary><input id="tok" type="password" dir="ltr" placeholder="ghp_… أو github_pat_…" autocomplete="off"><button class="btn ghost" type="button" data-act="token">دخول بالمفتاح</button><small>للحالات التي لا تعمل فيها نافذة GitHub. المفتاح يحتاج صلاحية «repo» (أو Contents: Read and write).</small></details></div></div>';
  }
  function vPin() {
    var keys = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(function (n) { return '<button type="button" data-act="key" data-k="' + n + '">' + n + '</button>'; }).join('') +
      '<button type="button" class="soft" data-act="logout" title="خروج">⎋</button><button type="button" data-act="key" data-k="0">0</button><button type="button" class="soft" data-act="key" data-k="del">⌫</button>';
    var u = S.user ? '<div class="who">' + (S.user.avatar_url ? '<img src="' + esc(S.user.avatar_url) + '" alt="">' : '') + '<span>@' + esc(S.user.login) + '</span></div>' : '';
    return '<div class="gate"><div class="gbox pinbox"><div class="lk">🔒</div><h1>الرقم السري</h1>' + u + '<p>أدخل الرقم السري المكوّن من 4 أرقام للمتابعة.</p>' +
      '<div class="dots"><i></i><i></i><i></i><i></i></div><div id="pinmsg" class="pm">' + (lockLeft() ? '🔒 محاولات كثيرة — انتظر ' + lockLeft() + ' ثانية' : '') + '</div><div class="pad">' + keys + '</div></div></div>';
  }
  function cached(f) { var c = S.cache[f]; return c && c.data; }
  function vHead() {
    var h = new Date().getHours(), u = S.user;
    return '<header class="top"><div class="brand"><div class="lg">' + logoImg() + '</div><div><h1>' + (h < 12 ? '☀️ صباح الخير' : '🌙 مساء الخير') + (u ? '، ' + esc(u.name || u.login) : '') + '</h1><p>لوحة تحكم شباب الإحسان</p></div></div><div class="acts">' +
      (S.undo ? '<button class="btn amber" type="button" data-act="undo">↩️ تراجع عن آخر تغيير</button>' : '') +
      '<button class="btn glass" type="button" data-act="dark" title="الوضع الليلي">🌓</button><button class="btn glass" type="button" data-act="live">🖥️ معاينة حيّة</button><a class="btn glass" href="/" target="_blank" rel="noopener">↗ فتح الموقع</a><button class="btn glass" type="button" data-act="logout">⎋ خروج</button></div></header>';
  }
  function blk(num, ic, t, s, open, thumb, badge) {
    return '<div class="blk" data-open="' + esc(open) + '" tabindex="0"><div class="th">' + (thumb ? '<img src="' + esc(imgSrc(thumb)) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '<span>' + ic + '</span>') + '</div><div class="tx">' +
      (num ? '<em class="num">' + num + '</em>' : '') + '<b>' + esc(t) + (badge ? ' <u class="' + badge[0] + '">' + badge[1] + '</u>' : '') + '</b><small>' + esc(s) + '</small><span class="go">تعديل ‹</span></div></div>';
  }
  function vHome() {
    var M = cached('src/content/media.json') || {}, ST = cached('src/content/settings.json') || {}, G = cached('src/content/gallery.json'), PR = cached('src/content/projects.json'), CA = cached('src/content/campaign.json'), AN = cached('src/content/announcement.json');
    var n = function (c) { return S.counts[c] != null ? S.counts[c] : '–'; };
    var stats = '<div class="stats">' + [['📰', n('news'), 'خبر', 'list|news'], ['🎯', n('activities'), 'نشاط', 'list|activities'], ['🖼️', G ? (G.images || []).length : '–', 'صورة في المعرض', 'gallery'], ['💬', n('testimonials'), 'رأي', 'list|testimonials']]
      .map(function (s) { return '<button type="button" data-open="' + s[3] + '"><span>' + s[0] + '</span><b>' + s[1] + '</b><small>' + s[2] + '</small></button>'; }).join('') + '</div>';
    var quick = '<div class="quick"><button type="button" data-open="entry|news|"><span>📰</span>خبر جديد<small>بصورة ونص</small></button><button type="button" data-open="entry|activities|"><span>🎯</span>نشاط جديد<small>مشروع / فعالية</small></button><button type="button" data-open="entry|testimonials|"><span>💬</span>رأي جديد<small>صورة دائرية</small></button><button type="button" data-open="gallery"><span>🖼️</span>صور للمعرض<small>أضف عدة صور</small></button></div>';
    var camp = '';
    if (CA) {
      var pc = CA.goal ? Math.min(100, Math.round((CA.raised || 0) * 100 / CA.goal)) : 0;
      camp = '<div class="panel camp"><div class="ch"><b>💰 ' + esc(T3(CA.title)) + '</b><span>' + pc + '%</span></div><div class="pr"><i style="width:' + pc + '%"></i></div><div class="cf"><label>المبلغ المجموع (دج)<input id="q-raised" type="number" min="0" value="' + (CA.raised || 0) + '" dir="ltr"></label><label>الهدف (دج)<input id="q-goal" type="number" min="0" value="' + (CA.goal || 0) + '" dir="ltr"></label><button class="btn red" type="button" data-act="qcamp">💾 حفظ المبلغ</button></div></div>';
    }
    var annB = AN ? (AN.enabled ? ['on', 'مفعّل'] : ['off', 'متوقف']) : null;
    var cb = CA ? (CA.enabled === false ? ['off', 'مخفية'] : ['on', 'ظاهرة']) : null;
    var rm = cached('src/content/ramadan.json'), rb = rm ? (rm.enabled ? ['on', 'مفعّل'] : ['off', 'متوقف']) : null;
    var sf = ST.social_feed, sb = sf ? (sf.enabled === false ? ['off', 'مخفي'] : ['on', 'ظاهر']) : null;
    var top = blk('', '📢', 'شريط الإعلان', 'يظهر أعلى كل صفحات الموقع', 'ed|announce', null, annB) + blk('', '🏷️', 'الشعار والاتصال', 'الشعار، الهاتف، البريد، العنوان', 'ed|contact', ST.logo_url, null);
    var order = [
      ['🏠', 'الواجهة الكبيرة', 'أول صورة يراها الزائر (+ فيديو اختياري)', 'ed|hero', M.heroImage, null],
      ['🌙', 'وضع رمضان', 'العدّ التنازلي + سلة رمضان + زكاة الفطر', 'ed|ramadan', null, rb],
      ['💰', 'الحملة الحالية', 'العنوان والوصف والمبلغ وتاريخ النهاية', 'ed|campaign', null, cb],
      ['📊', 'أرقام «أثرنا في المجتمع»', 'وجبات، قوافل، مستفيدون…', 'ed|impact', null, null],
      ['🏗️', 'برامجنا', 'بطاقات الفئات والمشاريع بصورها', 'ed|programs', PR && PR.categories && PR.categories[0] && PR.categories[0].image, null],
      ['↔️', 'قبل / بعد', 'شريط التمرير بين صورتين', 'ed|ba', M.beforeAfter && M.beforeAfter[0] && M.beforeAfter[0].after, null],
      ['🗺️', 'خريطة الإنجازات', 'الولايات والأعمال المنجزة فيها', 'ed|map', null, null],
      ['🖼️', 'شريط المعرض', 'الصور المتحركة + صفحة «المعرض»', 'gallery', G && G.images && G.images[0] && G.images[0].image_url, null],
      ['💬', 'آراء المتابعين', 'الصور الدائرية مع الآراء', 'list|testimonials', null, null],
      ['📱', 'منشورات فيسبوك وإنستغرام', 'روابط الحسابات وقسم آخر المنشورات', 'ed|social', null, sb],
      ['📍', 'الفروع', 'المقرات، العناوين، الخريطة', 'ed|branches', null, null]
    ].map(function (b, i) { return blk(i + 1, b[0], b[1], b[2], b[3], b[4], b[5]); }).join('');
    var other = blk('', '📰', 'الأخبار', 'صفحة «الأخبار» — إضافة، تعديل، جدولة', 'list|news', null, null) + blk('', '🎯', 'الأنشطة والمشاريع', 'صفحة «برامجنا»', 'list|activities', null, null) + blk('', '🤲', 'الصدقة الجارية', 'مشاريع صفحة «صدقة جارية»', 'ed|sadaqa', null, null) + blk('', '💳', 'معلومات التبرع', 'الحساب البنكي / البريدي', 'ed|payment', null, null);
    var rec = S.commits && S.commits.length ? '<h2>🕒 آخر التعديلات</h2><div class="rec">' + S.commits.map(function (c) { return '<div><span>' + esc((c.commit.message || '').split('\n')[0]) + '</span><small>' + ago(c.commit.author.date) + '</small></div>'; }).join('') + '</div>' : '';
    return stats + quick + camp + '<h2>🔝 الشريط العلوي <small>(في كل الصفحات)</small></h2><div class="map">' + top + '</div>' +
      '<h2>🗺️ خريطة الصفحة الرئيسية <small>(من الأعلى إلى الأسفل كما يراها الزائر — اضغط على أي قسم لتعديله)</small></h2><div class="map">' + order + '</div>' +
      '<h2>📄 صفحات أخرى</h2><div class="map">' + other + '</div>' + rec +
      '<div class="tipbox">💡 كل تعديل يُحفظ في <b>commit واحد</b> ويظهر في الموقع بعد حوالي دقيقة.<br>💡 الصور تُصغَّر تلقائياً — ارفعها كما هي من الهاتف.<br>💡 أخطأت؟ زر «↩️ تراجع عن آخر تغيير» يعيد آخر قسم عدّلته كما كان.</div>';
  }
  function subHead(title, extra) {
    return '<div class="sh"><button class="btn ghost" type="button" data-act="back">‹ الرئيسية</button><h2>' + title + '</h2><span class="sp"></span>' + (extra || '') + '</div>';
  }
  function itemTitle(col, d) { return col === 'testimonials' ? (d.name || '') : T3(d.title); }
  function vList() {
    var col = S.view.col, def = COLS[col], items = S.listData[col];
    var head = subHead(def.icon + ' ' + def.title, '<button class="btn red" type="button" data-open="entry|' + col + '|">＋ إضافة ' + def.one + ' جديد</button>');
    if (!items) return head + '<div class="empty">⏳ جارٍ التحميل…</div>';
    if (!items.length) return head + '<div class="empty">لا يوجد شيء بعد. اضغط «＋ إضافة ' + def.one + ' جديد».</div>';
    return head + '<input id="q" class="q" placeholder="🔍 ابحث…">' + (col === 'news' ? '<div class="note">⏰ <b>جدولة خبر:</b> اختر <b>تاريخاً مستقبلياً</b> عند إضافته — يبقى مخفياً ويظهر تلقائياً في ذلك اليوم.</div>' : '') +
      '<div class="cards">' + items.map(function (it) {
        var d = it.data, bd = '';
        if (col === 'testimonials' && d.is_approved === false) bd = '<em>مخفي</em>';
        else if (col === 'news' && d.date && String(d.date).slice(0, 10) > todayStr()) bd = '<em class="sch">⏰ مجدول ' + esc(String(d.date).slice(0, 10)) + '</em>';
        else if (d.is_pinned) bd = '<em>📌 مثبّت</em>';
        return '<div class="lcard' + (col === 'testimonials' ? ' round' : '') + '" data-open="entry|' + col + '|' + esc(it.path) + '" tabindex="0"><div class="cimg">' + (d.image_url ? '<img src="' + esc(imgSrc(d.image_url)) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '<span>📷</span>') + '</div><div class="cb"><b>' + esc(itemTitle(col, d)) + '</b>' + bd + '<small>' + esc(d.date || T3(d.role) || '') + '</small><span class="go">✏️ تعديل</span></div></div>';
      }).join('') + '</div>';
  }
  function vForm() {
    var e = S.edit, v = S.view;
    if (!e) return subHead('…') + '<div class="empty">⏳ جارٍ التحميل…</div>';
    var title = e.kind === 'entry' ? (e.def.icon + ' ' + (e.isNew ? e.def.one + ' جديد' : 'تعديل ' + e.def.one)) : e.def.icon + ' ' + e.def.title;
    var del = e.kind === 'entry' && !e.isNew ? '<button class="btn danger" type="button" data-act="del">🗑 حذف</button>' : '';
    return subHead(title, del) + (e.def.sub ? '<p class="sub">' + esc(e.def.sub) + '</p>' : '') +
      '<div class="note">💡 يكفي كتابة <b>العربية</b>؛ إن تُرك حقل لغة فارغاً يُعرض نص لغة أخرى تلقائياً.</div><div class="form">' + F(e.def.f, e.data, []) + '</div>';
  }
  function vGallery() {
    var e = S.edit; if (!e) return subHead('🖼️ معرض الصور') + '<div class="empty">⏳ جارٍ التحميل…</div>';
    var d = e.data, cats = d.categories || [], im = d.images || [], flt = S.gfilter;
    var cname = function (id) { for (var i = 0; i < cats.length; i++) if (cats[i].id === id) return T3(cats[i].label); return ''; };
    var cnt = function (id) { return im.filter(function (x) { return (x.category || '') === id; }).length; };
    var chips = '<button type="button" class="chip' + (flt === 'all' ? ' on' : '') + '" data-act="gfilter" data-k="all">الكل (' + im.length + ')</button>' + cats.map(function (c) { return '<button type="button" class="chip' + (flt === c.id ? ' on' : '') + '" data-act="gfilter" data-k="' + esc(c.id) + '">' + esc(T3(c.label)) + ' (' + cnt(c.id) + ')</button>'; }).join('') + (cnt('') ? '<button type="button" class="chip' + (flt === '' ? ' on' : '') + '" data-act="gfilter" data-k="">بدون فئة (' + cnt('') + ')</button>' : '');
    var opts = function (sel) { return '<option value=""' + (!sel ? ' selected' : '') + '>— بدون فئة —</option>' + cats.map(function (c) { return '<option value="' + esc(c.id) + '"' + (sel === c.id ? ' selected' : '') + '>' + esc(T3(c.label)) + '</option>'; }).join(''); };
    var add = '<div class="gadd can-drop" data-gdrop="1"><div><b>⬇️ أضف صوراً جديدة</b><small>اختر عدة صور دفعة واحدة أو أفلتها هنا — تُضاف في بداية المعرض</small></div><label>الفئة<select id="gnew">' + opts(S.gnew || (cats[0] && cats[0].id) || '') + '</select></label><button class="btn red" type="button" data-act="gadd">📷 اختر صوراً</button></div>';
    var tiles = im.map(function (g, i) {
      if (flt !== 'all' && (g.category || '') !== flt) return '';
      var base = 'images.' + i;
      return '<div class="g" draggable="' + (flt === 'all') + '" data-gi="' + i + '"><div class="gimg"><img src="' + esc(imgSrc(g.image_url)) + '" alt="" loading="lazy" draggable="false"><span class="gn">' + (i + 1) + '</span><div class="gt"><button type="button" data-act="gfeat" data-i="' + i + '" class="' + (g.is_featured ? 'on' : '') + '" title="صورة مميزة">★</button>' + (i ? '<button type="button" data-act="gfirst" data-i="' + i + '" title="نقل للأول">⏫</button>' : '') + '<button type="button" data-act="gdel" data-i="' + i + '" title="حذف">🗑</button></div></div>' +
        '<select data-p="' + base + '.category" data-t="text">' + opts(g.category || '') + '</select><input data-p="' + base + '.caption.ar" data-t="text" value="' + esc(g.caption && g.caption.ar) + '" placeholder="✏️ تعليق بالعربية…">' +
        '<details class="gx"><summary>🌐 لغات أخرى</summary><input data-p="' + base + '.caption.fr" data-t="text" dir="ltr" value="' + esc(g.caption && g.caption.fr) + '" placeholder="Français"><input data-p="' + base + '.caption.en" data-t="text" dir="ltr" value="' + esc(g.caption && g.caption.en) + '" placeholder="English"></details></div>';
    }).join('');
    return subHead('🖼️ معرض الصور') + '<p class="sub">' + ED.gallery.sub + (flt === 'all' ? ' — <b>اسحب صورة وأفلتها فوق أخرى</b> لتغيير الترتيب (الأولى تظهر أولاً).' : ' — الترتيب متاح عند عرض «الكل».') + '</p>' + add + '<div class="chips">' + chips + '</div><div class="ggrid">' + (tiles || '<div class="empty">لا صور في هذه الفئة.</div>') + '</div>' +
      '<details class="gcats"><summary>🏷️ إدارة فئات المعرض (إضافة / إعادة تسمية / حذف)</summary><div class="form">' + F(ED.gallery.f, d, []) + '</div></details>';
  }
  function vSave() {
    var e = S.edit; if (!e) return '';
    return '<div class="savebar"><span id="sbmsg" class="' + (e.dirty ? 'dirty' : '') + '">' + (e.dirty ? '● لديك تعديلات غير محفوظة' : 'لا تعديلات بعد') + '</span><button class="btn ghost" type="button" data-act="back">إلغاء</button><button class="btn red big" type="button" data-act="save">💾 حفظ ونشر</button></div>';
  }
  function vShell() {
    var v = S.view, body = v.t === 'home' ? vHome() : v.t === 'list' ? vList() : v.t === 'gallery' ? vGallery() : vForm();
    return vHead() + '<main>' + body + '</main>' + (v.t === 'form' || v.t === 'gallery' ? vSave() : '');
  }
  function render() {
    var y = window.scrollY; document.body.classList.toggle('dark', S.dark);
    $app.innerHTML = S.screen === 'login' ? vLogin() : S.screen === 'pin' ? vPin() : S.screen === 'app' ? vShell() : '<div class="boot"><i></i><b>شباب الإحسان</b><small>جارٍ التحميل…</small></div>';
    window.scrollTo(0, y); if (S.screen === 'pin') paintPin();
  }
  function soft() { if (S.screen === 'app' && S.view.t === 'home' && !/INPUT|TEXTAREA|SELECT/.test((document.activeElement || {}).tagName || '')) render(); }

  /* ---------------- التنقّل والتحميل ---------------- */
  var nav = 0;
  function clone(o) { return JSON.parse(JSON.stringify(o)); }
  function go(fn) {
    if (S.edit && S.edit.dirty && !confirm('لديك تعديلات غير محفوظة. هل تريد تجاهلها؟')) return;
    S.edit = null; S.q = ''; nav++; fn();
  }
  function goHome() { S.view = { t: 'home' }; render(); loadHome(); window.scrollTo(0, 0); }
  function loadHome() {
    ['media', 'settings', 'gallery', 'projects', 'campaign', 'announcement', 'ramadan'].forEach(function (n) { readJson('src/content/' + n + '.json', true).then(soft).catch(function () {}); });
    Object.keys(COLS).forEach(function (c) { listDir(COLS[c].dir).then(function (a) { S.counts[c] = a.length; soft(); }).catch(function () {}); });
    ghr('commits?per_page=6&sha=' + BRANCH).then(function (c) { S.commits = c; soft(); }).catch(function () {});
  }
  function openList(col) {
    var id = ++nav; S.view = { t: 'list', col: col }; S.listData[col] = null; render(); window.scrollTo(0, 0);
    listDir(COLS[col].dir).then(function (files) { return Promise.all(files.map(function (f) { return readJson(f.path, true); })); }).then(function (items) {
      items.sort(function (a, b) { return String(b.data.date || '').localeCompare(String(a.data.date || '')) || String(a.data.name || '').localeCompare(String(b.data.name || '')); });
      S.counts[col] = items.length; S.listData[col] = items; if (id === nav) render();
    }).catch(fail);
  }
  function openEd(id) {
    var def = ED[id], nv = ++nav; S.view = { t: def.special === 'gallery' ? 'gallery' : 'form', id: id }; S.edit = null; render(); window.scrollTo(0, 0);
    readJson(def.file, true).then(function (r) {
      if (nv !== nav) return;
      S.edit = { kind: 'file', id: id, def: def, path: def.file, data: clone(r.data), orig: JSON.stringify(r.data), dirty: false };
      if (id === 'gallery') { S.gfilter = 'all'; S.gnew = null; S.edit.data.images = S.edit.data.images || []; S.edit.data.categories = S.edit.data.categories || []; }
      render();
    }).catch(function (e) { fail(e); goHome(); });
  }
  function openEntry(col, path) {
    var def = COLS[col], nv = ++nav; S.view = { t: 'form', col: col }; S.edit = null; render(); window.scrollTo(0, 0);
    if (!path) {
      var d = blank(def.f); if (d.date === '') d.date = todayStr();
      S.edit = { kind: 'entry', col: col, def: def, path: null, isNew: true, data: d, orig: null, dirty: false }; return render();
    }
    readJson(path, true).then(function (r) {
      if (nv !== nav) return;
      S.edit = { kind: 'entry', col: col, def: def, path: path, isNew: false, data: clone(r.data), orig: JSON.stringify(r.data), dirty: false }; render();
    }).catch(function (e) { fail(e); openList(col); });
  }
  function openAny(s) {
    var a = s.split('|');
    go(function () {
      if (a[0] === 'ed') openEd(a[1]); else if (a[0] === 'gallery') openEd('gallery');
      else if (a[0] === 'list') openList(a[1]); else if (a[0] === 'entry') openEntry(a[1], a[2] || null); else goHome();
    });
  }
  function enterApp() { S.view = { t: 'home' }; render(); loadHome(); }

  /* ---------------- الحفظ ---------------- */
  function markDirty() {
    if (!S.edit) return; S.edit.dirty = true;
    var m = document.getElementById('sbmsg'); if (m) { m.className = 'dirty'; m.textContent = '● لديك تعديلات غير محفوظة'; }
  }
  function normalize(fields, d) {
    fields.forEach(function (f) {
      if (!d) return;
      if (f.t === 'date' && f.nullable && d[f.k] === '') d[f.k] = null;
      if (f.t === 'group') normalize(f.f, d[f.k]);
      if (f.t === 'list' && Array.isArray(d[f.k])) d[f.k].forEach(function (it) { normalize(f.f, it); });
    });
  }
  function pendingFor(text) {
    var out = [];
    Object.keys(S.pending).forEach(function (u) { if (text.indexOf(u) > -1) out.push({ url: u, path: S.pending[u].path, b64: S.pending[u].b64 }); });
    return out;
  }
  function save() {
    var e = S.edit; if (!e) return;
    var errs = []; validate(e.def.f, e.data, errs);
    if (errs.length) return toast('⚠️ أكمل الحقول المطلوبة: ' + errs.slice(0, 3).join('، '), true);
    normalize(e.def.f, e.data);
    busy(true, 'جارٍ الحفظ والنشر');
    var pathP = e.kind === 'entry' && e.isNew
      ? ghr('contents/' + e.def.dir + '/' + e.def.file(e.data) + '?ref=' + BRANCH).then(function () { return e.def.dir + '/' + e.def.file(e.data).replace(/\.json$/, '-' + uid() + '.json'); }, function () { return e.def.dir + '/' + e.def.file(e.data); })
      : Promise.resolve(e.path);
    var path, text, msg = (e.isNew ? 'إضافة: ' : 'تعديل: ') + (e.kind === 'entry' ? e.def.one + ' — ' + itemTitle(e.col, e.data) : e.def.title);
    pathP.then(function (p) {
      path = p;
      return e.isNew ? null : readJson(path, true).catch(function () { return null; });
    }).then(function (cur) {
      if (cur && e.orig && JSON.stringify(cur.data) !== e.orig && !confirm('هذا القسم تغيّر من مكان آخر منذ فتحته. هل تريد استبدال النسخة الموجودة بتعديلاتك؟')) throw new Error('تم إلغاء الحفظ');
      text = jsonText(e.data);
      var pend = pendingFor(text);
      return commitFiles([{ path: path, text: text }].concat(pend.map(function (p) { return { path: p.path, b64: p.b64 }; })), msg).then(function () { pend.forEach(function (p) { delete S.pending[p.url]; }); });
    }).then(function () {
      busy(false); S.undo = e.orig ? { file: path, before: e.orig, msg: msg } : null; e.dirty = false; deployBanner(); toast('✅ تم الحفظ');
      S.edit = null; nav++;
      if (e.kind === 'entry') openList(e.col); else goHome();
    }).catch(fail);
  }
  function delEntry() {
    var e = S.edit; if (!e || e.isNew) return;
    if (!confirm('حذف هذا ' + e.def.one + ' نهائياً من الموقع؟')) return;
    busy(true, 'جارٍ الحذف');
    commitFiles([{ path: e.path, del: true }], 'حذف: ' + e.def.one + ' — ' + itemTitle(e.col, e.data)).then(function () {
      busy(false); S.undo = null; e.dirty = false; S.edit = null; deployBanner(); toast('🗑 تم الحذف'); openList(e.col);
    }).catch(fail);
  }
  function undo() {
    var u = S.undo; if (!u || !confirm('التراجع عن: «' + u.msg + '» ؟')) return;
    busy(true, 'جارٍ التراجع');
    commitFiles([{ path: u.file, text: jsonText(JSON.parse(u.before)) }], 'تراجع: ' + u.msg).then(function () { busy(false); S.undo = null; deployBanner(); toast('↩️ تم التراجع'); goHome(); }).catch(fail);
  }
  function quickCamp() {
    var r = +document.getElementById('q-raised').value || 0, g = +document.getElementById('q-goal').value || 0;
    busy(true, 'جارٍ حفظ المبلغ');
    readJson('src/content/campaign.json', true).then(function (cur) {
      var before = JSON.stringify(cur.data), d = clone(cur.data); d.raised = r; d.goal = g;
      return commitFiles([{ path: cur.path, text: jsonText(d) }], 'تحديث مبلغ الحملة').then(function () { S.undo = { file: cur.path, before: before, msg: 'تحديث مبلغ الحملة' }; });
    }).then(function () { busy(false); deployBanner(); toast('✅ تم تحديث مبلغ الحملة'); loadHome(); render(); }).catch(fail);
  }

  /* ---------------- معاينة حيّة ---------------- */
  function openLive() {
    var o = document.getElementById('live');
    if (!o) {
      o = document.createElement('div'); o.id = 'live';
      o.innerHTML = '<div class="lb"><b>🖥️ معاينة حيّة للموقع</b><span><button data-m="d" class="on" type="button">💻 كمبيوتر</button><button data-m="m" type="button">📱 هاتف</button><button data-m="r" type="button">↻ تحديث</button><button data-m="x" type="button">✕ إغلاق</button></span></div><div class="lf"><iframe title="live"></iframe></div>';
      document.body.appendChild(o);
      o.addEventListener('click', function (e) {
        var m = e.target.dataset && e.target.dataset.m, f = o.querySelector('iframe'); if (!m) return;
        if (m === 'x') o.classList.remove('open'); if (m === 'r') f.src = '/?v=' + Date.now();
        if (m === 'd' || m === 'm') { o.classList.toggle('mob', m === 'm'); o.querySelectorAll('[data-m=d],[data-m=m]').forEach(function (b) { b.classList.toggle('on', b.dataset.m === m); }); }
      });
    }
    o.querySelector('iframe').src = '/?v=' + Date.now(); o.classList.add('open');
  }

  /* ---------------- الأحداث ---------------- */
  function setImage(pathStr, file) {
    busy(true, 'جارٍ تجهيز الصورة');
    return addPending(file).then(function (url) { setPath(S.edit.data, pathStr.split('.'), url); markDirty(); busy(false); render(); }).catch(fail);
  }
  function addGallery(files) {
    var e = S.edit, sel = document.getElementById('gnew'), cat = sel ? sel.value : '', urls = [];
    S.gnew = cat; busy(true, 'جارٍ تجهيز الصور');
    files.filter(isImage).reduce(function (p, f) { return p.then(function () { return addPending(f).then(function (u) { urls.push(u); }); }); }, Promise.resolve()).then(function () {
      urls.slice().reverse().forEach(function (u) { e.data.images.unshift({ image_url: u, caption: { ar: '', fr: '', en: '' }, category: cat, is_featured: false }); });
      markDirty(); busy(false); toast('✅ أُضيفت ' + urls.length + ' صورة — اضغط «حفظ ونشر» لتظهر في الموقع'); render();
    }).catch(fail);
  }
  function act(el) {
    var a = el.dataset.act, p = el.dataset.p, i = +el.dataset.i, e = S.edit;
    switch (a) {
      case 'login': return loginGithub();
      case 'token': return loginToken();
      case 'key': return pinKey(el.dataset.k);
      case 'logout': return logout();
      case 'dark': S.dark = !S.dark; store('cei_dark', S.dark ? '1' : '0'); return document.body.classList.toggle('dark', S.dark);
      case 'live': return openLive();
      case 'undo': return undo();
      case 'back': return go(function () { if (S.view.col && S.view.t === 'form' && S.view.t !== 'list') openList(S.view.col); else goHome(); });
      case 'save': return save();
      case 'del': return delEntry();
      case 'qcamp': return quickCamp();
      case 'pick': return pickFiles(false, function (fs) { setImage(p, fs[0]); });
      case 'clr': setPath(e.data, p.split('.'), ''); markDirty(); return render();
      case 'ladd': var f = findField(e.def.f, p.split('.')), arr = getPath(e.data, p.split('.')); if (!Array.isArray(arr)) { arr = []; setPath(e.data, p.split('.'), arr); } arr.push(blank(f.f)); markDirty(); return render();
      case 'lup': case 'ldown': case 'ldel':
        var ps = p.split('.'), idx = +ps.pop(), ar = getPath(e.data, ps);
        if (a === 'ldel') { if (!confirm('حذف هذا العنصر؟')) return; ar.splice(idx, 1); }
        else { var j = a === 'lup' ? idx - 1 : idx + 1; if (j < 0 || j >= ar.length) return; var t = ar[idx]; ar[idx] = ar[j]; ar[j] = t; }
        markDirty(); return render();
      case 'gadd': return pickFiles(true, addGallery);
      case 'gfilter': S.gfilter = el.dataset.k; return render();
      case 'gfeat': e.data.images[i].is_featured = !e.data.images[i].is_featured; markDirty(); return render();
      case 'gfirst': e.data.images.unshift(e.data.images.splice(i, 1)[0]); markDirty(); return render();
      case 'gdel': if (!confirm('حذف هذه الصورة من المعرض؟')) return; e.data.images.splice(i, 1); markDirty(); return render();
    }
  }
  function onField(ev) {
    var el = ev.target; if (!el.dataset || !el.dataset.p || !S.edit) return;
    var t = el.dataset.t, v;
    if (t === 'bool') v = el.checked; else if (t === 'num') { v = parseFloat(el.value); if (isNaN(v)) { if (el.value !== '') return; v = 0; } }
    else if (t === 'datenull') v = el.value || null; else if (t === 'dt') v = el.value ? el.value + ':00' : ''; else v = el.value;
    setPath(S.edit.data, el.dataset.p.split('.'), v); markDirty();
  }
  var dragI = null;
  function initEvents() {
    $app.addEventListener('click', function (e) {
      var a = e.target.closest('[data-act]'), o = e.target.closest('[data-open]');
      if (a) { e.preventDefault(); return act(a); }
      if (o) openAny(o.dataset.open);
    });
    $app.addEventListener('keydown', function (e) { var o = e.target.closest && e.target.closest('[data-open]'); if (o && (e.key === 'Enter' || e.key === ' ') && e.target === o) { e.preventDefault(); openAny(o.dataset.open); } });
    $app.addEventListener('input', function (e) {
      if (e.target.id === 'q') { var v = e.target.value.trim().toLowerCase(); $app.querySelectorAll('.lcard').forEach(function (c) { c.style.display = c.textContent.toLowerCase().indexOf(v) > -1 ? '' : 'none'; }); return; }
      if (e.target.id === 'tok' && e.key === 'Enter') return;
      onField(e);
    });
    $app.addEventListener('change', onField);
    document.addEventListener('keydown', function (e) {
      if (S.screen === 'pin' && !e.ctrlKey && !e.metaKey) { if (/^\d$/.test(e.key)) pinKey(e.key); else if (e.key === 'Backspace') pinKey('del'); }
      if (S.screen === 'login' && e.key === 'Enter' && e.target.id === 'tok') loginToken();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's' && S.edit && S.screen === 'app' && S.view.t !== 'home') { e.preventDefault(); save(); }
      if (e.key === 'Escape') { var l = document.getElementById('live'); if (l) l.classList.remove('open'); }
    });
    /* سحب وإفلات: صور على حقل الصورة / المعرض، وإعادة ترتيب المعرض */
    ['dragenter', 'dragover'].forEach(function (n) { $app.addEventListener(n, function (e) {
      var b = e.target.closest && e.target.closest('.can-drop'), g = e.target.closest && e.target.closest('.g');
      if (dragI != null && g) { e.preventDefault(); $app.querySelectorAll('.gover').forEach(function (x) { x.classList.remove('gover'); }); g.classList.add('gover'); }
      else if (dragI == null && b) { e.preventDefault(); b.classList.add('over'); }
    }); });
    $app.addEventListener('dragleave', function (e) { var b = e.target.closest && e.target.closest('.can-drop'); if (b) b.classList.remove('over'); });
    $app.addEventListener('dragstart', function (e) { var g = e.target.closest && e.target.closest('.g'); if (g && g.getAttribute('draggable') === 'true') { dragI = +g.dataset.gi; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', 'g'); g.classList.add('dragging'); } });
    $app.addEventListener('dragend', function () { dragI = null; $app.querySelectorAll('.dragging,.gover').forEach(function (x) { x.classList.remove('dragging', 'gover'); }); });
    $app.addEventListener('drop', function (e) {
      if (!S.edit) return;
      if (dragI != null) {
        var tg = e.target.closest && e.target.closest('.g'); e.preventDefault(); var from = dragI; dragI = null;
        if (tg && +tg.dataset.gi !== from) { var im = S.edit.data.images, x = im.splice(from, 1)[0]; im.splice(+tg.dataset.gi, 0, x); markDirty(); }
        return render();
      }
      var b = e.target.closest && e.target.closest('.can-drop'); if (!b) return; e.preventDefault(); b.classList.remove('over');
      var fs = Array.prototype.slice.call(e.dataTransfer.files || []).filter(isImage);
      if (!fs.length) return toast('⚠️ هذا ليس ملف صورة', true);
      if (b.dataset.gdrop) return addGallery(fs);
      if (b.dataset.ip) setImage(b.dataset.ip, fs[0]);
    });
    window.addEventListener('beforeunload', function (e) { if (S.edit && S.edit.dirty) { e.preventDefault(); e.returnValue = ''; } });
  }

  /* ---------------- الإقلاع ---------------- */
  function boot() {
    initEvents();
    if (!token()) { S.screen = 'login'; return render(); }
    S.screen = 'boot'; render();
    verifyToken().then(afterAuth).catch(function (er) {
      if (S.screen === 'login') return;
      S.screen = 'login'; S.loginErr = er && er.message === 'no-token' ? '' : (er && er.message) || ''; render();
    });
  }
  boot();
})();

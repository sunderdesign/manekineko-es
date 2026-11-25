import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const PORT = 4322;
const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, 'src', 'content');
const FIGURAS_DIR = path.join(CONTENT_DIR, 'figuras');
const IMAGES_DIR = path.join(ROOT, 'public', 'images', 'figuras');
const STOCK_SRC = path.join(ROOT, 'src', 'data', 'precios-stock.json');
const STOCK_PUBLIC = path.join(ROOT, 'public', 'data', 'precios-stock.json');

const LANGUAGES = [
  { code: 'es', name: 'Español' },
  { code: 'en', name: 'English' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'pt', name: 'Português' },
  { code: 'ja', name: '日本語' },
  { code: 'zh', name: '中文' },
  { code: 'ru', name: 'Русский' },
];

const ARTICLE_COLLECTIONS = ['cultura', 'leyendas', 'historia'];

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function slugify(str) {
  return String(str || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function readStock() {
  try {
    if (fs.existsSync(STOCK_SRC)) {
      return JSON.parse(fs.readFileSync(STOCK_SRC, 'utf-8'));
    }
  } catch {}
  return {};
}

function writeStock(data) {
  const json = JSON.stringify(data, null, 2) + '\n';
  ensureDir(path.dirname(STOCK_SRC));
  ensureDir(path.dirname(STOCK_PUBLIC));
  fs.writeFileSync(STOCK_SRC, json, 'utf-8');
  fs.writeFileSync(STOCK_PUBLIC, json, 'utf-8');
}

function unquote(v) {
  if (typeof v !== 'string') return '';
  const t = v.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    try { return JSON.parse(t); } catch { return t.slice(1, -1); }
  }
  return t;
}

function parseMarkdownFile(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const raw = fs.readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  const match = raw.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw.trim() };

  const fm = match[1];
  const body = match[2].trim();
  const data = { anatomy: {}, images: [], extras: [] };
  const lines = fm.split('\n');
  let section = null;

  for (const line of lines) {
    if (!line.trim()) continue;
    if (line.startsWith('  - ')) {
      if (section === 'images') data.images.push(unquote(line.slice(4)));
      continue;
    }
    if (line.startsWith('  ') && section === 'anatomy') {
      const m = line.trim().match(/^([^:]+):\s*(.*)$/);
      if (m) data.anatomy[m[1].trim()] = unquote(m[2]);
      continue;
    }
    section = null;
    const m = line.match(/^([^:]+):\s*(.*)$/);
    if (!m) continue;
    const key = m[1].trim();
    const val = m[2].trim();

    if (key === 'anatomy') { section = 'anatomy'; continue; }
    if (key === 'images') { section = 'images'; continue; }
    if (key === 'extras') {
      const arr = val.replace(/^\[|\]$/g, '').split(',').map((s) => unquote(s)).filter(Boolean);
      data.extras = arr;
      continue;
    }
    if (key === 'featuredOrder') {
      data.featuredOrder = Number(val) || 100;
      continue;
    }
    data[key] = unquote(val);
  }
  return { data, body };
}

function y(val) {
  return JSON.stringify(val ?? '');
}

function buildFiguraMarkdown(common, loc) {
  const lines = [
    '---',
    `title: ${y(loc.title)}`,
    `subtitle: ${y(loc.subtitle)}`,
    `summary: ${y(loc.summary)}`,
    `paw: ${y(common.paw)}`,
    `color: ${y(common.color)}`,
    `material: ${y(common.material)}`,
    `sizeCategory: ${y(common.sizeCategory)}`,
    `dimensions: ${y(common.dimensions)}`,
  ];
  if (common.weight) lines.push(`weight: ${y(common.weight)}`);
  lines.push(`origin: ${y(loc.origin || common.origin)}`);
  lines.push(`extras: [${(common.extras || []).map((e) => y(e)).join(', ')}]`);
  lines.push('anatomy:');
  if (loc.kobanText || common.kobanText) {
    lines.push(`  kobanText: ${y(loc.kobanText || common.kobanText)}`);
  }
  lines.push(`  bell: ${y(loc.bell || common.bell || 'Cascabel dorado')}`);
  lines.push(`  bibColor: ${y(loc.bibColor || common.bibColor || 'Rojo tradicional')}`);
  if (loc.accessory || common.accessory) {
    lines.push(`  accessory: ${y(loc.accessory || common.accessory)}`);
  }
  lines.push(`placementAdvice: ${y(loc.placementAdvice)}`);
  lines.push('images:');
  for (const img of common.images || []) {
    lines.push(`  - ${y(img)}`);
  }
  lines.push(`publishedAt: ${y(common.publishedAt)}`);
  lines.push(`featuredOrder: ${Number(common.featuredOrder) || 100}`);
  lines.push('---', '', (loc.body || '').trim(), '');
  return lines.join('\n');
}

function listProducts() {
  ensureDir(FIGURAS_DIR);
  const stock = readStock();
  const files = fs.readdirSync(FIGURAS_DIR).filter((f) => f.endsWith('.md'));
  return files
    .map((file) => {
      const slug = file.replace(/\.md$/, '');
      const parsed = parseMarkdownFile(path.join(FIGURAS_DIR, file));
      const d = parsed?.data || {};
      const st = stock[slug] || { price: 0, currency: 'EUR', inStock: true, affiliateLinks: {} };
      const langs = LANGUAGES.filter(
        (l) => l.code === 'es' || fs.existsSync(path.join(FIGURAS_DIR, l.code, file))
      ).map((l) => l.code);
      return {
        slug,
        title: d.title || slug,
        paw: d.paw || 'left',
        color: d.color || 'white',
        material: d.material || 'ceramica',
        featuredOrder: Number(d.featuredOrder) || 100,
        image: (d.images && d.images[0]) || '/MN_02_white_1a.svg',
        price: st.price ?? 0,
        inStock: st.inStock ?? true,
        affiliateDefault: st.affiliateLinks?.default || st.affiliateLinks?.es || '',
        langs,
      };
    })
    .sort((a, b) => a.featuredOrder - b.featuredOrder);
}

function getProductDetail(slug) {
  const baseFile = path.join(FIGURAS_DIR, `${slug}.md`);
  const base = parseMarkdownFile(baseFile);
  if (!base) throw new Error('Figura no encontrada.');

  const stock = readStock()[slug] || { price: 0, currency: 'EUR', inStock: true, affiliateLinks: {} };
  const translations = {};

  for (const l of LANGUAGES) {
    const f = l.code === 'es' ? baseFile : path.join(FIGURAS_DIR, l.code, `${slug}.md`);
    const p = parseMarkdownFile(f);
    if (p) {
      translations[l.code] = {
        title: p.data.title || '',
        subtitle: p.data.subtitle || '',
        summary: p.data.summary || '',
        placementAdvice: p.data.placementAdvice || '',
        body: p.body || '',
      };
    } else {
      translations[l.code] = { title: '', subtitle: '', summary: '', placementAdvice: '', body: '' };
    }
  }

  return {
    slug,
    paw: base.data.paw || 'left',
    color: base.data.color || 'white',
    material: base.data.material || 'ceramica',
    sizeCategory: base.data.sizeCategory || 'mediano',
    dimensions: base.data.dimensions || '',
    weight: base.data.weight || '',
    origin: base.data.origin || '',
    extras: base.data.extras || [],
    kobanText: base.data.anatomy?.kobanText || '',
    bell: base.data.anatomy?.bell || '',
    bibColor: base.data.anatomy?.bibColor || '',
    accessory: base.data.anatomy?.accessory || '',
    images: base.data.images || [],
    publishedAt: base.data.publishedAt || new Date().toISOString().slice(0, 10),
    featuredOrder: Number(base.data.featuredOrder) || 100,
    price: stock.price ?? 0,
    inStock: stock.inStock ?? true,
    affiliateLinks: stock.affiliateLinks || {},
    translations,
  };
}

function saveProduct(payload) {
  const slug = slugify(payload.slug);
  if (!slug) throw new Error('El slug (URL) es obligatorio.');

  ensureDir(FIGURAS_DIR);
  ensureDir(IMAGES_DIR);

  const savedImages = Array.isArray(payload.existingImages) ? [...payload.existingImages] : [];
  if (Array.isArray(payload.uploadedImages)) {
    payload.uploadedImages.forEach((img, idx) => {
      const match = String(img.dataUrl || '').match(/^data:image\/(\w+);base64,(.+)$/);
      if (!match) return;
      const ext = match[1] === 'jpeg' ? 'jpg' : match[1];
      const fileName = `${slug}-${Date.now()}-${idx + 1}.${ext}`;
      fs.writeFileSync(path.join(IMAGES_DIR, fileName), Buffer.from(match[2], 'base64'));
      savedImages.push(`/images/figuras/${fileName}`);
    });
  }

  const common = {
    paw: payload.paw || 'left',
    color: payload.color || 'white',
    material: payload.material || 'ceramica',
    sizeCategory: payload.sizeCategory || 'mediano',
    dimensions: payload.dimensions || '',
    weight: payload.weight || '',
    origin: payload.origin || 'Japón',
    extras: payload.extras || [],
    kobanText: payload.kobanText || '',
    bell: payload.bell || '',
    bibColor: payload.bibColor || '',
    accessory: payload.accessory || '',
    images: savedImages.length ? savedImages : ['/MN_02_white_1a.svg'],
    publishedAt: payload.publishedAt || new Date().toISOString().slice(0, 10),
    featuredOrder: Number(payload.featuredOrder) || 100,
  };

  const translations = payload.translations || {};
  const esData = translations.es;
  if (!esData || !esData.title) throw new Error('El título en Español es obligatorio.');

  fs.writeFileSync(path.join(FIGURAS_DIR, `${slug}.md`), buildFiguraMarkdown(common, esData), 'utf-8');

  const writtenLangs = ['es'];
  for (const l of LANGUAGES) {
    if (l.code === 'es') continue;
    const t = translations[l.code];
    const langFile = path.join(FIGURAS_DIR, l.code, `${slug}.md`);
    if (t && t.title && t.title.trim()) {
      ensureDir(path.dirname(langFile));
      fs.writeFileSync(langFile, buildFiguraMarkdown(common, t), 'utf-8');
      writtenLangs.push(l.code);
    }
  }

  const stock = readStock();
  const affiliateLinks = {};
  for (const [k, v] of Object.entries(payload.affiliateLinks || {})) {
    if (String(v || '').trim()) affiliateLinks[k] = String(v).trim();
  }
  if (!affiliateLinks.default) {
    affiliateLinks.default = affiliateLinks.es || '#pendiente-afiliado';
  }

  stock[slug] = {
    price: Number(payload.price) || 0,
    currency: 'EUR',
    inStock: Boolean(payload.inStock),
    lastChecked: new Date().toISOString().slice(0, 10),
    affiliateLinks,
  };
  writeStock(stock);

  return { slug, writtenLangs, images: common.images };
}

function deleteProduct(slug) {
  const safe = slugify(slug);
  const baseFile = path.join(FIGURAS_DIR, `${safe}.md`);
  if (fs.existsSync(baseFile)) fs.unlinkSync(baseFile);
  for (const l of LANGUAGES) {
    if (l.code === 'es') continue;
    const lf = path.join(FIGURAS_DIR, l.code, `${safe}.md`);
    if (fs.existsSync(lf)) fs.unlinkSync(lf);
  }
  const stock = readStock();
  delete stock[safe];
  writeStock(stock);
  return { deleted: safe };
}

function updateOrder(orderedSlugs) {
  orderedSlugs.forEach((slug, index) => {
    const orderVal = (index + 1) * 10;
    const files = [
      path.join(FIGURAS_DIR, `${slug}.md`),
      ...LANGUAGES.filter((l) => l.code !== 'es').map((l) => path.join(FIGURAS_DIR, l.code, `${slug}.md`)),
    ];
    for (const f of files) {
      if (!fs.existsSync(f)) continue;
      let raw = fs.readFileSync(f, 'utf-8');
      if (/^featuredOrder:\s*\d+/m.test(raw)) {
        raw = raw.replace(/^featuredOrder:\s*\d+/m, `featuredOrder: ${orderVal}`);
      } else {
        raw = raw.replace(/\n---\n/, `\nfeaturedOrder: ${orderVal}\n---\n`);
      }
      fs.writeFileSync(f, raw, 'utf-8');
    }
  });
  return { ok: true };
}

function bulkUpdateStock(rows) {
  const stock = readStock();
  const today = new Date().toISOString().slice(0, 10);
  for (const row of rows) {
    const slug = slugify(row.slug);
    if (!slug) continue;
    const prev = stock[slug] || { currency: 'EUR', affiliateLinks: {} };
    const aff = { ...(prev.affiliateLinks || {}) };
    if (row.affiliateDefault !== undefined) {
      const link = String(row.affiliateDefault || '').trim() || '#pendiente-afiliado';
      aff.default = link;
      aff.es = link;
    }
    stock[slug] = {
      ...prev,
      price: Number(row.price) || 0,
      inStock: Boolean(row.inStock),
      lastChecked: today,
      affiliateLinks: aff,
    };
  }
  writeStock(stock);
  return { ok: true, count: rows.length };
}

// --- ARTÍCULOS (cultura, leyendas, historia) ---
function listArticles(collection) {
  if (!ARTICLE_COLLECTIONS.includes(collection)) return [];
  const dir = path.join(CONTENT_DIR, collection);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const slug = f.replace(/\.md$/, '');
      const raw = fs.readFileSync(path.join(dir, f), 'utf-8');
      const m = raw.match(/^title:\s*(.+)$/m);
      return { slug, collection, title: m ? unquote(m[1]) : slug };
    });
}

function getArticle(collection, slug) {
  if (!ARTICLE_COLLECTIONS.includes(collection)) throw new Error('Colección inválida');
  const filePath = path.join(CONTENT_DIR, collection, `${slugify(slug)}.md`);
  if (!fs.existsSync(filePath)) throw new Error('Artículo no encontrado');
  return { slug: slugify(slug), collection, raw: fs.readFileSync(filePath, 'utf-8') };
}

function saveArticle(collection, slug, raw) {
  if (!ARTICLE_COLLECTIONS.includes(collection)) throw new Error('Colección inválida');
  const safe = slugify(slug);
  if (!safe) throw new Error('El slug del artículo es obligatorio');
  const dir = path.join(CONTENT_DIR, collection);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, `${safe}.md`), raw, 'utf-8');
  return { slug: safe, collection };
}

function deleteArticle(collection, slug) {
  if (!ARTICLE_COLLECTIONS.includes(collection)) throw new Error('Colección inválida');
  const filePath = path.join(CONTENT_DIR, collection, `${slugify(slug)}.md`);
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  return { deleted: slugify(slug) };
}

function runGitPublish() {
  return new Promise((resolve, reject) => {
    const cmd = 'npm run build && git add . && git commit -m "Actualiza catalogo y contenidos desde panel admin" && git push';
    exec(cmd, { cwd: ROOT }, (err, stdout, stderr) => {
      if (err) return reject(new Error(stderr || stdout || err.message));
      resolve(stdout || 'Publicado correctamente en GitHub.');
    });
  });
}

const HTML = `<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Gestor Completo | Manekineko.es</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#FAF6F0] text-[#161412] min-h-screen">
  <header class="bg-[#161412] text-white border-b-4 border-[#8E1323] sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-6">
        <div>
          <span class="text-[10px] uppercase tracking-widest text-[#E2B455] font-bold block">CMS Local</span>
          <h1 class="text-lg font-serif font-bold leading-none">Manekineko.es Admin</h1>
        </div>
        <nav class="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl text-xs font-semibold">
          <button data-nav="figuras" class="nav-tab px-3.5 py-1.5 rounded-lg bg-[#8E1323] text-white cursor-pointer">Figuras</button>
          <button data-nav="referidos" class="nav-tab px-3.5 py-1.5 rounded-lg text-stone-300 hover:text-white cursor-pointer">Precios y Referidos</button>
          <button data-nav="articulos" class="nav-tab px-3.5 py-1.5 rounded-lg text-stone-300 hover:text-white cursor-pointer">Artículos</button>
        </nav>
      </div>
      <div class="flex items-center gap-2.5">
        <a href="http://localhost:4321/tienda/" target="_blank" class="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-xs font-semibold">
          Ver Tienda ↗
        </a>
        <button id="btn-publish" class="px-4 py-2 rounded-lg bg-[#8E1323] hover:bg-[#700E1B] text-xs font-bold cursor-pointer">
          Compilar y Publicar
        </button>
      </div>
    </div>
  </header>

  <div class="max-w-7xl mx-auto px-6 pt-5">
    <div id="global-status" class="hidden p-3.5 rounded-xl text-sm font-medium mb-4"></div>
  </div>

  <!-- VISTA 1: FIGURAS (CRUD + ORDEN) -->
  <section id="view-figuras" class="max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <aside class="lg:col-span-4 bg-white border border-[#E5DEC9] rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between pb-2.5 border-b border-[#E5DEC9]">
        <h2 class="font-serif font-bold text-base">Catálogo (<span id="count-figuras">0</span>)</h2>
        <button id="btn-new-figura" class="px-2.5 py-1 rounded-lg bg-[#8E1323] text-white text-xs font-bold cursor-pointer">+ Nueva</button>
      </div>
      <input id="search-figuras" placeholder="Buscar por título, color o slug..." class="w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-xs" />
      <div id="product-list" class="space-y-2 max-h-[70vh] overflow-y-auto pr-1"></div>
    </aside>

    <form id="product-form" class="lg:col-span-8 bg-white border border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-6">
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#E5DEC9]">
        <div>
          <h2 id="form-mode-title" class="font-serif font-bold text-xl">Nueva figura</h2>
          <p class="text-xs text-stone-500">Todos los cambios se guardan en Markdown (9 idiomas) y precios-stock.json</p>
        </div>
        <div class="flex items-center gap-2">
          <button type="button" id="btn-duplicate" class="hidden px-3 py-1.5 rounded-lg border border-[#E5DEC9] text-xs font-semibold hover:bg-[#FAF6F0] cursor-pointer">Duplicar</button>
          <button type="button" id="btn-delete" class="hidden px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold hover:bg-red-100 cursor-pointer">Eliminar</button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <label class="block sm:col-span-2">
          <span class="text-[11px] font-bold uppercase text-stone-500">Slug (URL) *</span>
          <input name="slug" required placeholder="ej: gato-blanco-gotokuji-15cm" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Orden destacado</span>
          <input name="featuredOrder" type="number" value="10" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Precio (€)</span>
          <input name="price" type="number" step="0.01" placeholder="29.90" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Pata</span>
          <select name="paw" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm">
            <option value="left">Pata izquierda</option>
            <option value="right">Pata derecha</option>
            <option value="both">Ambas patas</option>
          </select>
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Color</span>
          <select name="color" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm">
            <option value="tricolor">Tricolor (Mi-ke)</option>
            <option value="white">Blanco</option>
            <option value="gold">Dorado</option>
            <option value="yellow">Amarillo</option>
            <option value="green">Verde</option>
            <option value="blue">Azul</option>
            <option value="purple">Morado</option>
            <option value="pink">Rosa</option>
            <option value="red">Rojo</option>
            <option value="black">Negro</option>
          </select>
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Material</span>
          <select name="material" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm">
            <option value="ceramica">Cerámica</option>
            <option value="porcelana">Porcelana</option>
            <option value="resina">Resina</option>
            <option value="hariko">Papel maché (Hariko)</option>
            <option value="madera">Madera</option>
            <option value="metal">Metal</option>
          </select>
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Tamaño</span>
          <select name="sizeCategory" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm">
            <option value="mini">Mini (&lt; 8 cm)</option>
            <option value="pequeno">Pequeño (8–14 cm)</option>
            <option value="mediano" selected>Mediano (15–24 cm)</option>
            <option value="grande">Grande (25+ cm)</option>
          </select>
        </label>
        <label class="flex items-center gap-2 pt-6 text-sm font-semibold">
          <input name="inStock" type="checkbox" checked class="w-4 h-4 accent-[#8E1323]" />
          <span>En stock</span>
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Dimensiones</span>
          <input name="dimensions" placeholder="15 × 11 × 10 cm" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Peso</span>
          <input name="weight" placeholder="380 g" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Origen</span>
          <input name="origin" value="Japón (Tokoname)" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
        </label>
      </div>

      <div>
        <span class="text-[11px] font-bold uppercase text-stone-500 block mb-2">Extras</span>
        <div class="flex flex-wrap gap-4 text-xs font-medium">
          <label class="flex items-center gap-1.5"><input type="checkbox" name="extras" value="estatico" /> Estático</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" name="extras" value="solar" /> Brazo solar</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" name="extras" value="koban" /> Moneda Koban</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" name="extras" value="japon" /> Hecho en Japón</label>
          <label class="flex items-center gap-1.5"><input type="checkbox" name="extras" value="hucha" /> Hucha</label>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-[#E5DEC9]">
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Texto del Koban</span>
          <input name="kobanText" placeholder="Senman Ryō (千万両)" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Cascabel</span>
          <input name="bell" value="Cascabel dorado metálico" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Babero / Collar</span>
          <input name="bibColor" value="Rojo carmesí tradicional" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-sm" />
        </label>
        <label class="block">
          <span class="text-[11px] font-bold uppercase text-stone-500">Accesorio extra</span>
          <input name="accessory" placeholder="Cojín zabuton rojo" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-sm" />
        </label>
      </div>

      <!-- Imágenes -->
      <div class="pt-3 border-t border-[#E5DEC9] space-y-2">
        <span class="text-[11px] font-bold uppercase text-stone-500 block">Fotos del producto (la primera es la portada)</span>
        <div id="existing-images" class="flex flex-wrap gap-2"></div>
        <input id="photo-input" type="file" accept="image/*" multiple class="block w-full text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#FAF6F0] file:text-[#8E1323] file:font-semibold" />
        <div id="photo-preview" class="flex flex-wrap gap-2"></div>
      </div>

      <!-- Enlaces de afiliado -->
      <details class="pt-3 border-t border-[#E5DEC9]" open>
        <summary class="text-xs font-bold uppercase text-stone-600 cursor-pointer">Enlaces de referido por idioma</summary>
        <div id="affiliate-inputs" class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3"></div>
      </details>

      <!-- 9 idiomas -->
      <div class="pt-3 border-t border-[#E5DEC9]">
        <span class="text-xs font-bold uppercase text-stone-600 block mb-2">Textos editoriales (9 idiomas)</span>
        <div id="lang-tabs" class="flex flex-wrap gap-1.5 mb-3"></div>
        <div id="lang-panels"></div>
      </div>

      <div class="pt-3 border-t border-[#E5DEC9] flex justify-end">
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-[#161412] hover:bg-[#8E1323] text-white font-bold text-sm cursor-pointer">
          Guardar cambios
        </button>
      </div>
    </form>
  </section>

  <!-- VISTA 2: TABLA RÁPIDA DE PRECIOS Y REFERIDOS -->
  <section id="view-referidos" class="hidden max-w-7xl mx-auto px-6 pb-12">
    <div class="bg-white border border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 class="font-serif font-bold text-xl">Gestión rápida de Precios, Stock y Referidos</h2>
          <p class="text-xs text-stone-500">Edita en bloque y guarda todo de una sola vez en precios-stock.json.</p>
        </div>
        <button id="btn-save-bulk" class="px-5 py-2.5 rounded-xl bg-[#8E1323] hover:bg-[#700E1B] text-white text-xs font-bold cursor-pointer">
          Guardar tabla completa
        </button>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-[#E5DEC9] text-stone-500 uppercase">
              <th class="py-2.5 pr-3">Figura</th>
              <th class="py-2.5 px-2 w-28">Precio (€)</th>
              <th class="py-2.5 px-2 w-20 text-center">Stock</th>
              <th class="py-2.5 pl-2">Enlace de referido principal (Default / ES)</th>
            </tr>
          </thead>
          <tbody id="bulk-tbody" class="divide-y divide-[#E5DEC9]/60"></tbody>
        </table>
      </div>
    </div>
  </section>

  <!-- VISTA 3: ARTÍCULOS EDITORIALES -->
  <section id="view-articulos" class="hidden max-w-7xl mx-auto px-6 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
    <aside class="lg:col-span-4 bg-white border border-[#E5DEC9] rounded-2xl p-4 shadow-sm space-y-3">
      <div class="flex items-center justify-between pb-2.5 border-b border-[#E5DEC9]">
        <select id="article-collection" class="rounded-lg border border-[#E5DEC9] px-2.5 py-1 text-xs font-bold">
          <option value="cultura">Cultura</option>
          <option value="leyendas">Leyendas</option>
          <option value="historia">Historia</option>
        </select>
        <button id="btn-new-article" class="px-2.5 py-1 rounded-lg bg-[#8E1323] text-white text-xs font-bold cursor-pointer">+ Nuevo</button>
      </div>
      <div id="article-list" class="space-y-2 max-h-[65vh] overflow-y-auto"></div>
    </aside>

    <form id="article-form" class="lg:col-span-8 bg-white border border-[#E5DEC9] rounded-2xl p-6 shadow-sm space-y-4">
      <div class="flex items-center justify-between pb-3 border-b border-[#E5DEC9]">
        <h2 class="font-serif font-bold text-xl">Editor de Artículo Markdown</h2>
        <button type="button" id="btn-delete-article" class="hidden px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs font-semibold cursor-pointer">Eliminar</button>
      </div>
      <label class="block">
        <span class="text-[11px] font-bold uppercase text-stone-500">Slug del archivo (.md) *</span>
        <input id="article-slug" required placeholder="ej: significado-gato-dorado" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-sm" />
      </label>
      <label class="block">
        <span class="text-[11px] font-bold uppercase text-stone-500">Contenido completo (Frontmatter YAML + Markdown)</span>
        <textarea id="article-raw" rows="18" class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-2 text-xs font-mono leading-relaxed"></textarea>
      </label>
      <div class="flex justify-end">
        <button type="submit" class="px-6 py-2.5 rounded-xl bg-[#161412] hover:bg-[#8E1323] text-white font-bold text-sm cursor-pointer">
          Guardar artículo
        </button>
      </div>
    </form>
  </section>

  <script>
    const LANGS = ${JSON.stringify(LANGUAGES)};
    let allProducts = [];
    let activeSlug = null;
    let activeLang = 'es';
    let existingImages = [];
    let uploadedImages = [];

    function notify(msg, isError) {
      const el = document.getElementById('global-status');
      el.textContent = msg;
      el.className = 'p-3.5 rounded-xl text-sm font-medium mb-4 ' + (isError
        ? 'bg-red-50 text-red-800 border border-red-200'
        : 'bg-emerald-50 text-emerald-800 border border-emerald-200');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Navegación entre vistas
    document.querySelectorAll('.nav-tab').forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.dataset.nav;
        document.querySelectorAll('.nav-tab').forEach((b) => {
          const on = b.dataset.nav === target;
          b.className = 'nav-tab px-3.5 py-1.5 rounded-lg cursor-pointer ' + (on ? 'bg-[#8E1323] text-white' : 'text-stone-300 hover:text-white');
        });
        ['figuras', 'referidos', 'articulos'].forEach((v) => {
          document.getElementById('view-' + v).classList.toggle('hidden', v !== target);
        });
        if (target === 'referidos') renderBulkTable();
        if (target === 'articulos') loadArticles();
      });
    });

    // Inicializar inputs de afiliados y pestañas de 9 idiomas
    function initFormWidgets() {
      const affEl = document.getElementById('affiliate-inputs');
      affEl.innerHTML = '<label class="block sm:col-span-2"><span class="text-[11px] font-bold uppercase text-stone-500">Default / Principal</span><input data-aff="default" placeholder="https://amzn.to/..." class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-xs" /></label>' +
        LANGS.map((l) => '<label class="block"><span class="text-[11px] font-bold uppercase text-stone-500">' + l.code.toUpperCase() + ' (' + l.name + ')</span><input data-aff="' + l.code + '" placeholder="https://..." class="mt-1 w-full rounded-lg border border-[#E5DEC9] px-3 py-1.5 text-xs" /></label>').join('');

      const tabsEl = document.getElementById('lang-tabs');
      const panelsEl = document.getElementById('lang-panels');
      tabsEl.innerHTML = '';
      panelsEl.innerHTML = '';
      LANGS.forEach((l) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.dataset.langTab = l.code;
        btn.textContent = l.code.toUpperCase();
        btn.onclick = () => switchLang(l.code);
        tabsEl.appendChild(btn);

        const panel = document.createElement('div');
        panel.dataset.langPanel = l.code;
        panel.className = 'space-y-2.5 bg-[#FAF6F0]/60 p-4 rounded-xl border border-[#E5DEC9]';
        panel.innerHTML =
          '<label class="block"><span class="text-[11px] font-bold uppercase text-stone-500">Título (' + l.name + ')' + (l.code === 'es' ? ' *' : '') + '</span><input data-lang="' + l.code + '" data-field="title" ' + (l.code === 'es' ? 'required' : '') + ' class="mt-1 w-full rounded-lg border border-[#E5DEC9] bg-white px-3 py-1.5 text-sm" /></label>' +
          '<label class="block"><span class="text-[11px] font-bold uppercase text-stone-500">Subtítulo</span><input data-lang="' + l.code + '" data-field="subtitle" class="mt-1 w-full rounded-lg border border-[#E5DEC9] bg-white px-3 py-1.5 text-sm" /></label>' +
          '<label class="block"><span class="text-[11px] font-bold uppercase text-stone-500">Resumen tienda</span><textarea data-lang="' + l.code + '" data-field="summary" rows="2" class="mt-1 w-full rounded-lg border border-[#E5DEC9] bg-white px-3 py-1.5 text-sm"></textarea></label>' +
          '<label class="block"><span class="text-[11px] font-bold uppercase text-stone-500">Consejo Kasō / Feng Shui</span><textarea data-lang="' + l.code + '" data-field="placementAdvice" rows="2" class="mt-1 w-full rounded-lg border border-[#E5DEC9] bg-white px-3 py-1.5 text-sm"></textarea></label>' +
          '<label class="block"><span class="text-[11px] font-bold uppercase text-stone-500">Descripción (Markdown)</span><textarea data-lang="' + l.code + '" data-field="body" rows="4" class="mt-1 w-full rounded-lg border border-[#E5DEC9] bg-white px-3 py-1.5 text-xs font-mono"></textarea></label>';
        panelsEl.appendChild(panel);
      });
      switchLang('es');
    }

    function switchLang(code) {
      activeLang = code;
      document.querySelectorAll('[data-lang-tab]').forEach((b) => {
        const on = b.dataset.langTab === code;
        b.className = 'px-2.5 py-1 rounded-lg text-xs font-bold border cursor-pointer ' + (on ? 'bg-[#8E1323] text-white border-[#8E1323]' : 'bg-[#FAF6F0] text-stone-700 border-[#E5DEC9]');
      });
      document.querySelectorAll('[data-lang-panel]').forEach((p) => {
        p.classList.toggle('hidden', p.dataset.langPanel !== code);
      });
    }

    function renderExistingImages() {
      const box = document.getElementById('existing-images');
      box.innerHTML = '';
      existingImages.forEach((src, idx) => {
        const wrap = document.createElement('div');
        wrap.className = 'relative group border border-[#E5DEC9] rounded-lg overflow-hidden bg-[#FAF6F0] p-1';
        wrap.innerHTML = '<div class="text-[10px] max-w-[110px] truncate px-1 text-stone-600">' + src.split('/').pop() + '</div>';
        const del = document.createElement('button');
        del.type = 'button';
        del.textContent = '×';
        del.className = 'absolute top-0 right-0 bg-red-600 text-white text-[10px] px-1.5 cursor-pointer';
        del.onclick = () => { existingImages.splice(idx, 1); renderExistingImages(); };
        wrap.appendChild(del);
        box.appendChild(wrap);
      });
    }

    async function loadProducts() {
      const res = await fetch('/api/products');
      allProducts = await res.json();
      document.getElementById('count-figuras').textContent = allProducts.length;
      renderProductList();
    }

    function renderProductList() {
      const q = (document.getElementById('search-figuras').value || '').toLowerCase();
      const filtered = allProducts.filter((p) =>
        p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q) || p.color.toLowerCase().includes(q)
      );
      const list = document.getElementById('product-list');
      if (!filtered.length) {
        list.innerHTML = '<p class="text-xs text-stone-400 py-4 text-center">Sin figuras.</p>';
        return;
      }
      list.innerHTML = '';
      filtered.forEach((it, idx) => {
        const card = document.createElement('div');
        card.className = 'p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ' +
          (it.slug === activeSlug ? 'border-[#8E1323] bg-[#FAF6F0]' : 'border-[#E5DEC9] bg-white hover:border-[#C6922C]');

        const info = document.createElement('button');
        info.type = 'button';
        info.className = 'text-left flex-1 min-w-0 cursor-pointer';
        info.innerHTML =
          '<div class="font-semibold text-xs text-[#161412] truncate">' + it.title + '</div>' +
          '<div class="text-[10px] text-stone-500 mt-0.5">' + (it.price > 0 ? it.price.toFixed(2) + ' €' : '—') + ' · ' + (it.inStock ? 'Stock' : 'Agotado') + ' · ' + it.langs.length + ' idiomas</div>';
        info.onclick = () => loadProductIntoForm(it.slug);

        const actions = document.createElement('div');
        actions.className = 'flex items-center gap-1 shrink-0';
        const up = document.createElement('button');
        up.type = 'button';
        up.textContent = '↑';
        up.className = 'px-1.5 py-0.5 text-xs rounded border border-[#E5DEC9] hover:bg-[#FAF6F0] cursor-pointer';
        up.onclick = () => moveProduct(idx, -1);
        const down = document.createElement('button');
        down.type = 'button';
        down.textContent = '↓';
        down.className = 'px-1.5 py-0.5 text-xs rounded border border-[#E5DEC9] hover:bg-[#FAF6F0] cursor-pointer';
        down.onclick = () => moveProduct(idx, 1);

        actions.appendChild(up);
        actions.appendChild(down);
        card.appendChild(info);
        card.appendChild(actions);
        list.appendChild(card);
      });
    }

    async function moveProduct(idx, dir) {
      const target = idx + dir;
      if (target < 0 || target >= allProducts.length) return;
      const tmp = allProducts[idx];
      allProducts[idx] = allProducts[target];
      allProducts[target] = tmp;
      await fetch('/api/products/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slugs: allProducts.map((p) => p.slug) }),
      });
      await loadProducts();
      notify('Orden del catálogo actualizado.');
    }

    async function loadProductIntoForm(slug) {
      const res = await fetch('/api/products/' + encodeURIComponent(slug));
      const p = await res.json();
      if (!res.ok) return notify(p.error, true);

      activeSlug = p.slug;
      const form = document.getElementById('product-form');
      form.slug.value = p.slug;
      form.featuredOrder.value = p.featuredOrder;
      form.price.value = p.price || '';
      form.paw.value = p.paw;
      form.color.value = p.color;
      form.material.value = p.material;
      form.sizeCategory.value = p.sizeCategory;
      form.inStock.checked = Boolean(p.inStock);
      form.dimensions.value = p.dimensions;
      form.weight.value = p.weight;
      form.origin.value = p.origin;
      form.kobanText.value = p.kobanText;
      form.bell.value = p.bell;
      form.bibColor.value = p.bibColor;
      form.accessory.value = p.accessory;

      form.querySelectorAll('input[name="extras"]').forEach((cb) => {
        cb.checked = (p.extras || []).includes(cb.value);
      });

      document.querySelectorAll('[data-aff]').forEach((el) => {
        el.value = (p.affiliateLinks && p.affiliateLinks[el.dataset.aff]) || '';
      });

      LANGS.forEach((l) => {
        const t = (p.translations && p.translations[l.code]) || {};
        document.querySelectorAll('[data-lang="' + l.code + '"]').forEach((el) => {
          el.value = t[el.dataset.field] || '';
        });
      });

      existingImages = p.images || [];
      uploadedImages = [];
      document.getElementById('photo-preview').innerHTML = '';
      renderExistingImages();

      document.getElementById('form-mode-title').textContent = 'Editando: ' + p.slug;
      document.getElementById('btn-duplicate').classList.remove('hidden');
      document.getElementById('btn-delete').classList.remove('hidden');
      renderProductList();
    }

    function resetFiguraForm() {
      activeSlug = null;
      document.getElementById('product-form').reset();
      existingImages = [];
      uploadedImages = [];
      renderExistingImages();
      document.getElementById('photo-preview').innerHTML = '';
      document.getElementById('form-mode-title').textContent = 'Nueva figura';
      document.getElementById('btn-duplicate').classList.add('hidden');
      document.getElementById('btn-delete').classList.add('hidden');
      renderProductList();
    }

    document.getElementById('btn-new-figura').onclick = resetFiguraForm;
    document.getElementById('search-figuras').oninput = renderProductList;

    document.getElementById('btn-duplicate').onclick = () => {
      const form = document.getElementById('product-form');
      form.slug.value = form.slug.value + '-copia';
      activeSlug = null;
      document.getElementById('form-mode-title').textContent = 'Duplicando figura (cambia el slug y guarda)';
      document.getElementById('btn-delete').classList.add('hidden');
      notify('Ficha duplicada en el formulario. Ajusta el slug y pulsa Guardar.');
    };

    document.getElementById('btn-delete').onclick = async () => {
      if (!activeSlug || !confirm('¿Eliminar "' + activeSlug + '" en todos los idiomas y del stock?')) return;
      const res = await fetch('/api/products/' + encodeURIComponent(activeSlug), { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) return notify(data.error, true);
      resetFiguraForm();
      await loadProducts();
      notify('Figura eliminada correctamente.');
    };

    document.getElementById('photo-input').addEventListener('change', async (e) => {
      const files = Array.from(e.target.files || []);
      const preview = document.getElementById('photo-preview');
      uploadedImages = [];
      preview.innerHTML = '';
      for (const file of files) {
        const dataUrl = await new Promise((res) => {
          const r = new FileReader();
          r.onload = () => res(r.result);
          r.readAsDataURL(file);
        });
        uploadedImages.push({ name: file.name, dataUrl });
        const img = document.createElement('img');
        img.src = dataUrl;
        img.className = 'w-16 h-12 object-cover rounded border border-[#E5DEC9]';
        preview.appendChild(img);
      }
    });

    document.getElementById('product-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const translations = {};
      LANGS.forEach((l) => {
        const obj = {};
        document.querySelectorAll('[data-lang="' + l.code + '"]').forEach((el) => {
          obj[el.dataset.field] = el.value;
        });
        translations[l.code] = obj;
      });
      const affiliateLinks = {};
      document.querySelectorAll('[data-aff]').forEach((el) => {
        if (el.value.trim()) affiliateLinks[el.dataset.aff] = el.value.trim();
      });

      const payload = {
        slug: fd.get('slug'),
        featuredOrder: fd.get('featuredOrder'),
        price: fd.get('price'),
        paw: fd.get('paw'),
        color: fd.get('color'),
        material: fd.get('material'),
        sizeCategory: fd.get('sizeCategory'),
        dimensions: fd.get('dimensions'),
        weight: fd.get('weight'),
        origin: fd.get('origin'),
        inStock: fd.get('inStock') === 'on',
        extras: fd.getAll('extras'),
        kobanText: fd.get('kobanText'),
        bell: fd.get('bell'),
        bibColor: fd.get('bibColor'),
        accessory: fd.get('accessory'),
        affiliateLinks,
        existingImages,
        uploadedImages,
        translations,
      };

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return notify('Error: ' + data.error, true);
      await loadProducts();
      await loadProductIntoForm(data.slug);
      notify('Guardado "' + data.slug + '" (' + data.writtenLangs.join(', ').toUpperCase() + ').');
    });

    // Vista 2: Tabla de Precios y Referidos
    function renderBulkTable() {
      const tbody = document.getElementById('bulk-tbody');
      tbody.innerHTML = allProducts.map((p) =>
        '<tr data-bulk-row="' + p.slug + '">' +
        '<td class="py-2 pr-3 font-semibold">' + p.title + '<div class="text-[10px] text-stone-400 font-normal">' + p.slug + '</div></td>' +
        '<td class="py-2 px-2"><input type="number" step="0.01" data-bulk="price" value="' + (p.price || '') + '" class="w-full rounded border border-[#E5DEC9] px-2 py-1" /></td>' +
        '<td class="py-2 px-2 text-center"><input type="checkbox" data-bulk="inStock" ' + (p.inStock ? 'checked' : '') + ' class="w-4 h-4 accent-[#8E1323]" /></td>' +
        '<td class="py-2 pl-2"><input type="url" data-bulk="affiliateDefault" value="' + (p.affiliateDefault || '') + '" placeholder="https://amzn.to/..." class="w-full rounded border border-[#E5DEC9] px-2 py-1" /></td>' +
        '</tr>'
      ).join('');
    }

    document.getElementById('btn-save-bulk').onclick = async () => {
      const rows = Array.from(document.querySelectorAll('[data-bulk-row]')).map((tr) => ({
        slug: tr.dataset.bulkRow,
        price: tr.querySelector('[data-bulk="price"]').value,
        inStock: tr.querySelector('[data-bulk="inStock"]').checked,
        affiliateDefault: tr.querySelector('[data-bulk="affiliateDefault"]').value,
      }));
      const res = await fetch('/api/stock/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rows }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.error, true);
      await loadProducts();
      notify('Actualizados ' + data.count + ' productos en precios-stock.json.');
    };

    // Vista 3: Artículos
    let activeArticleSlug = null;
    async function loadArticles() {
      const col = document.getElementById('article-collection').value;
      const res = await fetch('/api/articles/' + col);
      const items = await res.json();
      const list = document.getElementById('article-list');
      list.innerHTML = '';
      if (!items.length) {
        list.innerHTML = '<p class="text-xs text-stone-400 py-4 text-center">Sin artículos en ' + col + '.</p>';
        return;
      }
      items.forEach((it) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'w-full text-left p-2.5 rounded-xl border border-[#E5DEC9] hover:border-[#8E1323] text-xs font-semibold cursor-pointer block';
        btn.textContent = it.title;
        btn.onclick = () => openArticle(col, it.slug);
        list.appendChild(btn);
      });
    }

    async function openArticle(col, slug) {
      const res = await fetch('/api/articles/' + col + '/' + encodeURIComponent(slug));
      const data = await res.json();
      if (!res.ok) return notify(data.error, true);
      activeArticleSlug = data.slug;
      document.getElementById('article-slug').value = data.slug;
      document.getElementById('article-raw').value = data.raw;
      document.getElementById('btn-delete-article').classList.remove('hidden');
    }

    document.getElementById('article-collection').onchange = loadArticles;
    document.getElementById('btn-new-article').onclick = () => {
      activeArticleSlug = null;
      document.getElementById('article-slug').value = '';
      document.getElementById('article-raw').value = '---\\ntitle: "Nuevo artículo"\\ndescription: "Descripción SEO"\\npubDate: ' + new Date().toISOString().slice(0, 10) + '\\n---\\n\\nEscribe aquí tu contenido en Markdown...\\n';
      document.getElementById('btn-delete-article').classList.add('hidden');
    };

    document.getElementById('article-form').onsubmit = async (e) => {
      e.preventDefault();
      const col = document.getElementById('article-collection').value;
      const slug = document.getElementById('article-slug').value;
      const raw = document.getElementById('article-raw').value;
      const res = await fetch('/api/articles/' + col, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, raw }),
      });
      const data = await res.json();
      if (!res.ok) return notify(data.error, true);
      await loadArticles();
      notify('Artículo "' + data.slug + '" guardado en ' + col + '.');
    };

    document.getElementById('btn-delete-article').onclick = async () => {
      const col = document.getElementById('article-collection').value;
      if (!activeArticleSlug || !confirm('¿Eliminar el artículo "' + activeArticleSlug + '"?')) return;
      await fetch('/api/articles/' + col + '/' + encodeURIComponent(activeArticleSlug), { method: 'DELETE' });
      activeArticleSlug = null;
      document.getElementById('article-slug').value = '';
      document.getElementById('article-raw').value = '';
      document.getElementById('btn-delete-article').classList.add('hidden');
      await loadArticles();
      notify('Artículo eliminado.');
    };

    document.getElementById('btn-publish').onclick = async () => {
      const btn = document.getElementById('btn-publish');
      btn.disabled = true;
      btn.textContent = 'Publicando...';
      try {
        const res = await fetch('/api/publish', { method: 'POST' });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        notify('¡Compilado y publicado en GitHub / Cloudflare Pages!');
      } catch (err) {
        notify('Error al publicar: ' + err.message, true);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Compilar y Publicar';
      }
    };

    initFormWidgets();
    loadProducts();
  </script>
</body>
</html>`;

async function readJsonBody(req) {
  let body = '';
  for await (const chunk of req) body += chunk;
  return body ? JSON.parse(body) : {};
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url || '/', `http://localhost:${PORT}`);
    const p = url.pathname;

    if (req.method === 'GET' && p === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(HTML);
    }
    if (req.method === 'GET' && p === '/api/products') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(listProducts()));
    }
    if (req.method === 'POST' && p === '/api/products/order') {
      const body = await readJsonBody(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(updateOrder(body.slugs || [])));
    }
    if (req.method === 'POST' && p === '/api/products') {
      const body = await readJsonBody(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(saveProduct(body)));
    }
    if (p.startsWith('/api/products/')) {
      const slug = decodeURIComponent(p.slice('/api/products/'.length));
      if (req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(getProductDetail(slug)));
      }
      if (req.method === 'DELETE') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(deleteProduct(slug)));
      }
    }
    if (req.method === 'POST' && p === '/api/stock/bulk') {
      const body = await readJsonBody(req);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify(bulkUpdateStock(body.rows || [])));
    }
    if (p.startsWith('/api/articles/')) {
      const parts = p.slice('/api/articles/'.length).split('/').filter(Boolean);
      const col = parts[0];
      const slug = parts[1] ? decodeURIComponent(parts[1]) : null;
      if (req.method === 'GET' && !slug) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(listArticles(col)));
      }
      if (req.method === 'GET' && slug) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(getArticle(col, slug)));
      }
      if (req.method === 'POST') {
        const body = await readJsonBody(req);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(saveArticle(col, body.slug, body.raw)));
      }
      if (req.method === 'DELETE' && slug) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(deleteArticle(col, slug)));
      }
    }
    if (req.method === 'POST' && p === '/api/publish') {
      const output = await runGitPublish();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ ok: true, output }));
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    res.writeHead(400, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: err.message }));
  }
});

server.listen(PORT, () => {
  console.log(`Gestor Completo Manekineko.es activo en: http://localhost:${PORT}`);
});
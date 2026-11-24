'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const PORT = 4322;
const LANGS = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ru'];

function loadEnv() {
  if (!fs.existsSync('.env')) return;
  for (const line of fs.readFileSync('.env', 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m && !process.env[m[1]]) {
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
    }
  }
}
loadEnv();

function readJson(filePath, fallback) {
  try {
    if (fs.existsSync(filePath)) return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {}
  return fallback;
}

function writeStockDb(db) {
  const txt = JSON.stringify(db, null, 2) + '\n';
  fs.mkdirSync('src/data', { recursive: true });
  fs.mkdirSync('public/data', { recursive: true });
  fs.writeFileSync('src/data/precios-stock.json', txt, 'utf8');
  fs.writeFileSync('public/data/precios-stock.json', txt, 'utf8');
}

function unquote(v) {
  const s = (v || '').trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    try { return JSON.parse(s); } catch { return s.slice(1, -1); }
  }
  return s;
}

function parseMarkdownFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { data: {}, body: raw };
  const fm = match[1];
  const body = (match[2] || '').trim();

  const data = {
    title: '',
    subtitle: '',
    publishedAt: new Date().toISOString().slice(0, 10),
    featuredOrder: 10,
    paw: 'left',
    color: 'tricolor',
    material: 'ceramica',
    sizeCategory: 'pequeno',
    dimensions: '',
    weight: '',
    origin: '',
    extras: [],
    anatomy: { kobanText: '', bell: '', bibColor: '', accessory: '' },
    placementAdvice: '',
    images: [],
    summary: '',
  };

  let section = '';
  for (const line of fm.split(/\r?\n/)) {
    if (!line.trim()) continue;
    if (/^extras:\s*\[/.test(line)) {
      try { data.extras = JSON.parse(line.replace(/^extras:\s*/, '')); } catch {}
      section = '';
      continue;
    }
    if (/^images:\s*\[/.test(line)) {
      try { data.images = JSON.parse(line.replace(/^images:\s*/, '')); } catch {}
      section = '';
      continue;
    }
    if (/^extras:\s*$/.test(line)) { section = 'extras'; continue; }
    if (/^anatomy:\s*$/.test(line)) { section = 'anatomy'; continue; }
    if (/^images:\s*$/.test(line)) { section = 'images'; continue; }

    if (section === 'extras' && /^\s+-\s+/.test(line)) {
      data.extras.push(unquote(line.replace(/^\s+-\s+/, '')));
      continue;
    }
    if (section === 'images' && /^\s+-\s+/.test(line)) {
      data.images.push(unquote(line.replace(/^\s+-\s+/, '')));
      continue;
    }
    if (section === 'anatomy' && /^\s+[a-zA-Z0-9_]+:/.test(line)) {
      const idx = line.indexOf(':');
      const k = line.slice(0, idx).trim();
      const v = unquote(line.slice(idx + 1));
      data.anatomy[k] = v;
      continue;
    }

    section = '';
    const idx = line.indexOf(':');
    if (idx > 0) {
      const key = line.slice(0, idx).trim();
      const val = unquote(line.slice(idx + 1));
      if (key === 'featuredOrder') data.featuredOrder = parseInt(val, 10) || 10;
      else if (key in data) data[key] = val;
    }
  }
  return { data, body };
}

function buildMarkdownContent(meta, localeData) {
  const extrasYaml = (meta.extras && meta.extras.length)
    ? meta.extras.map((e) => '  - ' + JSON.stringify(e)).join('\n')
    : '  - "estatico"';
  const imgs = (meta.images && meta.images.length) ? meta.images : ['/images/timeline-5-tokoname.jpeg'];
  const imagesYaml = imgs.map((i) => '  - ' + JSON.stringify(i)).join('\n');
  const anat = localeData.anatomy || meta.anatomy || {};

  return [
    '---',
    'title: ' + JSON.stringify(localeData.title || ''),
    'subtitle: ' + JSON.stringify(localeData.subtitle || ''),
    'publishedAt: ' + JSON.stringify(meta.publishedAt || new Date().toISOString().slice(0, 10)),
    'featuredOrder: ' + (Number(meta.featuredOrder) || 10),
    'paw: ' + JSON.stringify(meta.paw || 'left'),
    'color: ' + JSON.stringify(meta.color || 'tricolor'),
    'material: ' + JSON.stringify(meta.material || 'ceramica'),
    'sizeCategory: ' + JSON.stringify(meta.sizeCategory || 'pequeno'),
    'dimensions: ' + JSON.stringify(localeData.dimensions || meta.dimensions || ''),
    'weight: ' + JSON.stringify(meta.weight || ''),
    'origin: ' + JSON.stringify(localeData.origin || meta.origin || ''),
    'extras:',
    extrasYaml,
    'anatomy:',
    '  kobanText: ' + JSON.stringify(anat.kobanText || ''),
    '  bell: ' + JSON.stringify(anat.bell || ''),
    '  bibColor: ' + JSON.stringify(anat.bibColor || ''),
    '  accessory: ' + JSON.stringify(anat.accessory || ''),
    'placementAdvice: ' + JSON.stringify(localeData.placementAdvice || ''),
    'images:',
    imagesYaml,
    'summary: ' + JSON.stringify(localeData.summary || ''),
    '---',
    '',
    (localeData.body || '').trim(),
    ''
  ].join('\n');
}

function slugify(text) {
  return (text || 'figura')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'figura-' + Date.now();
}

function listAllFiguras() {
  const baseDir = 'src/content/figuras';
  if (!fs.existsSync(baseDir)) return [];
  const stockDb = readJson('src/data/precios-stock.json', {});
  const files = fs.readdirSync(baseDir).filter((f) => f.endsWith('.md'));

  return files.map((file) => {
    const slug = file.replace(/\.md$/, '');
    const parsed = parseMarkdownFile(path.join(baseDir, file));
    const stock = stockDb[slug] || {
      sourceUrl: '',
      program: 'Pendiente',
      price: 0,
      currency: 'EUR',
      inStock: true,
      lastChecked: '',
      affiliateLinks: { default: '#pendiente-afiliado' },
    };
    const translatedLangs = LANGS.filter((l) =>
      l === 'es' ? true : fs.existsSync(path.join(baseDir, l, file))
    );
    return {
      slug,
      data: parsed.data,
      body: parsed.body,
      stock,
      translatedLangs,
    };
  }).sort((a, b) => (a.data.featuredOrder || 100) - (b.data.featuredOrder || 100));
}

function getFiguraDetail(slug) {
  const baseDir = 'src/content/figuras';
  const esPath = path.join(baseDir, slug + '.md');
  if (!fs.existsSync(esPath)) return null;
  const stockDb = readJson('src/data/precios-stock.json', {});
  const esParsed = parseMarkdownFile(esPath);
  const locales = {};

  for (const lang of LANGS) {
    const p = lang === 'es' ? esPath : path.join(baseDir, lang, slug + '.md');
    if (fs.existsSync(p)) {
      const parsed = parseMarkdownFile(p);
      locales[lang] = {
        title: parsed.data.title,
        subtitle: parsed.data.subtitle,
        dimensions: parsed.data.dimensions,
        origin: parsed.data.origin,
        anatomy: parsed.data.anatomy,
        placementAdvice: parsed.data.placementAdvice,
        summary: parsed.data.summary,
        body: parsed.body,
      };
    }
  }

  return {
    slug,
    meta: esParsed.data,
    locales,
    stock: stockDb[slug] || {
      sourceUrl: '',
      program: 'Afiliado',
      price: 0,
      currency: 'EUR',
      inStock: true,
      lastChecked: new Date().toISOString(),
      affiliateLinks: { default: '#pendiente-afiliado' },
    },
  };
}

function extractJsonLd(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1].trim());
      const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      const prod = items.find((x) => x['@type'] === 'Product' || (Array.isArray(x['@type']) && x['@type'].includes('Product')));
      if (prod) return prod;
    } catch {}
  }
  return null;
}

async function scrapeProductUrl(targetUrl, manualText) {
  let raw = {
    rawTitle: '',
    rawDesc: manualText || '',
    price: 0,
    currency: 'EUR',
    inStock: true,
    images: [],
    program: 'Afiliado',
  };

  if (targetUrl) {
    if (targetUrl.includes('amazon.')) raw.program = 'Amazon Afiliados';
    else if (targetUrl.includes('etsy.')) raw.program = 'Etsy / Awin';

    try {
      const clean = targetUrl.split('?')[0].replace(/\/$/, '');
      const sRes = await fetch(clean + '.json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (sRes.ok) {
        const j = await sRes.json();
        if (j.product) {
          const p = j.product;
          const v = p.variants?.[0] || {};
          raw.program = 'Shopify / Tienda directa';
          raw.rawTitle = p.title || '';
          raw.rawDesc = ((p.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() + ' ' + (manualText || '')).trim();
          raw.price = parseFloat(v.price || '0') || 0;
          raw.inStock = v.available !== false;
          raw.images = (p.images || []).map((i) => i.src).slice(0, 4);
          return raw;
        }
      }
    } catch {}

    try {
      const res = await fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        },
      });
      const html = await res.text();
      const ld = extractJsonLd(html);
      const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
      const titleTag = html.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1] || '';
      const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
      const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
      const priceMeta = html.match(/<meta[^>]*property=["']product:price:amount["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';

      const offer = Array.isArray(ld?.offers) ? ld.offers[0] : ld?.offers;
      raw.rawTitle = (ld?.name || ogTitle || titleTag || '').trim();
      raw.rawDesc = ((ld?.description || ogDesc || '') + ' ' + (manualText || '')).trim();
      raw.price = parseFloat(offer?.price || priceMeta || '0') || 0;
      raw.currency = offer?.priceCurrency || 'EUR';
      raw.inStock = offer?.availability ? !String(offer.availability).includes('OutOfStock') : true;
      if (ld?.image) {
        raw.images = (Array.isArray(ld.image) ? ld.image : [ld.image]).slice(0, 4);
      } else if (ogImg) {
        raw.images = [ogImg];
      }
    } catch {}
  }

  return raw;
}

async function analyzeWithGemini(raw) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = [
    'Eres el curador experto de Manekineko.es. Analiza este producto de Maneki-neko y devuelve SOLO un JSON válido con esta estructura exacta:',
    '{',
    '  "slug": "slug-en-espanol-sin-tildes",',
    '  "meta": {',
    '    "paw": "left" | "right" | "both",',
    '    "color": "tricolor" | "white" | "gold" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "black",',
    '    "material": "ceramica" | "porcelana" | "resina" | "hariko" | "madera" | "metal",',
    '    "sizeCategory": "mini" | "pequeno" | "mediano" | "grande",',
    '    "dimensions": "ej. 15 × 10 × 9 cm",',
    '    "weight": "ej. 350 g",',
    '    "origin": "ej. Cerámica de Tokoname, Japón",',
    '    "extras": ["estatico" | "solar" | "koban" | "japon" | "hucha"]',
    '  },',
    '  "locales": {',
    '    "es": { "title": "", "subtitle": "", "dimensions": "", "origin": "", "anatomy": { "kobanText": "", "bell": "", "bibColor": "", "accessory": "" }, "placementAdvice": "", "summary": "", "body": "2-3 párrafos culturales en Markdown con ### subtítulos y viñetas" },',
    '    "en": { ... }, "fr": { ... }, "de": { ... }, "it": { ... }, "pt": { ... }, "ja": { ... }, "zh": { ... }, "ru": { ... }',
    '  }',
    '}',
    'Reglas: deduce el color y la pata por el título/descripción (si no se indica pata, usa "left" para comercios o "right" para hogar). Traduce con tono cultural refinado todos los campos de "locales" a los 9 idiomas (es, en, fr, de, it, pt, ja, zh, ru).',
    'Datos extraídos: ' + JSON.stringify(raw)
  ].join('\n');

  const resp = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    }
  );
  const data = await resp.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return txt ? JSON.parse(txt) : null;
}

async function downloadRemoteImages(slug, imageUrls) {
  const saved = [];
  const outDir = 'public/images/figuras';
  fs.mkdirSync(outDir, { recursive: true });

  for (let i = 0; i < imageUrls.length; i++) {
    const u = imageUrls[i];
    if (!u) continue;
    if (u.startsWith('/')) {
      saved.push(u);
      continue;
    }
    try {
      const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const buf = Buffer.from(await res.arrayBuffer());
      const fileName = slug + '-' + (saved.length + 1) + '.jpg';
      fs.writeFileSync(path.join(outDir, fileName), buf);
      saved.push('/images/figuras/' + fileName);
    } catch {}
  }
  return saved;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) { reject(e); }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, obj) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(obj));
}

const ADMIN_HTML = `<!doctype html>
<html lang="es">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Panel de Catálogo — Manekineko.es</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-[#FAF6F0] text-[#161412] min-h-screen font-sans">
  <header class="bg-white border-b border-[#E5DEC9] sticky top-0 z-30">
    <div class="max-w-7xl mx-auto px-6 py-4 flex flex-wrap items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <span class="px-2.5 py-1 text-xs font-bold tracking-widest uppercase border border-[#8E1323] text-[#8E1323] rounded">
          管理 • ADMIN STUDIO
        </span>
        <h1 class="font-serif text-xl font-bold">Gestor de Figuras y Afiliados</h1>
        <span id="gemini-badge" class="text-[11px] px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-600"></span>
      </div>

      <div class="flex flex-wrap items-center gap-2.5">
        <a href="http://localhost:4321/tienda/" target="_blank" class="px-3.5 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF6F0] text-xs font-semibold hover:border-[#8E1323]">
          Ver tienda local ↗
        </a>
        <button id="btn-sync-all" type="button" class="px-3.5 py-2 rounded-xl border border-[#C6922C] bg-amber-50 text-amber-900 text-xs font-semibold hover:bg-amber-100 cursor-pointer">
          Sincronizar precios/stock
        </button>
        <button id="btn-git-publish" type="button" class="px-3.5 py-2 rounded-xl border border-stone-300 bg-white text-xs font-semibold hover:border-[#161412] cursor-pointer">
          Publicar en GitHub
        </button>
        <button id="btn-new-figura" type="button" class="px-4 py-2 rounded-xl bg-[#8E1323] hover:bg-[#700E1B] text-white text-xs font-semibold shadow-xs cursor-pointer">
          + Nueva figura
        </button>
      </div>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-6 py-8">
    <div id="toast" class="hidden mb-6 px-4 py-3 rounded-xl border text-sm font-medium"></div>

    <section id="view-list" class="space-y-6">
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-4">
          <div class="text-xs text-stone-500">Figuras publicadas</div>
          <div id="stat-total" class="font-serif text-2xl font-bold mt-1">0</div>
        </div>
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-4">
          <div class="text-xs text-stone-500">En stock</div>
          <div id="stat-stock" class="font-serif text-2xl font-bold text-emerald-700 mt-1">0</div>
        </div>
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-4">
          <div class="text-xs text-stone-500">Con enlace afiliado activo</div>
          <div id="stat-aff" class="font-serif text-2xl font-bold text-[#8E1323] mt-1">0</div>
        </div>
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-4">
          <div class="text-xs text-stone-500">Idiomas por ficha</div>
          <div class="font-serif text-2xl font-bold mt-1">9 / 9</div>
        </div>
      </div>

      <div class="bg-white border border-[#E5DEC9] rounded-2xl overflow-hidden shadow-xs">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="border-b border-[#E5DEC9] bg-[#FAF6F0]/70 text-[11px] font-bold uppercase tracking-wider text-stone-500">
                <th class="py-3.5 px-4">Figura</th>
                <th class="py-3.5 px-4">Configurador</th>
                <th class="py-3.5 px-4">Precio</th>
                <th class="py-3.5 px-4">Stock</th>
                <th class="py-3.5 px-4">Afiliado</th>
                <th class="py-3.5 px-4">Idiomas</th>
                <th class="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody id="figuras-tbody" class="divide-y divide-[#E5DEC9] text-sm"></tbody>
          </table>
        </div>
      </div>
    </section>

    <section id="view-editor" class="hidden space-y-6">
      <div class="flex items-center justify-between">
        <button id="btn-back-list" type="button" class="text-sm font-semibold text-[#8E1323] hover:underline cursor-pointer">
          ← Volver al listado de figuras
        </button>
        <div class="flex items-center gap-3">
          <button id="btn-save-figura" type="button" class="px-6 py-2.5 rounded-xl bg-[#8E1323] hover:bg-[#700E1B] text-white text-sm font-semibold shadow-sm cursor-pointer">
            Guardar ficha en los 9 idiomas
          </button>
        </div>
      </div>

      <div class="bg-white border-2 border-[#C6922C]/70 rounded-2xl p-6 shadow-xs space-y-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span class="text-[11px] font-bold uppercase tracking-widest text-[#8E1323]">Importador inteligente</span>
            <h2 class="font-serif text-lg font-bold">1. Extraer datos desde tienda / enlace de afiliado</h2>
          </div>
          <span class="text-xs text-stone-500">Lee Shopify, Etsy, JSON-LD, OpenGraph y clasifica con Gemini AI</span>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">URL del producto en la tienda (para leer precio, fotos y stock)</label>
            <input id="imp-source-url" type="url" placeholder="https://tienda-japonesa.com/products/maneki-neko..." class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-sm focus:border-[#8E1323] focus:outline-none" />
          </div>
          <div>
            <label class="block text-xs font-semibold text-stone-700 mb-1">Tu enlace de afiliado / referido (el que abre el botón Comprar)</label>
            <input id="imp-aff-url" type="text" placeholder="https://amzn.to/... o https://www.awin1.com/..." class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-sm focus:border-[#8E1323] focus:outline-none" />
          </div>
        </div>

        <div>
          <label class="block text-xs font-semibold text-stone-700 mb-1">Notas o texto copiado de la página (opcional, muy útil si Amazon bloquea lectura directa)</label>
          <textarea id="imp-manual-text" rows="2" placeholder="Pega aquí características, medidas o descripción si la web original bloquea bots..." class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-sm focus:border-[#8E1323] focus:outline-none"></textarea>
        </div>

        <div class="flex flex-wrap items-center justify-between gap-4">
          <label class="inline-flex items-center gap-2 text-xs text-stone-700 cursor-pointer">
            <input id="imp-download-imgs" type="checkbox" checked class="rounded text-[#8E1323]" />
            <span>Descargar automáticamente las imágenes de la tienda a <code>public/images/figuras/</code></span>
          </label>
          <button id="btn-run-extract" type="button" class="px-5 py-2.5 rounded-xl bg-[#161412] hover:bg-stone-800 text-white text-xs font-semibold cursor-pointer">
            Leer URL y autorellenar ficha ✨
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div class="lg:col-span-5 space-y-6">
          <div class="bg-white border border-[#E5DEC9] rounded-2xl p-6 space-y-4">
            <h3 class="font-serif text-base font-bold border-b border-[#E5DEC9] pb-2">2. Atributos del Configurador</h3>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Slug (URL de ficha)</label>
                <input id="f-slug" type="text" placeholder="gotokuji-blanco-15cm" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs font-mono" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Orden destacado</label>
                <input id="f-order" type="number" value="10" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Pata alzada</label>
                <select id="f-paw" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs bg-white">
                  <option value="left">Pata izquierda (Clientes)</option>
                  <option value="right">Pata derecha (Dinero)</option>
                  <option value="both">Ambas patas (Protección)</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Color del manto</label>
                <select id="f-color" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs bg-white">
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
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Material</label>
                <select id="f-material" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs bg-white">
                  <option value="ceramica">Cerámica tradicional</option>
                  <option value="porcelana">Porcelana esmaltada</option>
                  <option value="resina">Resina / Poliresina</option>
                  <option value="hariko">Papel maché (Hariko)</option>
                  <option value="madera">Madera / Kokeshi</option>
                  <option value="metal">Metal / Latón</option>
                </select>
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Categoría de tamaño</label>
                <select id="f-size" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs bg-white">
                  <option value="mini">Miniatura (&lt; 10 cm)</option>
                  <option value="pequeno">Pequeño (10–15 cm)</option>
                  <option value="mediano">Mediano (16–25 cm)</option>
                  <option value="grande">Grande (&gt; 25 cm)</option>
                </select>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Medidas exactas</label>
                <input id="f-dimensions" type="text" placeholder="15 × 10 × 9,5 cm" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Peso aproximado</label>
                <input id="f-weight" type="text" placeholder="390 g" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
              </div>
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1.5">Detalles y mecanismo</label>
              <div class="grid grid-cols-2 gap-2 text-xs">
                <label class="flex items-center gap-2"><input type="checkbox" class="f-extra" value="estatico" checked /> Estática</label>
                <label class="flex items-center gap-2"><input type="checkbox" class="f-extra" value="solar" /> Pata móvil (Solar/Pila)</label>
                <label class="flex items-center gap-2"><input type="checkbox" class="f-extra" value="koban" /> Moneda Koban</label>
                <label class="flex items-center gap-2"><input type="checkbox" class="f-extra" value="japon" /> Hecho en Japón</label>
                <label class="flex items-center gap-2"><input type="checkbox" class="f-extra" value="hucha" /> Función hucha</label>
              </div>
            </div>
          </div>

          <div class="bg-white border border-[#E5DEC9] rounded-2xl p-6 space-y-4">
            <h3 class="font-serif text-base font-bold border-b border-[#E5DEC9] pb-2">3. Precio, Stock y Enlaces de Referido</h3>

            <div class="grid grid-cols-3 gap-3 items-end">
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Precio (€)</label>
                <input id="f-price" type="number" step="0.01" value="0" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
              </div>
              <div>
                <label class="block text-xs font-semibold text-stone-600 mb-1">Programa</label>
                <input id="f-program" type="text" placeholder="Amazon / Etsy" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
              </div>
              <label class="flex items-center gap-2 text-xs font-semibold pb-2 cursor-pointer">
                <input id="f-instock" type="checkbox" checked class="rounded text-emerald-700" />
                <span>En stock</span>
              </label>
            </div>

            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1">Enlace referido principal (ES / Global OneLink)</label>
              <input id="f-aff-default" type="text" placeholder="https://..." class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
            </div>

            <details class="text-xs">
              <summary class="cursor-pointer font-semibold text-stone-600 hover:text-[#8E1323]">Enlaces específicos por idioma/país (opcional)</summary>
              <div id="country-links-grid" class="mt-3 space-y-2"></div>
            </details>
          </div>

          <div class="bg-white border border-[#E5DEC9] rounded-2xl p-6 space-y-4">
            <div class="flex items-center justify-between border-b border-[#E5DEC9] pb-2">
              <h3 class="font-serif text-base font-bold">4. Imágenes de la figura</h3>
              <label class="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#E5DEC9] text-xs font-semibold cursor-pointer hover:border-[#8E1323]">
                + Subir fotos
                <input id="f-upload-files" type="file" accept="image/*" multiple class="hidden" />
              </label>
            </div>
            <div id="images-preview-grid" class="grid grid-cols-2 gap-3"></div>
            <div>
              <label class="block text-[11px] text-stone-500 mb-1">Rutas de imagen (una por línea)</label>
              <textarea id="f-images-text" rows="3" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs font-mono"></textarea>
            </div>
          </div>
        </div>

        <div class="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-2xl p-6 space-y-4">
          <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#E5DEC9] pb-3">
            <h3 class="font-serif text-base font-bold">5. Textos Culturales e Iconográficos (9 Idiomas)</h3>
            <div id="lang-tabs" class="flex flex-wrap gap-1"></div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-600 mb-1">Título de la figura</label>
            <input id="loc-title" type="text" class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-sm font-semibold" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-600 mb-1">Subtítulo / Bajada simbólica</label>
            <input id="loc-subtitle" type="text" class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-xs" />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1">Origen / Tradición artesanal</label>
              <input id="loc-origin" type="text" placeholder="Cerámica de Tokoname, Japón" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1">Inscripción moneda Koban (vacío si no lleva)</label>
              <input id="loc-koban" type="text" placeholder="Senman Ryō (10 millones de monedas)" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
            </div>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1">Cascabel</label>
              <input id="loc-bell" type="text" placeholder="Cascabel dorado tradicional" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1">Babero (Yodarekake)</label>
              <input id="loc-bib" type="text" placeholder="Rojo escarlata" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
            </div>
            <div>
              <label class="block text-xs font-semibold text-stone-600 mb-1">Atributo adicional</label>
              <input id="loc-accessory" type="text" placeholder="Abanico / Daruma / Sin moneda" class="w-full rounded-xl border border-[#E5DEC9] px-3 py-2 text-xs" />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-600 mb-1">Consejo de ubicación (Feng Shui / tradición japonesa)</label>
            <input id="loc-placement" type="text" class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-xs" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-600 mb-1">Resumen corto para tarjeta de catálogo</label>
            <input id="loc-summary" type="text" class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2 text-xs" />
          </div>

          <div>
            <label class="block text-xs font-semibold text-stone-600 mb-1">Relato simbólico y detalles (Markdown)</label>
            <textarea id="loc-body" rows="10" class="w-full rounded-xl border border-[#E5DEC9] px-3.5 py-2.5 text-xs font-mono leading-relaxed"></textarea>
          </div>
        </div>
      </div>
    </section>
  </main>

  <script>
    const LANGS = ['es', 'en', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ru'];
    let currentLang = 'es';
    let editorState = null;

    function showToast(msg, ok = true) {
      const el = document.getElementById('toast');
      el.textContent = msg;
      el.className = ok
        ? 'mb-6 px-4 py-3 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 text-sm font-medium'
        : 'mb-6 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-900 text-sm font-medium';
    }

    function emptyLocale() {
      return {
        title: '',
        subtitle: '',
        dimensions: '',
        origin: '',
        anatomy: { kobanText: '', bell: 'Cascabel dorado tradicional', bibColor: 'Rojo escarlata', accessory: '' },
        placementAdvice: '',
        summary: '',
        body: '',
      };
    }

    function createBlankState() {
      const locales = {};
      LANGS.forEach((l) => { locales[l] = emptyLocale(); });
      return {
        slug: '',
        meta: {
          publishedAt: new Date().toISOString().slice(0, 10),
          featuredOrder: 10,
          paw: 'left',
          color: 'tricolor',
          material: 'ceramica',
          sizeCategory: 'pequeno',
          dimensions: '15 × 10 × 10 cm',
          weight: '',
          origin: 'Japón',
          extras: ['estatico'],
          images: [],
        },
        stock: {
          sourceUrl: '',
          program: 'Amazon / Etsy',
          price: 0,
          currency: 'EUR',
          inStock: true,
          affiliateLinks: { default: '#pendiente-afiliado' },
        },
        locales,
      };
    }

    function syncCurrentLocaleFromInputs() {
      if (!editorState) return;
      const loc = editorState.locales[currentLang] || emptyLocale();
      loc.title = document.getElementById('loc-title').value;
      loc.subtitle = document.getElementById('loc-subtitle').value;
      loc.origin = document.getElementById('loc-origin').value;
      loc.dimensions = document.getElementById('f-dimensions').value;
      loc.anatomy = {
        kobanText: document.getElementById('loc-koban').value,
        bell: document.getElementById('loc-bell').value,
        bibColor: document.getElementById('loc-bib').value,
        accessory: document.getElementById('loc-accessory').value,
      };
      loc.placementAdvice = document.getElementById('loc-placement').value;
      loc.summary = document.getElementById('loc-summary').value;
      loc.body = document.getElementById('loc-body').value;
      editorState.locales[currentLang] = loc;
    }

    function renderLocaleInputs() {
      const loc = editorState.locales[currentLang] || emptyLocale();
      document.getElementById('loc-title').value = loc.title || '';
      document.getElementById('loc-subtitle').value = loc.subtitle || '';
      document.getElementById('loc-origin').value = loc.origin || editorState.meta.origin || '';
      document.getElementById('loc-koban').value = loc.anatomy?.kobanText || '';
      document.getElementById('loc-bell').value = loc.anatomy?.bell || '';
      document.getElementById('loc-bib').value = loc.anatomy?.bibColor || '';
      document.getElementById('loc-accessory').value = loc.anatomy?.accessory || '';
      document.getElementById('loc-placement').value = loc.placementAdvice || '';
      document.getElementById('loc-summary').value = loc.summary || '';
      document.getElementById('loc-body').value = loc.body || '';

      const tabsEl = document.getElementById('lang-tabs');
      tabsEl.innerHTML = '';
      LANGS.forEach((l) => {
        const hasTitle = Boolean(editorState.locales[l]?.title);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = l.toUpperCase() + (hasTitle ? ' ✓' : '');
        btn.className = l === currentLang
          ? 'px-2.5 py-1 rounded-lg bg-[#8E1323] text-white text-xs font-bold cursor-pointer'
          : 'px-2.5 py-1 rounded-lg bg-[#FAF6F0] border border-[#E5DEC9] text-xs font-semibold text-stone-700 hover:border-[#8E1323] cursor-pointer';
        btn.onclick = () => {
          syncCurrentLocaleFromInputs();
          currentLang = l;
          renderLocaleInputs();
        };
        tabsEl.appendChild(btn);
      });
    }

    function renderImagesPreview() {
      const raw = document.getElementById('f-images-text').value;
      const imgs = raw.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
      const grid = document.getElementById('images-preview-grid');
      grid.innerHTML = imgs.map((src, i) =>
        '<div class="relative rounded-xl overflow-hidden border border-[#E5DEC9] bg-[#FAF6F0] aspect-[4/3]">' +
        '<img src="' + src + '" class="w-full h-full object-cover" />' +
        '<span class="absolute top-1.5 left-1.5 px-2 py-0.5 rounded bg-black/70 text-white text-[10px]">#' + (i + 1) + '</span>' +
        '</div>'
      ).join('');
    }

    function openEditor(state) {
      editorState = state;
      currentLang = 'es';
      document.getElementById('view-list').classList.add('hidden');
      document.getElementById('view-editor').classList.remove('hidden');

      document.getElementById('imp-source-url').value = state.stock.sourceUrl || '';
      document.getElementById('imp-aff-url').value = state.stock.affiliateLinks?.default || '';
      document.getElementById('f-slug').value = state.slug || '';
      document.getElementById('f-order').value = state.meta.featuredOrder ?? 10;
      document.getElementById('f-paw').value = state.meta.paw || 'left';
      document.getElementById('f-color').value = state.meta.color || 'tricolor';
      document.getElementById('f-material').value = state.meta.material || 'ceramica';
      document.getElementById('f-size').value = state.meta.sizeCategory || 'pequeno';
      document.getElementById('f-dimensions').value = state.meta.dimensions || '';
      document.getElementById('f-weight').value = state.meta.weight || '';

      document.querySelectorAll('.f-extra').forEach((cb) => {
        cb.checked = (state.meta.extras || []).includes(cb.value);
      });

      document.getElementById('f-price').value = state.stock.price || 0;
      document.getElementById('f-program').value = state.stock.program || '';
      document.getElementById('f-instock').checked = state.stock.inStock !== false;
      document.getElementById('f-aff-default').value = state.stock.affiliateLinks?.default || '';

      const clGrid = document.getElementById('country-links-grid');
      clGrid.innerHTML = LANGS.map((l) =>
        '<div class="flex items-center gap-2">' +
        '<span class="w-8 font-bold uppercase text-stone-500">' + l + '</span>' +
        '<input data-aff-lang="' + l + '" type="text" value="' + (state.stock.affiliateLinks?.[l] || '') + '" placeholder="Mismo que principal" class="flex-1 rounded-lg border border-[#E5DEC9] px-2.5 py-1 text-xs" />' +
        '</div>'
      ).join('');

      document.getElementById('f-images-text').value = (state.meta.images || []).join('\n');
      renderImagesPreview();
      renderLocaleInputs();
    }

    async function loadList() {
      const res = await fetch('/api/figuras');
      const data = await res.json();
      document.getElementById('gemini-badge').textContent = data.hasGemini
        ? 'Gemini AI: Conectado'
        : 'Gemini AI: Sin clave en .env (modo manual/scraping)';

      const items = data.items || [];
      document.getElementById('stat-total').textContent = items.length;
      document.getElementById('stat-stock').textContent = items.filter((x) => x.stock.inStock).length;
      document.getElementById('stat-aff').textContent = items.filter((x) => (x.stock.affiliateLinks?.default || '').startsWith('http')).length;

      const tbody = document.getElementById('figuras-tbody');
      tbody.innerHTML = items.map((item) => {
        const img = item.data.images?.[0] || '/images/timeline-5-tokoname.jpeg';
        const hasAff = (item.stock.affiliateLinks?.default || '').startsWith('http');
        return '<tr class="hover:bg-[#FAF6F0]/50">' +
          '<td class="py-3.5 px-4"><div class="flex items-center gap-3">' +
            '<img src="' + img + '" class="w-12 h-12 rounded-xl object-cover border border-[#E5DEC9]" />' +
            '<div><div class="font-serif font-bold text-[#161412]">' + item.data.title + '</div>' +
            '<div class="text-xs font-mono text-stone-400">' + item.slug + '</div></div>' +
          '</div></td>' +
          '<td class="py-3.5 px-4 text-xs"><span class="px-2 py-0.5 rounded bg-[#FAF6F0] border border-[#E5DEC9] font-semibold">' + item.data.color + '</span> · ' + item.data.paw + '</td>' +
          '<td class="py-3.5 px-4 font-serif font-bold">' + Number(item.stock.price || 0).toFixed(2) + ' €</td>' +
          '<td class="py-3.5 px-4"><button data-toggle-stock="' + item.slug + '" class="px-2.5 py-1 rounded-full text-xs font-semibold cursor-pointer ' + (item.stock.inStock ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200') + '">' + (item.stock.inStock ? 'En stock' : 'Agotado') + '</button></td>' +
          '<td class="py-3.5 px-4 text-xs">' + (hasAff ? '<span class="text-emerald-700 font-semibold">Activo (' + item.stock.program + ')</span>' : '<span class="text-stone-400">Pendiente</span>') + '</td>' +
          '<td class="py-3.5 px-4 text-xs font-semibold">' + item.translatedLangs.length + ' / 9</td>' +
          '<td class="py-3.5 px-4 text-right space-x-2">' +
            '<a href="http://localhost:4321/tienda/' + item.slug + '/" target="_blank" class="text-xs text-stone-500 hover:text-[#161412]">Ver ↗</a>' +
            '<button data-edit="' + item.slug + '" class="px-3 py-1.5 rounded-lg bg-[#FAF6F0] border border-[#E5DEC9] text-xs font-semibold hover:border-[#8E1323] cursor-pointer">Editar</button>' +
            '<button data-del="' + item.slug + '" class="px-2.5 py-1.5 rounded-lg text-xs text-red-700 hover:bg-red-50 cursor-pointer">Borrar</button>' +
          '</td>' +
        '</tr>';
      }).join('');

      tbody.querySelectorAll('[data-edit]').forEach((btn) => {
        btn.onclick = async () => {
          const r = await fetch('/api/figuras/' + btn.dataset.edit);
          openEditor(await r.json());
        };
      });

      tbody.querySelectorAll('[data-toggle-stock]').forEach((btn) => {
        btn.onclick = async () => {
          await fetch('/api/toggle-stock/' + btn.dataset.toggleStock, { method: 'POST' });
          loadList();
        };
      });

      tbody.querySelectorAll('[data-del]').forEach((btn) => {
        btn.onclick = async () => {
          if (!confirm('¿Eliminar la ficha "' + btn.dataset.del + '" en todos los idiomas?')) return;
          await fetch('/api/figuras/' + btn.dataset.del, { method: 'DELETE' });
          showToast('Ficha eliminada correctamente.');
          loadList();
        };
      });
    }

    document.getElementById('btn-new-figura').onclick = () => openEditor(createBlankState());
    document.getElementById('btn-back-list').onclick = () => {
      document.getElementById('view-editor').classList.add('hidden');
      document.getElementById('view-list').classList.remove('hidden');
      loadList();
    };
    document.getElementById('f-images-text').oninput = renderImagesPreview;

    document.getElementById('f-upload-files').onchange = async (e) => {
      const files = Array.from(e.target.files || []);
      if (!files.length) return;
      const slug = document.getElementById('f-slug').value.trim() || 'figura-' + Date.now();
      document.getElementById('f-slug').value = slug;
      const existing = document.getElementById('f-images-text').value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean);

      for (let i = 0; i < files.length; i++) {
        const b64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(files[i]);
        });
        const res = await fetch('/api/upload-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ slug, index: existing.length + 1, dataUrl: b64 }),
        });
        const out = await res.json();
        if (out.path) existing.push(out.path);
      }
      document.getElementById('f-images-text').value = existing.join('\n');
      renderImagesPreview();
      showToast('Imágenes guardadas en public/images/figuras/');
    };

    document.getElementById('btn-run-extract').onclick = async () => {
      const btn = document.getElementById('btn-run-extract');
      btn.disabled = true;
      btn.textContent = 'Analizando página y traduciendo con IA...';
      try {
        const res = await fetch('/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceUrl: document.getElementById('imp-source-url').value.trim(),
            affiliateUrl: document.getElementById('imp-aff-url').value.trim(),
            manualText: document.getElementById('imp-manual-text').value.trim(),
            downloadImages: document.getElementById('imp-download-imgs').checked,
          }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        openEditor(data.state);
        showToast(data.usedAi
          ? 'Ficha extraída y traducida automáticamente a los 9 idiomas.'
          : 'Datos básicos extraídos de la URL. Revisa los campos y guarda.');
      } catch (err) {
        showToast('Error al analizar: ' + err.message, false);
      } finally {
        btn.disabled = false;
        btn.textContent = 'Leer URL y autorellenar ficha ✨';
      }
    };

    document.getElementById('btn-save-figura').onclick = async () => {
      syncCurrentLocaleFromInputs();
      const slug = document.getElementById('f-slug').value.trim();
      if (!slug) {
        showToast('Escribe un slug para la ficha antes de guardar.', false);
        return;
      }

      const affDefault = document.getElementById('f-aff-default').value.trim() || '#pendiente-afiliado';
      const affiliateLinks = { default: affDefault };
      document.querySelectorAll('[data-aff-lang]').forEach((inp) => {
        affiliateLinks[inp.dataset.affLang] = inp.value.trim() || affDefault;
      });

      const payload = {
        slug,
        meta: {
          publishedAt: editorState.meta.publishedAt || new Date().toISOString().slice(0, 10),
          featuredOrder: parseInt(document.getElementById('f-order').value, 10) || 10,
          paw: document.getElementById('f-paw').value,
          color: document.getElementById('f-color').value,
          material: document.getElementById('f-material').value,
          sizeCategory: document.getElementById('f-size').value,
          dimensions: document.getElementById('f-dimensions').value.trim(),
          weight: document.getElementById('f-weight').value.trim(),
          origin: editorState.locales.es?.origin || 'Japón',
          extras: Array.from(document.querySelectorAll('.f-extra:checked')).map((c) => c.value),
          images: document.getElementById('f-images-text').value.split(/\r?\n/).map((s) => s.trim()).filter(Boolean),
        },
        stock: {
          sourceUrl: document.getElementById('imp-source-url').value.trim(),
          program: document.getElementById('f-program').value.trim() || 'Afiliado',
          price: parseFloat(document.getElementById('f-price').value) || 0,
          currency: 'EUR',
          inStock: document.getElementById('f-instock').checked,
          lastChecked: new Date().toISOString(),
          affiliateLinks,
        },
        locales: editorState.locales,
      };

      const res = await fetch('/api/figuras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const out = await res.json();
      if (out.ok) {
        showToast('Guardada "' + slug + '" en ' + out.savedCount + ' idiomas y sincronizada con precios-stock.json.');
      } else {
        showToast('Error guardando: ' + (out.error || ''), false);
      }
    };

    document.getElementById('btn-sync-all').onclick = async () => {
      const btn = document.getElementById('btn-sync-all');
      btn.textContent = 'Sincronizando...';
      const res = await fetch('/api/sync-all', { method: 'POST' });
      const out = await res.json();
      btn.textContent = 'Sincronizar precios/stock';
      showToast(out.output || 'Sincronización completada.');
      loadList();
    };

    document.getElementById('btn-git-publish').onclick = async () => {
      if (!confirm('¿Confirmar cambios y subir el catálogo actualizado a GitHub / Vercel?')) return;
      const btn = document.getElementById('btn-git-publish');
      btn.textContent = 'Publicando...';
      const res = await fetch('/api/git-publish', { method: 'POST' });
      const out = await res.json();
      btn.textContent = 'Publicar en GitHub';
      showToast(out.ok ? 'Cambios subidos a GitHub. Vercel desplegará en segundos.' : out.error, out.ok);
    };

    loadList();
  </script>
</body>
</html>`;

const MIME = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
};

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = urlObj.pathname;

  try {
    if (req.method === 'GET' && pathname === '/') {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      return res.end(ADMIN_HTML);
    }

    if (req.method === 'GET' && (pathname.startsWith('/images/') || pathname.startsWith('/MN_'))) {
      const filePath = path.join('public', pathname);
      if (fs.existsSync(filePath)) {
        const ext = path.extname(filePath).toLowerCase();
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        return fs.createReadStream(filePath).pipe(res);
      }
    }

    if (req.method === 'GET' && pathname === '/api/figuras') {
      return sendJson(res, 200, {
        hasGemini: Boolean(process.env.GEMINI_API_KEY),
        items: listAllFiguras(),
      });
    }

    if (req.method === 'GET' && pathname.startsWith('/api/figuras/')) {
      const slug = decodeURIComponent(pathname.replace('/api/figuras/', ''));
      const detail = getFiguraDetail(slug);
      return detail ? sendJson(res, 200, detail) : sendJson(res, 404, { error: 'No encontrada' });
    }

    if (req.method === 'DELETE' && pathname.startsWith('/api/figuras/')) {
      const slug = decodeURIComponent(pathname.replace('/api/figuras/', ''));
      for (const lang of LANGS) {
        const p = lang === 'es'
          ? path.join('src/content/figuras', slug + '.md')
          : path.join('src/content/figuras', lang, slug + '.md');
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      const db = readJson('src/data/precios-stock.json', {});
      delete db[slug];
      writeStockDb(db);
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && pathname.startsWith('/api/toggle-stock/')) {
      const slug = decodeURIComponent(pathname.replace('/api/toggle-stock/', ''));
      const db = readJson('src/data/precios-stock.json', {});
      if (db[slug]) {
        db[slug].inStock = !db[slug].inStock;
        db[slug].lastChecked = new Date().toISOString();
        writeStockDb(db);
      }
      return sendJson(res, 200, { ok: true });
    }

    if (req.method === 'POST' && pathname === '/api/upload-image') {
      const body = await readBody(req);
      const m = String(body.dataUrl || '').match(/^data:image\/[a-zA-Z0-9+.-]+;base64,(.+)$/);
      if (!m) return sendJson(res, 400, { error: 'Imagen no válida' });
      const slug = slugify(body.slug);
      const fileName = slug + '-' + (body.index || 1) + '.jpg';
      fs.mkdirSync('public/images/figuras', { recursive: true });
      fs.writeFileSync(path.join('public/images/figuras', fileName), Buffer.from(m[1], 'base64'));
      return sendJson(res, 200, { path: '/images/figuras/' + fileName });
    }

    if (req.method === 'POST' && pathname === '/api/extract') {
      const body = await readBody(req);
      const raw = await scrapeProductUrl(body.sourceUrl, body.manualText);
      const ai = await analyzeWithGemini(raw);
      const slug = slugify(ai?.slug || raw.rawTitle);
      const aff = body.affiliateUrl || '#pendiente-afiliado';

      let images = raw.images || [];
      if (body.downloadImages && images.length) {
        const downloaded = await downloadRemoteImages(slug, images);
        if (downloaded.length) images = downloaded;
      }

      const locales = ai?.locales || {};
      if (!locales.es) {
        locales.es = {
          title: raw.rawTitle || slug,
          subtitle: (raw.rawDesc || '').slice(0, 160),
          dimensions: '15 × 10 × 10 cm',
          origin: 'Japón',
          anatomy: { kobanText: '', bell: 'Cascabel dorado tradicional', bibColor: 'Rojo escarlata', accessory: '' },
          placementAdvice: 'Colócala en un lugar luminoso cerca de la entrada o escritorio.',
          summary: (raw.rawDesc || raw.rawTitle || '').slice(0, 140),
          body: raw.rawDesc || '',
        };
      }

      const affLinks = { default: aff };
      LANGS.forEach((l) => { affLinks[l] = aff; });

      return sendJson(res, 200, {
        usedAi: Boolean(ai),
        state: {
          slug,
          meta: {
            publishedAt: new Date().toISOString().slice(0, 10),
            featuredOrder: 10,
            paw: ai?.meta?.paw || 'left',
            color: ai?.meta?.color || 'tricolor',
            material: ai?.meta?.material || 'ceramica',
            sizeCategory: ai?.meta?.sizeCategory || 'pequeno',
            dimensions: ai?.meta?.dimensions || '15 × 10 × 10 cm',
            weight: ai?.meta?.weight || '',
            origin: ai?.meta?.origin || 'Japón',
            extras: ai?.meta?.extras || ['estatico'],
            images,
          },
          stock: {
            sourceUrl: body.sourceUrl || '',
            program: raw.program || 'Afiliado',
            price: raw.price || 0,
            currency: raw.currency || 'EUR',
            inStock: raw.inStock !== false,
            affiliateLinks: affLinks,
          },
          locales,
        },
      });
    }

    if (req.method === 'POST' && pathname === '/api/figuras') {
      const body = await readBody(req);
      const slug = slugify(body.slug);
      let savedCount = 0;

      for (const lang of LANGS) {
        const loc = body.locales?.[lang];
        if (!loc || !loc.title) continue;
        const outPath = lang === 'es'
          ? path.join('src/content/figuras', slug + '.md')
          : path.join('src/content/figuras', lang, slug + '.md');
        fs.mkdirSync(path.dirname(outPath), { recursive: true });
        fs.writeFileSync(outPath, buildMarkdownContent(body.meta, loc), 'utf8');
        savedCount++;
      }

      const db = readJson('src/data/precios-stock.json', {});
      db[slug] = body.stock;
      writeStockDb(db);

      return sendJson(res, 200, { ok: true, slug, savedCount });
    }

    if (req.method === 'POST' && pathname === '/api/sync-all') {
      exec('node scripts/sync-precios.cjs', (err, stdout, stderr) => {
        return sendJson(res, 200, { ok: !err, output: (stdout || stderr || '').trim() });
      });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/git-publish') {
      exec('git add . && git commit -m "Actualizado catalogo de figuras desde Admin Studio" && git push', (err, stdout, stderr) => {
        return sendJson(res, 200, { ok: !err, error: stderr || stdout });
      });
      return;
    }

    res.writeHead(404);
    res.end('Not found');
  } catch (err) {
    sendJson(res, 500, { error: err.message });
  }
});

server.listen(PORT, () => {
  console.log('\n=====================================================');
  console.log('  PANEL DE ADMINISTRACION LISTO:');
  console.log('  Abre en tu navegador -> http://localhost:' + PORT);
  console.log('=====================================================\n');
});
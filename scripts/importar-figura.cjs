/**
 * Uso:
 *   node scripts/importar-figura.cjs --url="https://tienda.com/producto" --slug="maneki-dorado-koban"
 *
 * Si defines GEMINI_API_KEY en tu .env, extraerá los datos del producto, clasificará
 * automáticamente los atributos del configurador (color, pata, material, tamaño, koban)
 * y generará la ficha traducida a los 9 idiomas (es, en, fr, de, it, pt, ja, zh, ru).
 */
const fs = require('fs');
const path = require('path');

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

const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const [k, ...v] = a.replace(/^--/, '').split('=');
    return [k, v.join('=')];
  })
);

const url = args.url || '';
const slug = args.slug || 'nueva-figura-' + Date.now();
const affiliateUrl = args.affiliate || '#pendiente-afiliado';

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

async function fetchProductData(targetUrl) {
  if (!targetUrl) return null;
  // Si es tienda Shopify, probar primero su endpoint público .json
  try {
    const clean = targetUrl.split('?')[0].replace(/\/$/, '');
    const shopifyRes = await fetch(clean + '.json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (shopifyRes.ok) {
      const json = await shopifyRes.json();
      if (json.product) {
        const p = json.product;
        const v = p.variants?.[0] || {};
        return {
          rawTitle: p.title,
          rawDesc: (p.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim(),
          price: parseFloat(v.price || '0') || 0,
          currency: 'EUR',
          inStock: v.available !== false,
          images: (p.images || []).map((i) => i.src).slice(0, 4),
        };
      }
    }
  } catch {}

  const res = await fetch(targetUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
  });
  const html = await res.text();
  const ld = extractJsonLd(html);
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';
  const ogImg = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i)?.[1] || '';

  const offer = Array.isArray(ld?.offers) ? ld.offers[0] : ld?.offers;
  return {
    rawTitle: ld?.name || ogTitle || slug,
    rawDesc: ld?.description || ogDesc || '',
    price: parseFloat(offer?.price || '0') || 0,
    currency: offer?.priceCurrency || 'EUR',
    inStock: offer?.availability ? !String(offer.availability).includes('OutOfStock') : true,
    images: ld?.image ? (Array.isArray(ld.image) ? ld.image : [ld.image]).slice(0, 4) : ogImg ? [ogImg] : ['/images/timeline-5-tokoname.jpeg'],
  };
}

async function generateWithGemini(raw) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const prompt = `Eres el editor cultural de Manekineko.es. A partir de estos datos de producto, devuelve SOLO un JSON válido con:
1) "meta": {
  "paw": "left" | "right" | "both",
  "color": "tricolor" | "white" | "gold" | "yellow" | "green" | "blue" | "purple" | "pink" | "red" | "black",
  "material": "ceramica" | "porcelana" | "resina" | "hariko" | "madera" | "metal",
  "sizeCategory": "mini" | "pequeno" | "mediano" | "grande",
  "dimensions": "ej. 15 x 10 x 9 cm",
  "weight": "ej. 380 g",
  "extras": ["estatico" | "solar" | "koban" | "japon" | "hucha"]
}
2) "locales": objeto con claves "es", "en", "fr", "de", "it", "pt", "ja", "zh", "ru". Cada idioma tendrá:
  { "title": string, "subtitle": string, "origin": string, "kobanText": string, "bell": string, "bibColor": string, "accessory": string, "placementAdvice": string, "summary": string, "bodyMarkdown": string }

Datos del producto: ${JSON.stringify(raw)}`;

  const resp = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  });
  const data = await resp.json();
  const txt = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  return txt ? JSON.parse(txt) : null;
}

(async () => {
  const today = new Date().toISOString().slice(0, 10);
  const raw = (await fetchProductData(url)) || {
    rawTitle: slug,
    rawDesc: 'Figura tradicional japonesa Maneki-neko.',
    price: 0,
    currency: 'EUR',
    inStock: true,
    images: ['/images/timeline-5-tokoname.jpeg'],
  };

  const ai = await generateWithGemini(raw);
  const meta = ai?.meta || {
    paw: 'left',
    color: 'tricolor',
    material: 'ceramica',
    sizeCategory: 'pequeno',
    dimensions: '15 × 10 × 10 cm',
    weight: '',
    extras: ['estatico'],
  };

  const locales = ai?.locales || {
    es: {
      title: raw.rawTitle,
      subtitle: raw.rawDesc.slice(0, 160) || 'Figura tradicional japonesa Maneki-neko.',
      origin: 'Japón',
      kobanText: '',
      bell: 'Cascabel dorado',
      bibColor: 'Rojo tradicional',
      accessory: '',
      placementAdvice: 'Colócala cerca de la entrada o en un lugar visible del espacio de trabajo.',
      summary: raw.rawDesc.slice(0, 140) || raw.rawTitle,
      bodyMarkdown: raw.rawDesc || 'Descripción detallada de la pieza.',
    },
  };

  for (const [lang, tr] of Object.entries(locales)) {
    const outPath = lang === 'es'
      ? path.join('src/content/figuras', `${slug}.md`)
      : path.join('src/content/figuras', lang, `${slug}.md`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const md = `---
title: ${JSON.stringify(tr.title)}
subtitle: ${JSON.stringify(tr.subtitle)}
publishedAt: "${today}"
featuredOrder: 10
paw: "${meta.paw}"
color: "${meta.color}"
material: "${meta.material}"
sizeCategory: "${meta.sizeCategory}"
dimensions: ${JSON.stringify(tr.dimensions || meta.dimensions)}
weight: ${JSON.stringify(meta.weight || '')}
origin: ${JSON.stringify(tr.origin || 'Japón')}
extras: ${JSON.stringify(meta.extras || ['estatico'])}
anatomy:
  kobanText: ${JSON.stringify(tr.kobanText || '')}
  bell: ${JSON.stringify(tr.bell || '')}
  bibColor: ${JSON.stringify(tr.bibColor || '')}
  accessory: ${JSON.stringify(tr.accessory || '')}
placementAdvice: ${JSON.stringify(tr.placementAdvice || '')}
images: ${JSON.stringify(raw.images)}
summary: ${JSON.stringify(tr.summary)}
---

${tr.bodyMarkdown}
`;
    fs.writeFileSync(outPath, md, 'utf8');
  }

  for (const jsonPath of ['src/data/precios-stock.json', 'public/data/precios-stock.json']) {
    const db = fs.existsSync(jsonPath) ? JSON.parse(fs.readFileSync(jsonPath, 'utf8')) : {};
    db[slug] = {
      sourceUrl: url,
      program: 'Afiliado',
      price: raw.price,
      currency: raw.currency,
      inStock: raw.inStock,
      lastChecked: new Date().toISOString(),
      affiliateLinks: {
        default: affiliateUrl,
        es: affiliateUrl,
        en: affiliateUrl,
        fr: affiliateUrl,
        de: affiliateUrl,
        it: affiliateUrl,
        pt: affiliateUrl,
        ja: affiliateUrl,
        zh: affiliateUrl,
        ru: affiliateUrl,
      },
    };
    fs.writeFileSync(jsonPath, JSON.stringify(db, null, 2), 'utf8');
  }

  console.log(`FICHA_IMPORTADA: ${slug} (${Object.keys(locales).length} idiomas)`);
})();

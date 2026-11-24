/**
 * Sincroniza precio y disponibilidad de todos los productos en src/data/precios-stock.json
 * Uso: node scripts/sync-precios.cjs
 */
const fs = require('fs');

function extractOfferFromHtml(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of matches) {
    try {
      const data = JSON.parse(m[1].trim());
      const items = Array.isArray(data) ? data : data['@graph'] ? data['@graph'] : [data];
      const prod = items.find((x) => x['@type'] === 'Product' || (Array.isArray(x['@type']) && x['@type'].includes('Product')));
      if (prod?.offers) {
        const offer = Array.isArray(prod.offers) ? prod.offers[0] : prod.offers;
        return {
          price: parseFloat(offer.price || '0') || null,
          inStock: offer.availability ? !String(offer.availability).includes('OutOfStock') : null,
        };
      }
    } catch {}
  }
  return null;
}

(async () => {
  const dbPath = 'src/data/precios-stock.json';
  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  let updated = 0;

  for (const [slug, item] of Object.entries(db)) {
    if (!item.sourceUrl) continue;
    try {
      const clean = item.sourceUrl.split('?')[0].replace(/\/$/, '');
      let fresh = null;

      try {
        const sRes = await fetch(clean + '.json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
        if (sRes.ok) {
          const j = await sRes.json();
          const v = j.product?.variants?.[0];
          if (v) fresh = { price: parseFloat(v.price || '0') || null, inStock: v.available !== false };
        }
      } catch {}

      if (!fresh) {
        const res = await fetch(item.sourceUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
        const html = await res.text();
        fresh = extractOfferFromHtml(html);
      }

      if (fresh) {
        if (fresh.price !== null) item.price = fresh.price;
        if (fresh.inStock !== null) item.inStock = fresh.inStock;
        item.lastChecked = new Date().toISOString();
        updated++;
        console.log(`OK ${slug}: ${item.price} ${item.currency} | Stock: ${item.inStock}`);
      }
    } catch (err) {
      console.warn(`AVISO ${slug}: no se pudo consultar (${err.message})`);
    }
  }

  const serialized = JSON.stringify(db, null, 2);
  fs.writeFileSync(dbPath, serialized, 'utf8');
  fs.writeFileSync('public/data/precios-stock.json', serialized, 'utf8');
  console.log(`SINCRONIZACION_COMPLETADA (${updated} productos actualizados)`);
})();

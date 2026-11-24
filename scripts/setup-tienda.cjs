const fs = require('fs');
const path = require('path');

const files = {
  // 1. Esquema de colecciones (añade "figuras" sin tocar "leyendas" ni "historia")
  "src/content.config.ts": `import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const leyendas = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/leyendas' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    era: z.string(),
    location: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    readingTime: z.string(),
    isOriginal: z.boolean().optional().default(false),
    order: z.number(),
    summary: z.string(),
    featuredFigure: z.object({
      name: z.string(),
      meaning: z.string(),
      shopUrl: z.string(),
    }),
  }).passthrough(),
});

const historia = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/historia' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    era: z.string(),
    period: z.string(),
    location: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    readingTime: z.string(),
    order: z.number(),
    summary: z.string(),
    featuredFigure: z.object({
      name: z.string(),
      meaning: z.string(),
      shopUrl: z.string(),
    }),
  }).passthrough(),
});

const figuras = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/figuras' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    publishedAt: z.string(),
    featuredOrder: z.number().optional().default(100),
    paw: z.enum(['left', 'right', 'both']),
    color: z.enum(['tricolor', 'white', 'gold', 'yellow', 'green', 'blue', 'purple', 'pink', 'red', 'black']),
    material: z.enum(['ceramica', 'porcelana', 'resina', 'hariko', 'madera', 'metal']),
    sizeCategory: z.enum(['mini', 'pequeno', 'mediano', 'grande']),
    dimensions: z.string(),
    weight: z.string().optional().default(''),
    origin: z.string(),
    extras: z.array(z.enum(['estatico', 'solar', 'koban', 'japon', 'hucha'])).default([]),
    anatomy: z.object({
      kobanText: z.string().optional().default(''),
      bell: z.string().optional().default('Cascabel dorado'),
      bibColor: z.string().optional().default('Rojo tradicional'),
      accessory: z.string().optional().default(''),
    }),
    placementAdvice: z.string(),
    images: z.array(z.string()).min(1),
    summary: z.string(),
  }).passthrough(),
});

export const collections = { leyendas, historia, figuras };
`,

  // 2. Diccionario de interfaz de Tienda y Ficha en los 9 idiomas
  "src/i18n/tienda.ts": `import type { Lang } from './ui';

export const tiendaTranslations: Record<Lang, {
  seoTitle: string;
  seoDescription: string;
  badge: string;
  heading: string;
  subheading: string;
  backToConfigurator: string;
  backToCatalog: string;
  filtersTitle: string;
  clearAll: string;
  pawSection: string;
  paws: Record<'left' | 'right' | 'both', { title: string; desc: string }>;
  colorSection: string;
  colors: Record<'tricolor' | 'white' | 'gold' | 'yellow' | 'green' | 'blue' | 'purple' | 'pink' | 'red' | 'black', string>;
  priceSection: string;
  materialSection: string;
  materials: Record<'ceramica' | 'porcelana' | 'resina' | 'hariko' | 'madera' | 'metal', string>;
  sizeSection: string;
  sizes: Record<'mini' | 'pequeno' | 'mediano' | 'grande', { label: string; range: string }>;
  extrasSection: string;
  extras: Record<'estatico' | 'solar' | 'koban' | 'japon' | 'hucha', string>;
  dateSection: string;
  dates: Record<'all' | '7d' | '30d' | '90d', string>;
  catalogCount: string;
  sortBy: string;
  sorts: Record<'recientes' | 'antiguos' | 'precio_asc' | 'precio_desc' | 'relevancia', string>;
  emptyBadge: string;
  emptyTitle: string;
  emptyDefaultDesc: string;
  emptyFilteredDesc: string;
  emptyStatus: string;
  viewDetails: string;
  inStock: string;
  outOfStock: string;
  buyBtn: string;
  buyPendingBtn: string;
  affiliateNote: string;
  specsTitle: string;
  anatomyTitle: string;
  placementTitle: string;
  relatedTitle: string;
  specLabels: {
    paw: string;
    color: string;
    material: string;
    origin: string;
    dimensions: string;
    weight: string;
    koban: string;
    noKoban: string;
    bell: string;
    bib: string;
    accessory: string;
    updatedAt: string;
  };
}> = {
  es: {
    seoTitle: 'Figuras de Maneki-neko — Catálogo Tradicional | Manekineko.es',
    seoDescription: 'Filtra y explora figuras de Maneki-neko japonés por postura, color, material, tamaño y significado simbólico.',
    badge: '図鑑 • CATÁLOGO DE PIEZAS',
    heading: 'Figuras Tradicionales',
    subheading: 'Combina postura, esmalte, material y dimensiones para encontrar la pieza adecuada en nuestro archivo.',
    backToConfigurator: 'Volver al configurador simbólico',
    backToCatalog: 'Volver al catálogo de figuras',
    filtersTitle: 'Filtros',
    clearAll: 'Limpiar todo',
    pawSection: 'Posición de patas',
    paws: {
      left: { title: 'Pata izquierda', desc: 'Clientes y armonía' },
      right: { title: 'Pata derecha', desc: 'Dinero y prosperidad' },
      both: { title: 'Ambas patas', desc: 'Fortuna y protección' },
    },
    colorSection: 'Color',
    colors: {
      tricolor: 'Tricolor',
      white: 'Blanco',
      gold: 'Dorado',
      yellow: 'Amarillo',
      green: 'Verde',
      blue: 'Azul',
      purple: 'Morado',
      pink: 'Rosa',
      red: 'Rojo',
      black: 'Negro',
    },
    priceSection: 'Rango de Precio',
    materialSection: 'Material',
    materials: {
      ceramica: 'Cerámica tradicional (Tokoname / Imado)',
      porcelana: 'Porcelana esmaltada',
      resina: 'Resina / Poliresina',
      hariko: 'Papel maché artesanal (Hariko)',
      madera: 'Madera tallada / Kokeshi',
      metal: 'Metal / Latón fundido',
    },
    sizeSection: 'Tamaño',
    sizes: {
      mini: { label: 'Miniatura / Amuleto', range: '< 10 cm' },
      pequeno: { label: 'Pequeño (Escritorio)', range: '10 – 15 cm' },
      mediano: { label: 'Mediano (Hogar)', range: '16 – 25 cm' },
      grande: { label: 'Grande (Comercio)', range: '> 25 cm' },
    },
    extrasSection: 'Mecanismo y detalles',
    extras: {
      estatico: 'Figura rígida / estática',
      solar: 'Pata articulada (Solar / Pila)',
      koban: 'Con moneda Koban',
      japon: 'Fabricado en Japón',
      hucha: 'Con ranura hucha (Chokin-bako)',
    },
    dateSection: 'Fecha de publicación',
    dates: {
      all: 'Cualquier fecha',
      '7d': 'Últimos 7 días',
      '30d': 'Último mes (30 días)',
      '90d': 'Últimos 3 meses',
    },
    catalogCount: '{count} figuras encontradas',
    sortBy: 'Ordenar por:',
    sorts: {
      recientes: 'Fecha: más recientes',
      antiguos: 'Fecha: más antiguos',
      precio_asc: 'Precio: menor a mayor',
      precio_desc: 'Precio: mayor a menor',
      relevancia: 'Relevancia tradicional',
    },
    emptyBadge: '準備中 • SIN RESULTADOS',
    emptyTitle: 'No hay figuras que coincidan con estos filtros',
    emptyDefaultDesc: 'Estamos catalogando nuestra selección de figuras japonesas. Muy pronto verás aquí cada pieza con sus medidas, material y enlace.',
    emptyFilteredDesc: 'Aún no tenemos publicada una pieza con la combinación «{summary}». Prueba a limpiar algún filtro para ver otras figuras disponibles.',
    emptyStatus: 'Archivo vivo — Nuevas piezas añadidas periódicamente',
    viewDetails: 'Ver ficha completa',
    inStock: 'Disponible en tienda asociada',
    outOfStock: 'Agotado temporalmente',
    buyBtn: 'Ver precio y comprar en tienda',
    buyPendingBtn: 'Enlace de tienda en preparación',
    affiliateNote: 'Enlace de afiliado: el precio y la disponibilidad se sincronizan con la tienda oficial.',
    specsTitle: 'Ficha técnica y artesanal',
    anatomyTitle: 'Rasgos iconográficos',
    placementTitle: 'Dónde colocar esta figura',
    relatedTitle: 'Otras figuras relacionadas',
    specLabels: {
      paw: 'Pata alzada',
      color: 'Color del manto',
      material: 'Material',
      origin: 'Origen / Tradición',
      dimensions: 'Dimensiones',
      weight: 'Peso aproximado',
      koban: 'Moneda Koban',
      noKoban: 'Sin moneda (tradición pura)',
      bell: 'Cascabel',
      bib: 'Babero (Yodarekake)',
      accessory: 'Atributo adicional',
      updatedAt: 'Actualizado',
    },
  },
  en: {
    seoTitle: 'Maneki-neko Figurines — Traditional Catalog | Manekineko.es',
    seoDescription: 'Filter and explore Japanese Maneki-neko figurines by paw posture, coat color, material, size, and symbolic meaning.',
    badge: '図鑑 • FIGURINE CATALOG',
    heading: 'Traditional Figurines',
    subheading: 'Combine paw posture, glaze color, material, and dimensions to find the right piece in our archive.',
    backToConfigurator: 'Back to symbolic configurator',
    backToCatalog: 'Back to figurine catalog',
    filtersTitle: 'Filters',
    clearAll: 'Clear all',
    pawSection: 'Paw Position',
    paws: {
      left: { title: 'Left paw', desc: 'Customers & harmony' },
      right: { title: 'Right paw', desc: 'Wealth & prosperity' },
      both: { title: 'Both paws', desc: 'Fortune & protection' },
    },
    colorSection: 'Color',
    colors: {
      tricolor: 'Tricolor',
      white: 'White',
      gold: 'Gold',
      yellow: 'Yellow',
      green: 'Green',
      blue: 'Blue',
      purple: 'Purple',
      pink: 'Pink',
      red: 'Red',
      black: 'Black',
    },
    priceSection: 'Price Range',
    materialSection: 'Material',
    materials: {
      ceramica: 'Traditional ceramic (Tokoname / Imado)',
      porcelana: 'Glazed porcelain',
      resina: 'Resin / Polyresin',
      hariko: 'Handcrafted papier-mâché (Hariko)',
      madera: 'Carved wood / Kokeshi',
      metal: 'Cast metal / Brass',
    },
    sizeSection: 'Size',
    sizes: {
      mini: { label: 'Miniature / Charm', range: '< 10 cm' },
      pequeno: { label: 'Small (Desk)', range: '10 – 15 cm' },
      mediano: { label: 'Medium (Home)', range: '16 – 25 cm' },
      grande: { label: 'Large (Shopfront)', range: '> 25 cm' },
    },
    extrasSection: 'Mechanism & Details',
    extras: {
      estatico: 'Static / solid figurine',
      solar: 'Waving paw (Solar / Battery)',
      koban: 'With Koban gold coin',
      japon: 'Made in Japan',
      hucha: 'Coin bank slot (Chokin-bako)',
    },
    dateSection: 'Publication Date',
    dates: {
      all: 'Any date',
      '7d': 'Last 7 days',
      '30d': 'Last 30 days',
      '90d': 'Last 3 months',
    },
    catalogCount: '{count} figurines found',
    sortBy: 'Sort by:',
    sorts: {
      recientes: 'Date: newest first',
      antiguos: 'Date: oldest first',
      precio_asc: 'Price: low to high',
      precio_desc: 'Price: high to low',
      relevancia: 'Traditional relevance',
    },
    emptyBadge: '準備中 • NO MATCHES',
    emptyTitle: 'No figurines match these filters',
    emptyDefaultDesc: 'We are cataloging our curated selection of Japanese figurines. Each piece will appear here with full specs and store links.',
    emptyFilteredDesc: 'We have not published a piece matching “{summary}” yet. Try clearing a filter to explore other available figurines.',
    emptyStatus: 'Living archive — New pieces added regularly',
    viewDetails: 'View full sheet',
    inStock: 'Available at partner store',
    outOfStock: 'Temporarily out of stock',
    buyBtn: 'Check price & buy at store',
    buyPendingBtn: 'Store link coming soon',
    affiliateNote: 'Affiliate link: price and availability are synchronized with the partner store.',
    specsTitle: 'Artisanal & Technical Specs',
    anatomyTitle: 'Iconographic Features',
    placementTitle: 'Where to Place This Figurine',
    relatedTitle: 'Related Figurines',
    specLabels: {
      paw: 'Raised paw',
      color: 'Coat color',
      material: 'Material',
      origin: 'Origin / Tradition',
      dimensions: 'Dimensions',
      weight: 'Approx. weight',
      koban: 'Koban coin',
      noKoban: 'No coin (pure tradition)',
      bell: 'Bell',
      bib: 'Bib (Yodarekake)',
      accessory: 'Additional attribute',
      updatedAt: 'Updated',
    },
  },
  fr: {
    seoTitle: 'Figurines Maneki-neko — Catalogue Traditionnel | Manekineko.es',
    seoDescription: 'Filtrez et explorez les figurines japonaises Maneki-neko par posture, couleur, matériau, taille et symbolique.',
    badge: '図鑑 • CATALOGUE DES PIÈCES',
    heading: 'Figurines Traditionnelles',
    subheading: 'Combinez posture, émail, matériau et dimensions pour trouver la pièce idéale dans nos archives.',
    backToConfigurator: 'Retour au configurateur symbolique',
    backToCatalog: 'Retour au catalogue des figurines',
    filtersTitle: 'Filtres',
    clearAll: 'Tout effacer',
    pawSection: 'Position des pattes',
    paws: {
      left: { title: 'Patte gauche', desc: 'Clients et harmonie' },
      right: { title: 'Patte droite', desc: 'Argent et prospérité' },
      both: { title: 'Deux pattes', desc: 'Fortune et protection' },
    },
    colorSection: 'Couleur',
    colors: {
      tricolor: 'Tricolore',
      white: 'Blanc',
      gold: 'Doré',
      yellow: 'Jaune',
      green: 'Vert',
      blue: 'Bleu',
      purple: 'Violet',
      pink: 'Rose',
      red: 'Rouge',
      black: 'Noir',
    },
    priceSection: 'Fourchette de prix',
    materialSection: 'Matériau',
    materials: {
      ceramica: 'Céramique traditionnelle (Tokoname / Imado)',
      porcelana: 'Porcelaine émaillée',
      resina: 'Résine / Polyrésine',
      hariko: 'Papier mâché artisanal (Hariko)',
      madera: 'Bois sculpté / Kokeshi',
      metal: 'Métal / Laiton fondu',
    },
    sizeSection: 'Taille',
    sizes: {
      mini: { label: 'Miniature / Amulette', range: '< 10 cm' },
      pequeno: { label: 'Petit (Bureau)', range: '10 – 15 cm' },
      mediano: { label: 'Moyen (Maison)', range: '16 – 25 cm' },
      grande: { label: 'Grand (Commerce)', range: '> 25 cm' },
    },
    extrasSection: 'Mécanisme et détails',
    extras: {
      estatico: 'Figurine fixe / statique',
      solar: 'Patte mobile (Solaire / Pile)',
      koban: 'Avec pièce Koban',
      japon: 'Fabriqué au Japon',
      hucha: 'Tirelire (Chokin-bako)',
    },
    dateSection: 'Date de publication',
    dates: {
      all: 'Toutes les dates',
      '7d': '7 derniers jours',
      '30d': '30 derniers jours',
      '90d': '3 derniers mois',
    },
    catalogCount: '{count} figurines trouvées',
    sortBy: 'Trier par :',
    sorts: {
      recientes: 'Date : plus récentes',
      antiguos: 'Date : plus anciennes',
      precio_asc: 'Prix : croissant',
      precio_desc: 'Prix : décroissant',
      relevancia: 'Pertinence traditionnelle',
    },
    emptyBadge: '準備中 • AUCUN RÉSULTAT',
    emptyTitle: 'Aucune figurine ne correspond à ces filtres',
    emptyDefaultDesc: 'Nous cataloguons notre sélection de figurines japonaises. Chaque pièce apparaîtra ici avec ses caractéristiques.',
    emptyFilteredDesc: 'Aucune pièce publiée ne correspond encore à « {summary} ». Essayez de retirer un filtre.',
    emptyStatus: 'Archive vivante — Nouvelles pièces ajoutées régulièrement',
    viewDetails: 'Voir la fiche complète',
    inStock: 'Disponible chez le marchand',
    outOfStock: 'Temporairement épuisé',
    buyBtn: 'Voir le prix et acheter',
    buyPendingBtn: 'Lien marchand en préparation',
    affiliateNote: 'Lien affilié : le prix et la disponibilité sont synchronisés avec la boutique.',
    specsTitle: 'Fiche technique et artisanale',
    anatomyTitle: 'Traits iconographiques',
    placementTitle: 'Où placer cette figurine',
    relatedTitle: 'Autres figurines associées',
    specLabels: {
      paw: 'Patte levée',
      color: 'Couleur du pelage',
      material: 'Matériau',
      origin: 'Origine / Tradition',
      dimensions: 'Dimensions',
      weight: 'Poids approximatif',
      koban: 'Pièce Koban',
      noKoban: 'Sans pièce (tradition pure)',
      bell: 'Grelot',
      bib: 'Bavoir (Yodarekake)',
      accessory: 'Attribut supplémentaire',
      updatedAt: 'Mis à jour',
    },
  },
  de: {
    seoTitle: 'Maneki-neko Figuren — Traditioneller Katalog | Manekineko.es',
    seoDescription: 'Filtern und entdecken Sie japanische Maneki-neko-Figuren nach Pfotenhaltung, Farbe, Material, Größe und Symbolik.',
    badge: '図鑑 • FIGURENKATALOG',
    heading: 'Traditionelle Figuren',
    subheading: 'Kombinieren Sie Pfotenhaltung, Glasur, Material und Maße, um das passende Stück zu finden.',
    backToConfigurator: 'Zurück zum Symbol-Konfigurator',
    backToCatalog: 'Zurück zum Figurenkatalog',
    filtersTitle: 'Filter',
    clearAll: 'Alle löschen',
    pawSection: 'Pfotenposition',
    paws: {
      left: { title: 'Linke Pfote', desc: 'Kunden & Harmonie' },
      right: { title: 'Rechte Pfote', desc: 'Geld & Wohlstand' },
      both: { title: 'Beide Pfoten', desc: 'Glück & Schutz' },
    },
    colorSection: 'Farbe',
    colors: {
      tricolor: 'Dreifarbig',
      white: 'Weiß',
      gold: 'Gold',
      yellow: 'Gelb',
      green: 'Grün',
      blue: 'Blau',
      purple: 'Violett',
      pink: 'Rosa',
      red: 'Rot',
      black: 'Schwarz',
    },
    priceSection: 'Preisspanne',
    materialSection: 'Material',
    materials: {
      ceramica: 'Traditionelle Keramik (Tokoname / Imado)',
      porcelana: 'Glasierte Porzellanfigur',
      resina: 'Kunstharz / Polyresin',
      hariko: 'Handgefertigtes Pappmaché (Hariko)',
      madera: 'Geschnitztes Holz / Kokeshi',
      metal: 'Gussmetall / Messing',
    },
    sizeSection: 'Größe',
    sizes: {
      mini: { label: 'Miniatur / Amulett', range: '< 10 cm' },
      pequeno: { label: 'Klein (Schreibtisch)', range: '10 – 15 cm' },
      mediano: { label: 'Mittel (Zuhause)', range: '16 – 25 cm' },
      grande: { label: 'Groß (Geschäft)', range: '> 25 cm' },
    },
    extrasSection: 'Mechanismus & Details',
    extras: {
      estatico: 'Statische / feste Figur',
      solar: 'Winkende Pfote (Solar / Batterie)',
      koban: 'Mit Koban-Goldmünze',
      japon: 'Hergestellt in Japan',
      hucha: 'Spardose (Chokin-bako)',
    },
    dateSection: 'Veröffentlichungsdatum',
    dates: {
      all: 'Beliebiges Datum',
      '7d': 'Letzte 7 Tage',
      '30d': 'Letzte 30 Tage',
      '90d': 'Letzte 3 Monate',
    },
    catalogCount: '{count} Figuren gefunden',
    sortBy: 'Sortieren nach:',
    sorts: {
      recientes: 'Datum: neueste zuerst',
      antiguos: 'Datum: älteste zuerst',
      precio_asc: 'Preis: aufsteigend',
      precio_desc: 'Preis: absteigend',
      relevancia: 'Traditionelle Relevanz',
    },
    emptyBadge: '準備中 • KEINE TREFFER',
    emptyTitle: 'Keine Figuren entsprechen diesen Filtern',
    emptyDefaultDesc: 'Wir katalogisieren derzeit unsere Auswahl japanischer Figuren.',
    emptyFilteredDesc: 'Für „{summary}“ wurde noch keine Figur veröffentlicht. Entfernen Sie einen Filter, um weitere Stücke zu sehen.',
    emptyStatus: 'Lebendiges Archiv — Regelmäßig neue Stücke',
    viewDetails: 'Details ansehen',
    inStock: 'Im Partnershop verfügbar',
    outOfStock: 'Vorübergehend vergriffen',
    buyBtn: 'Preis prüfen & kaufen',
    buyPendingBtn: 'Shop-Link in Vorbereitung',
    affiliateNote: 'Affiliate-Link: Preis und Verfügbarkeit werden mit dem Partnershop synchronisiert.',
    specsTitle: 'Technische & handwerkliche Daten',
    anatomyTitle: 'Ikonografische Merkmale',
    placementTitle: 'Aufstellungsempfehlung',
    relatedTitle: 'Ähnliche Figuren',
    specLabels: {
      paw: 'Erhobene Pfote',
      color: 'Fellfarbe',
      material: 'Material',
      origin: 'Herkunft / Tradition',
      dimensions: 'Maße',
      weight: 'Ungefähres Gewicht',
      koban: 'Koban-Münze',
      noKoban: 'Ohne Münze (reine Tradition)',
      bell: 'Glöckchen',
      bib: 'Lätzchen (Yodarekake)',
      accessory: 'Zusätzliches Attribut',
      updatedAt: 'Aktualisiert',
    },
  },
  it: {
    seoTitle: 'Statuine Maneki-neko — Catalogo Tradizionale | Manekineko.es',
    seoDescription: 'Filtra ed esplora le statuine giapponesi Maneki-neko per postura, colore, materiale, dimensioni e simbolismo.',
    badge: '図鑑 • CATALOGO DEI PEZZI',
    heading: 'Statuine Tradizionali',
    subheading: 'Combina postura, smalto, materiale e dimensioni per trovare il pezzo adatto nel nostro archivio.',
    backToConfigurator: 'Torna al configuratore simbolico',
    backToCatalog: 'Torna al catalogo delle statuine',
    filtersTitle: 'Filtri',
    clearAll: 'Cancella tutto',
    pawSection: 'Posizione delle zampe',
    paws: {
      left: { title: 'Zampa sinistra', desc: 'Clienti e armonia' },
      right: { title: 'Zampa destra', desc: 'Denaro e prosperità' },
      both: { title: 'Entrambe le zampe', desc: 'Fortuna e protezione' },
    },
    colorSection: 'Colore',
    colors: {
      tricolor: 'Tricolore',
      white: 'Bianco',
      gold: 'Dorato',
      yellow: 'Giallo',
      green: 'Verde',
      blue: 'Blu',
      purple: 'Viola',
      pink: 'Rosa',
      red: 'Rosso',
      black: 'Nero',
    },
    priceSection: 'Fascia di prezzo',
    materialSection: 'Materiale',
    materials: {
      ceramica: 'Ceramica tradizionale (Tokoname / Imado)',
      porcelana: 'Porcellana smaltata',
      resina: 'Resina / Poliresina',
      hariko: 'Cartapesta artigianale (Hariko)',
      madera: 'Legno intagliato / Kokeshi',
      metal: 'Metallo / Ottone fuso',
    },
    sizeSection: 'Dimensione',
    sizes: {
      mini: { label: 'Miniatura / Amuleto', range: '< 10 cm' },
      pequeno: { label: 'Piccolo (Scrivania)', range: '10 – 15 cm' },
      mediano: { label: 'Medio (Casa)', range: '16 – 25 cm' },
      grande: { label: 'Grande (Negozio)', range: '> 25 cm' },
    },
    extrasSection: 'Meccanismo e dettagli',
    extras: {
      estatico: 'Statuina fissa / statica',
      solar: 'Zampa mobile (Solare / Batteria)',
      koban: 'Con moneta Koban',
      japon: 'Prodotto in Giappone',
      hucha: 'Salvadanaio (Chokin-bako)',
    },
    dateSection: 'Data di pubblicazione',
    dates: {
      all: 'Qualsiasi data',
      '7d': 'Ultimi 7 giorni',
      '30d': 'Ultimi 30 giorni',
      '90d': 'Ultimi 3 mesi',
    },
    catalogCount: '{count} statuine trovate',
    sortBy: 'Ordina per:',
    sorts: {
      recientes: 'Data: più recenti',
      antiguos: 'Data: più vecchie',
      precio_asc: 'Prezzo: crescente',
      precio_desc: 'Prezzo: decrescente',
      relevancia: 'Rilevanza tradizionale',
    },
    emptyBadge: '準備中 • NESSUN RISULTATO',
    emptyTitle: 'Nessuna statuina corrisponde a questi filtri',
    emptyDefaultDesc: 'Stiamo catalogando la nostra selezione di statuine giapponesi.',
    emptyFilteredDesc: 'Non abbiamo ancora pubblicato un pezzo per «{summary}». Prova a rimuovere un filtro.',
    emptyStatus: 'Archivio attivo — Nuovi pezzi aggiunti regolarmente',
    viewDetails: 'Vedi scheda completa',
    inStock: 'Disponibile nel negozio partner',
    outOfStock: 'Temporaneamente esaurito',
    buyBtn: 'Vedi prezzo e acquista',
    buyPendingBtn: 'Link negozio in preparazione',
    affiliateNote: 'Link affiliato: prezzo e disponibilità sono sincronizzati con il negozio.',
    specsTitle: 'Scheda tecnica e artigianale',
    anatomyTitle: 'Tratti iconografici',
    placementTitle: 'Dove collocare questa statuina',
    relatedTitle: 'Altre statuine correlate',
    specLabels: {
      paw: 'Zampa alzata',
      color: 'Colore del mantello',
      material: 'Materiale',
      origin: 'Origine / Tradizione',
      dimensions: 'Dimensioni',
      weight: 'Peso approssimativo',
      koban: 'Moneta Koban',
      noKoban: 'Senza moneta (tradizione pura)',
      bell: 'Campanellino',
      bib: 'Bavaglino (Yodarekake)',
      accessory: 'Attributo aggiuntivo',
      updatedAt: 'Aggiornato',
    },
  },
  pt: {
    seoTitle: 'Figuras de Maneki-neko — Catálogo Tradicional | Manekineko.es',
    seoDescription: 'Filtre e explore figuras japonesas de Maneki-neko por postura, cor, material, tamanho e simbolismo.',
    badge: '図鑑 • CATÁLOGO DE PEÇAS',
    heading: 'Figuras Tradicionais',
    subheading: 'Combine postura, esmalte, material e dimensões para encontrar a peça ideal em nosso arquivo.',
    backToConfigurator: 'Voltar ao configurador simbólico',
    backToCatalog: 'Voltar ao catálogo de figuras',
    filtersTitle: 'Filtros',
    clearAll: 'Limpar tudo',
    pawSection: 'Posição das patas',
    paws: {
      left: { title: 'Pata esquerda', desc: 'Clientes e harmonia' },
      right: { title: 'Pata direita', desc: 'Dinheiro e prosperidade' },
      both: { title: 'Ambas as patas', desc: 'Fortuna e proteção' },
    },
    colorSection: 'Cor',
    colors: {
      tricolor: 'Tricolor',
      white: 'Branco',
      gold: 'Dourado',
      yellow: 'Amarelo',
      green: 'Verde',
      blue: 'Azul',
      purple: 'Roxo',
      pink: 'Rosa',
      red: 'Vermelho',
      black: 'Preto',
    },
    priceSection: 'Faixa de Preço',
    materialSection: 'Material',
    materials: {
      ceramica: 'Cerâmica tradicional (Tokoname / Imado)',
      porcelana: 'Porcelana esmaltada',
      resina: 'Resina / Poliresina',
      hariko: 'Papel machê artesanal (Hariko)',
      madera: 'Madeira esculpida / Kokeshi',
      metal: 'Metal / Latão fundido',
    },
    sizeSection: 'Tamanho',
    sizes: {
      mini: { label: 'Miniatura / Amuleto', range: '< 10 cm' },
      pequeno: { label: 'Pequeno (Mesa)', range: '10 – 15 cm' },
      mediano: { label: 'Médio (Lar)', range: '16 – 25 cm' },
      grande: { label: 'Grande (Comércio)', range: '> 25 cm' },
    },
    extrasSection: 'Mecanismo e detalhes',
    extras: {
      estatico: 'Figura rígida / estática',
      solar: 'Pata articulada (Solar / Pilha)',
      koban: 'Com moeda Koban',
      japon: 'Fabricado no Japão',
      hucha: 'Função cofrinho (Chokin-bako)',
    },
    dateSection: 'Data de publicação',
    dates: {
      all: 'Qualquer data',
      '7d': 'Últimos 7 dias',
      '30d': 'Últimos 30 dias',
      '90d': 'Últimos 3 meses',
    },
    catalogCount: '{count} figuras encontradas',
    sortBy: 'Ordenar por:',
    sorts: {
      recientes: 'Data: mais recentes',
      antiguos: 'Data: mais antigas',
      precio_asc: 'Preço: menor para maior',
      precio_desc: 'Preço: maior para menor',
      relevancia: 'Relevância tradicional',
    },
    emptyBadge: '準備中 • SEM RESULTADOS',
    emptyTitle: 'Nenhuma figura corresponde a estes filtros',
    emptyDefaultDesc: 'Estamos catalogando nossa seleção de figuras japonesas.',
    emptyFilteredDesc: 'Ainda não publicamos uma peça com «{summary}». Limpe algum filtro para ver outras opções.',
    emptyStatus: 'Arquivo ativo — Novas peças adicionadas regularmente',
    viewDetails: 'Ver ficha completa',
    inStock: 'Disponível na loja parceira',
    outOfStock: 'Esgotado temporariamente',
    buyBtn: 'Ver preço e comprar na loja',
    buyPendingBtn: 'Link da loja em preparação',
    affiliateNote: 'Link de afiliado: preço e disponibilidade sincronizados com a loja.',
    specsTitle: 'Ficha técnica e artesanal',
    anatomyTitle: 'Traços iconográficos',
    placementTitle: 'Onde colocar esta figura',
    relatedTitle: 'Outras figuras relacionadas',
    specLabels: {
      paw: 'Pata erguida',
      color: 'Cor da pelagem',
      material: 'Material',
      origin: 'Origem / Tradição',
      dimensions: 'Dimensões',
      weight: 'Peso aproximado',
      koban: 'Moeda Koban',
      noKoban: 'Sem moeda (tradição pura)',
      bell: 'Guizo',
      bib: 'Babador (Yodarekake)',
      accessory: 'Atributo adicional',
      updatedAt: 'Atualizado',
    },
  },
  ja: {
    seoTitle: '招き猫図鑑 — 伝統工芸カタログ | Manekineko.es',
    seoDescription: '上げる手、色、素材、サイズ、象徴するご利益から日本の招き猫を検索できます。',
    badge: '図鑑 • 招き猫カタログ',
    heading: '伝統の招き猫一覧',
    subheading: '上げる手・色彩・素材・サイズを組み合わせて、お好みの招き猫をお探しいただけます。',
    backToConfigurator: '象徴シミュレーターへ戻る',
    backToCatalog: '招き猫一覧へ戻る',
    filtersTitle: '絞り込み',
    clearAll: 'すべて解除',
    pawSection: '上げる手',
    paws: {
      left: { title: '左手上げ', desc: '千客万来・良縁' },
      right: { title: '右手上げ', desc: '金運招福・繁栄' },
      both: { title: '両手上げ', desc: '開運・大願成就' },
    },
    colorSection: '色',
    colors: {
      tricolor: '三毛',
      white: '白',
      gold: '金',
      yellow: '黄',
      green: '緑',
      blue: '青',
      purple: '紫',
      pink: 'ピンク',
      red: '赤',
      black: '黒',
    },
    priceSection: '価格帯',
    materialSection: '素材',
    materials: {
      ceramica: '伝統陶器（常滑焼・今戸焼）',
      porcelana: '磁器・九谷焼',
      resina: '樹脂・ポリレジン',
      hariko: '伝統張り子',
      madera: '木彫り・こけし',
      metal: '金属・真鍮',
    },
    sizeSection: 'サイズ',
    sizes: {
      mini: { label: '豆サイズ・お守り', range: '10cm未満' },
      pequeno: { label: '小（デスク用）', range: '10 – 15cm' },
      mediano: { label: '中（家庭用）', range: '16 – 25cm' },
      grande: { label: '大（店舗用）', range: '25cm超' },
    },
    extrasSection: '仕様・特徴',
    extras: {
      estatico: '置物（固定タイプ）',
      solar: '手招き可動（ソーラー・電池）',
      koban: '小判持ち',
      japon: '日本製',
      hucha: '貯金箱仕様',
    },
    dateSection: '掲載日',
    dates: {
      all: 'すべて',
      '7d': '過去7日間',
      '30d': '過去30日間',
      '90d': '過去3ヶ月',
    },
    catalogCount: '{count} 件の招き猫',
    sortBy: '並び替え:',
    sorts: {
      recientes: '新着順',
      antiguos: '古い順',
      precio_asc: '価格の安い順',
      precio_desc: '価格の高い順',
      relevancia: '伝統おすすめ順',
    },
    emptyBadge: '準備中 • 該当なし',
    emptyTitle: '条件に一致する招き猫が見つかりません',
    emptyDefaultDesc: '現在、日本の伝統的な招き猫を順次登録しています。',
    emptyFilteredDesc: '「{summary}」に一致する招き猫はまだ掲載されていません。条件を解除してお試しください。',
    emptyStatus: 'アーカイブ更新中 — 新しい招き猫を順次追加',
    viewDetails: '詳細を見る',
    inStock: '提携ショップにて在庫あり',
    outOfStock: '一時在庫切れ',
    buyBtn: 'ショップで価格・詳細を見る',
    buyPendingBtn: 'ショップリンク準備中',
    affiliateNote: 'アフィリエイトリンク：価格と在庫状況は提携ショップと連動しています。',
    specsTitle: '工芸・製品仕様',
    anatomyTitle: '意匠の特徴',
    placementTitle: 'おすすめの飾り場所',
    relatedTitle: '関連する招き猫',
    specLabels: {
      paw: '上げる手',
      color: '毛色',
      material: '素材',
      origin: '産地・伝統',
      dimensions: 'サイズ',
      weight: '重量（目安）',
      koban: '小判',
      noKoban: '小判なし（純粋な招福）',
      bell: '鈴',
      bib: '前掛け',
      accessory: '持ち物・装飾',
      updatedAt: '更新日',
    },
  },
  zh: {
    seoTitle: '招财猫图鉴 — 传统工艺目录 | Manekineko.es',
    seoDescription: '按举爪姿势、颜色、材质、尺寸和象征寓意筛选和探索日本传统招财猫。',
    badge: '図鑑 • 招财猫图鉴',
    heading: '传统招财猫系列',
    subheading: '自由组合举爪姿势、釉色、材质与尺寸，在档案中寻找最契合的招财猫。',
    backToConfigurator: '返回寓意配置器',
    backToCatalog: '返回招财猫图鉴',
    filtersTitle: '筛选条件',
    clearAll: '清除全部',
    pawSection: '举爪姿势',
    paws: {
      left: { title: '举左爪', desc: '招客与人缘' },
      right: { title: '举右爪', desc: '招财与兴旺' },
      both: { title: '举双爪', desc: '福禄与守护' },
    },
    colorSection: '颜色',
    colors: {
      tricolor: '三花色',
      white: '白色',
      gold: '金色',
      yellow: '黄色',
      green: '绿色',
      blue: '蓝色',
      purple: '紫色',
      pink: '粉色',
      red: '红色',
      black: '黑色',
    },
    priceSection: '价格区间',
    materialSection: '材质',
    materials: {
      ceramica: '传统陶器（常滑烧 / 今户烧）',
      porcelana: '釉彩瓷器',
      resina: '树脂 / 宝丽石',
      hariko: '手工纸塑（张子 Hariko）',
      madera: '木雕 / 木芥子',
      metal: '金属 / 铸铜',
    },
    sizeSection: '尺寸',
    sizes: {
      mini: { label: '迷你 / 护身符', range: '< 10 cm' },
      pequeno: { label: '小号（桌面）', range: '10 – 15 cm' },
      mediano: { label: '中号（居家）', range: '16 – 25 cm' },
      grande: { label: '大号（商铺）', range: '> 25 cm' },
    },
    extrasSection: '功能与细节',
    extras: {
      estatico: '静态摆件',
      solar: '摇手款（太阳能 / 电池）',
      koban: '手持小判金币',
      japon: '日本制造',
      hucha: '存钱罐功能',
    },
    dateSection: '发布时间',
    dates: {
      all: '全部时间',
      '7d': '最近 7 天',
      '30d': '最近 30 天',
      '90d': '最近 3 个月',
    },
    catalogCount: '共找到 {count} 款招财猫',
    sortBy: '排序方式：',
    sorts: {
      recientes: '时间：最新发布',
      antiguos: '时间：最早发布',
      precio_asc: '价格：从低到高',
      precio_desc: '价格：从高到低',
      relevancia: '传统推荐度',
    },
    emptyBadge: '準備中 • 暂无匹配',
    emptyTitle: '暂无符合当前筛选条件的招财猫',
    emptyDefaultDesc: '我们正在整理收录日本传统招财猫档案，敬请期待。',
    emptyFilteredDesc: '暂未收录符合“{summary}”的款式，请尝试清除部分筛选条件。',
    emptyStatus: '档案持续更新中 — 定期收录新品',
    viewDetails: '查看完整档案',
    inStock: '合作店铺有货',
    outOfStock: '暂时缺货',
    buyBtn: '前往店铺查看价格与购买',
    buyPendingBtn: '购买链接准备中',
    affiliateNote: '联盟推广链接：价格与库存状态与合作店铺保持同步。',
    specsTitle: '工艺与规格参数',
    anatomyTitle: '图腾与配饰特征',
    placementTitle: '摆放风水与位置建议',
    relatedTitle: '相关招财猫推荐',
    specLabels: {
      paw: '举爪方向',
      color: '毛色',
      material: '材质',
      origin: '产地 / 传统',
      dimensions: '尺寸',
      weight: '约重',
      koban: '小判金币',
      noKoban: '无金币（纯粹招福传统）',
      bell: '铃铛',
      bib: '围兜',
      accessory: '附加法器',
      updatedAt: '更新时间',
    },
  },
  ru: {
    seoTitle: 'Фигурки Манэки-нэко — Традиционный каталог | Manekineko.es',
    seoDescription: 'Фильтруйте и изучайте японские фигурки Манэки-нэко по положению лапы, цвету, материалу, размеру и символике.',
    badge: '図鑑 • КАТАЛОГ ФИГУРОК',
    heading: 'Традиционные фигурки',
    subheading: 'Комбинируйте положение лапы, цвет глазури, материал и размеры, чтобы найти подходящую фигурку.',
    backToConfigurator: 'Вернуться к конфигуратору',
    backToCatalog: 'Вернуться в каталог фигурок',
    filtersTitle: 'Фильтры',
    clearAll: 'Сбросить всё',
    pawSection: 'Положение лап',
    paws: {
      left: { title: 'Левая лапа', desc: 'Клиенты и гармония' },
      right: { title: 'Правая лапа', desc: 'Деньги и процветание' },
      both: { title: 'Обе лапы', desc: 'Удача и защита' },
    },
    colorSection: 'Цвет',
    colors: {
      tricolor: 'Трёхцветный',
      white: 'Белый',
      gold: 'Золотой',
      yellow: 'Жёлтый',
      green: 'Зелёный',
      blue: 'Синий',
      purple: 'Фиолетовый',
      pink: 'Розовый',
      red: 'Красный',
      black: 'Чёрный',
    },
    priceSection: 'Диапазон цен',
    materialSection: 'Материал',
    materials: {
      ceramica: 'Традиционная керамика (Токонаме / Имадо)',
      porcelana: 'Глазурованный фарфор',
      resina: 'Смола / Полистоун',
      hariko: 'Папье-маше ручной работы (Харико)',
      madera: 'Резное дерево / Кокэси',
      metal: 'Металл / Литая латунь',
    },
    sizeSection: 'Размер',
    sizes: {
      mini: { label: 'Миниатюра / Амулет', range: '< 10 см' },
      pequeno: { label: 'Малый (Настольный)', range: '10 – 15 см' },
      mediano: { label: 'Средний (Для дома)', range: '16 – 25 см' },
      grande: { label: 'Большой (Для магазина)', range: '> 25 см' },
    },
    extrasSection: 'Механизм и детали',
    extras: {
      estatico: 'Статичная фигурка',
      solar: 'Машущая лапа (Солнечная / Батарейка)',
      koban: 'С монетой Кобан',
      japon: 'Сделано в Японии',
      hucha: 'Копилка (Тёкин-бако)',
    },
    dateSection: 'Дата публикации',
    dates: {
      all: 'Любая дата',
      '7d': 'За 7 дней',
      '30d': 'За 30 дней',
      '90d': 'За 3 месяца',
    },
    catalogCount: 'Найдено фигурок: {count}',
    sortBy: 'Сортировка:',
    sorts: {
      recientes: 'Дата: сначала новые',
      antiguos: 'Дата: сначала старые',
      precio_asc: 'Цена: по возрастанию',
      precio_desc: 'Цена: по убыванию',
      relevancia: 'Традиционная значимость',
    },
    emptyBadge: '準備中 • НЕТ СОВПАДЕНИЙ',
    emptyTitle: 'Нет фигурок по выбранным фильтрам',
    emptyDefaultDesc: 'Мы каталогизируем подборку японских фигурок Манэки-нэко.',
    emptyFilteredDesc: 'Пока нет опубликованных фигурок по запросу «{summary}». Попробуйте сбросить часть фильтров.',
    emptyStatus: 'Живой архив — Новые фигурки добавляются регулярно',
    viewDetails: 'Подробнее о фигурке',
    inStock: 'В наличии в магазине-партнёре',
    outOfStock: 'Временно нет в наличии',
    buyBtn: 'Узнать цену и купить',
    buyPendingBtn: 'Ссылка готовится',
    affiliateNote: 'Партнёрская ссылка: цена и наличие синхронизируются с магазином.',
    specsTitle: 'Технические и ремесленные данные',
    anatomyTitle: 'Иконографические черты',
    placementTitle: 'Где разместить фигурку',
    relatedTitle: 'Похожие фигурки',
    specLabels: {
      paw: 'Поднятая лапа',
      color: 'Окрас',
      material: 'Материал',
      origin: 'Происхождение / Традиция',
      dimensions: 'Размеры',
      weight: 'Примерный вес',
      koban: 'Монета Кобан',
      noKoban: 'Без монеты (чистая традиция)',
      bell: 'Колокольчик',
      bib: 'Нагрудник (Ёдарэкакэ)',
      accessory: 'Дополнительный атрибут',
      updatedAt: 'Обновлено',
    },
  },
};
`,

  // 3. Base de datos viva de precios, stock y enlaces de referido
  "src/data/precios-stock.json": `{
  "gotokuji-blanco-15cm": {
    "sourceUrl": "",
    "program": "Pendiente de afiliación (Amazon / Etsy)",
    "price": 38.0,
    "currency": "EUR",
    "inStock": true,
    "lastChecked": "2026-11-24T04:30:00Z",
    "affiliateLinks": {
      "default": "#pendiente-afiliado",
      "es": "#pendiente-afiliado",
      "en": "#pendiente-afiliado",
      "fr": "#pendiente-afiliado",
      "de": "#pendiente-afiliado",
      "it": "#pendiente-afiliado",
      "pt": "#pendiente-afiliado",
      "ja": "#pendiente-afiliado",
      "zh": "#pendiente-afiliado",
      "ru": "#pendiente-afiliado"
    }
  }
}
`,

  "public/data/precios-stock.json": `{
  "gotokuji-blanco-15cm": {
    "sourceUrl": "",
    "program": "Pendiente de afiliación (Amazon / Etsy)",
    "price": 38.0,
    "currency": "EUR",
    "inStock": true,
    "lastChecked": "2026-11-24T04:30:00Z",
    "affiliateLinks": {
      "default": "#pendiente-afiliado",
      "es": "#pendiente-afiliado",
      "en": "#pendiente-afiliado",
      "fr": "#pendiente-afiliado",
      "de": "#pendiente-afiliado",
      "it": "#pendiente-afiliado",
      "pt": "#pendiente-afiliado",
      "ja": "#pendiente-afiliado",
      "zh": "#pendiente-afiliado",
      "ru": "#pendiente-afiliado"
    }
  }
}
`,

  // 4. Ficha de ejemplo en Español, Inglés y Francés (con respaldo automático para el resto)
  "src/content/figuras/gotokuji-blanco-15cm.md": `---
title: "Maneki-neko Blanco de Gōtokuji (15 cm)"
subtitle: "Fiel a la leyenda de 1615 de Setagaya: levanta la pata derecha sin moneda Koban para atraer oportunidades puras y armonía al hogar."
publishedAt: "2026-11-24"
featuredOrder: 1
paw: "right"
color: "white"
material: "ceramica"
sizeCategory: "pequeno"
dimensions: "15 × 10 × 9,5 cm"
weight: "390 g"
origin: "Tradición de Setagaya / Cerámica japonesa"
extras:
  - "estatico"
  - "japon"
anatomy:
  kobanText: ""
  bell: "Cascabel dorado tradicional"
  bibColor: "Rojo escarlata (Yodarekake)"
  accessory: "Sin moneda (tradición budista Shōfuku-neko-ji)"
placementAdvice: "Colócalo en el recibidor mirando hacia la puerta principal o en una estantería luminosa del salón para dar la bienvenida a las buenas oportunidades."
images:
  - "/images/timeline-2-gotokuji.jpeg"
  - "/images/historia-gotokuji-altar.jpeg"
summary: "Réplica tradicional del gato blanco Tama del templo Gōtokuji, con pata derecha alzada y sin moneda de oro."
---

Inspirado directamente en el **Shōfuku-neko-ji** del templo Gōtokuji de Tokio, este Maneki-neko blanco representa la vertiente más espiritual y clásica del talismán japonés.

A diferencia de las figuras comerciales modernas que sostienen grandes monedas doradas, la tradición de Gōtokuji enseña que el gato **no entrega riqueza material de forma directa, sino que abre la puerta de la oportunidad (*en*)** para que el esfuerzo honesto y la gratitud de quien lo acoge den fruto.

### Detalles simbólicos de esta pieza

- **Manto blanco puro:** Asociado en el sintoísmo y el budismo con la limpieza espiritual, la claridad mental y la paz doméstica.
- **Pata derecha levantada:** Invoca la buena fortuna general del hogar, la salud de la familia y la estabilidad.
- **Babero rojo y cascabel dorado:** Atributos protectores heredados de los antiguos guardianes de caminos (*Dōsojin*) y de los gatos domésticos cuidados en el periodo Edo.
`,

  "src/content/figuras/en/gotokuji-blanco-15cm.md": `---
title: "White Gōtokuji Maneki-neko (15 cm)"
subtitle: "True to the 1615 Setagaya legend: raises its right paw without a Koban coin to invite pure opportunities and household harmony."
publishedAt: "2026-11-24"
featuredOrder: 1
paw: "right"
color: "white"
material: "ceramica"
sizeCategory: "pequeno"
dimensions: "15 × 10 × 9.5 cm"
weight: "390 g"
origin: "Setagaya Tradition / Japanese Ceramic"
extras:
  - "estatico"
  - "japon"
anatomy:
  kobanText: ""
  bell: "Traditional golden bell"
  bibColor: "Scarlet red (Yodarekake)"
  accessory: "No coin (pure Shōfuku-neko-ji Buddhist tradition)"
placementAdvice: "Place it in the entryway facing the front door or on a bright living-room shelf to welcome positive opportunities."
images:
  - "/images/timeline-2-gotokuji.jpeg"
  - "/images/historia-gotokuji-altar.jpeg"
summary: "Traditional replica of Tama, the white cat of Gōtokuji Temple, with raised right paw and no gold coin."
---

Directly inspired by the **Shōfuku-neko-ji** of Tokyo's Gōtokuji Temple, this white Maneki-neko embodies the most spiritual and classical lineage of the Japanese talisman.

Unlike modern commercial figurines holding large gold coins, Gōtokuji tradition teaches that the cat **does not hand out material wealth directly, but opens the door of opportunity (*en*)** so that honest effort and gratitude may bear fruit.

### Symbolic Highlights

- **Pure white coat:** Associated in Shinto and Buddhism with spiritual cleanliness, mental clarity, and domestic peace.
- **Raised right paw:** Invokes general household fortune, family health, and stability.
- **Red bib and golden bell:** Protective attributes inherited from ancient roadside guardians (*Dōsojin*) and cherished Edo-period house cats.
`,

  "src/content/figuras/fr/gotokuji-blanco-15cm.md": `---
title: "Maneki-neko Blanc de Gōtokuji (15 cm)"
subtitle: "Fidèle à la légende de 1615 de Setagaya : il lève la patte droite sans pièce Koban pour attirer des opportunités pures et l'harmonie au foyer."
publishedAt: "2026-11-24"
featuredOrder: 1
paw: "right"
color: "white"
material: "ceramica"
sizeCategory: "pequeno"
dimensions: "15 × 10 × 9,5 cm"
weight: "390 g"
origin: "Tradition de Setagaya / Céramique japonaise"
extras:
  - "estatico"
  - "japon"
anatomy:
  kobanText: ""
  bell: "Grelot doré traditionnel"
  bibColor: "Rouge écarlate (Yodarekake)"
  accessory: "Sans pièce (tradition bouddhiste Shōfuku-neko-ji)"
placementAdvice: "Placez-le dans l'entrée face à la porte principale ou sur une étagère lumineuse du salon pour accueillir les belles opportunités."
images:
  - "/images/timeline-2-gotokuji.jpeg"
  - "/images/historia-gotokuji-altar.jpeg"
summary: "Réplique traditionnelle de Tama, le chat blanc du temple Gōtokuji, patte droite levée et sans pièce d'or."
---

Directement inspiré du **Shōfuku-neko-ji** du temple Gōtokuji de Tokyo, ce Maneki-neko blanc incarne la lignée la plus spirituelle et classique du talisman japonais.

Contrairement aux figurines commerciales modernes tenant de grandes pièces d'or, la tradition de Gōtokuji enseigne que le chat **ne donne pas directement la richesse matérielle, mais ouvre la porte de l'opportunité (*en*)** afin que l'effort honnête et la gratitude portent leurs fruits.

### Détails symboliques

- **Robe blanche pure :** Associée dans le shintoïsme et le bouddhisme à la pureté spirituelle, la clarté d'esprit et la paix du foyer.
- **Patte droite levée :** Invoque la bonne fortune générale de la maison, la santé de la famille et la stabilité.
- **Bavoir rouge et grelot doré :** Attributs protecteurs hérités des anciens gardiens des chemins (*Dōsojin*) et des chats choyés de l'époque d'Edo.
`,

  // 5. Componente compartido del Catálogo Filtrable (9 idiomas)
  "src/components/TiendaPage.astro": `---
import { getCollection } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import { useTranslatedPath, type Lang } from '../i18n/ui';
import { tiendaTranslations } from '../i18n/tienda';
import preciosStock from '../data/precios-stock.json';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const tt = tiendaTranslations[lang];
const translatePath = useTranslatedPath(lang);

const allFiguras = await getCollection('figuras');
const baseFiguras = allFiguras
  .filter((e) => !e.id.includes('/'))
  .sort((a, b) => (a.data.featuredOrder ?? 100) - (b.data.featuredOrder ?? 100));

const stockMap = preciosStock as Record<string, {
  price: number;
  currency: string;
  inStock: boolean;
}>;

const catalogItems = baseFiguras.map((base) => {
  const entry = lang === 'es' ? base : (allFiguras.find((e) => e.id === \`\${lang}/\${base.id}\`) || base);
  const stock = stockMap[base.id] || { price: 0, currency: 'EUR', inStock: true };
  return {
    slug: base.id,
    url: translatePath(\`/tienda/\${base.id}/\`),
    data: entry.data,
    price: stock.price,
    currency: stock.currency,
    inStock: stock.inStock,
  };
});

const colorOptions: Array<{ key: keyof typeof tt.colors; swatchClass: string }> = [
  { key: 'tricolor', swatchClass: 'bg-gradient-to-tr from-stone-900 via-amber-500 to-white border-stone-400' },
  { key: 'white', swatchClass: 'bg-white border-stone-400' },
  { key: 'gold', swatchClass: 'bg-gradient-to-tr from-[#B7811E] to-[#FFF1B8] border-amber-500' },
  { key: 'yellow', swatchClass: 'bg-yellow-300 border-yellow-500' },
  { key: 'green', swatchClass: 'bg-emerald-600 border-emerald-800' },
  { key: 'blue', swatchClass: 'bg-sky-600 border-sky-800' },
  { key: 'purple', swatchClass: 'bg-purple-700 border-purple-900' },
  { key: 'pink', swatchClass: 'bg-rose-300 border-rose-400' },
  { key: 'red', swatchClass: 'bg-[#8E1323] border-red-950' },
  { key: 'black', swatchClass: 'bg-[#18181B] border-black' },
];
---

<BaseLayout title={tt.seoTitle} description={tt.seoDescription}>
  <section class="bg-seigaiha border-b border-[#E5DEC9]">
    <div class="max-w-6xl mx-auto px-6 py-8 sm:py-10">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <span class="hanko-stamp px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-white/90 inline-block mb-2.5">
            {tt.badge}
          </span>
          <h1 class="font-serif text-3xl sm:text-4xl text-[#161412]">
            {tt.heading}
          </h1>
          <p class="text-sm text-stone-600 mt-1.5 max-w-xl">
            {tt.subheading}
          </p>
        </div>

        <a
          href={translatePath('/')}
          class="inline-flex items-center gap-1.5 text-xs font-medium text-[#8E1323] hover:text-[#700E1B] transition-colors self-start md:self-auto"
        >
          <span aria-hidden="true">←</span> {tt.backToConfigurator}
        </a>
      </div>
    </div>
  </section>

  <section class="max-w-6xl mx-auto px-6 py-10 sm:py-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <!-- BARRA LATERAL DE FILTROS -->
      <aside class="lg:col-span-4 xl:col-span-3 bg-white border border-[#E5DEC9] rounded-2xl p-5 shadow-xs lg:sticky lg:top-24">
        <div class="flex items-center justify-between pb-3.5 mb-4 border-b border-[#E5DEC9]">
          <div class="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-[#8E1323]" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clip-rule="evenodd" />
            </svg>
            <h2 class="font-serif text-base font-semibold text-[#161412]">
              {tt.filtersTitle}
            </h2>
            <span id="sidebar-filter-count" class="hidden px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-[#8E1323] text-white">
              0
            </span>
          </div>

          <button
            type="button"
            id="btn-reset-filters"
            class="text-[11px] font-medium text-stone-400 hover:text-[#8E1323] transition-colors cursor-pointer hidden"
          >
            {tt.clearAll}
          </button>
        </div>

        <div class="divide-y divide-[#E5DEC9]">
          <!-- 1. POSICIÓN DE LAS PATAS -->
          <details open class="py-4 first:pt-0 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.pawSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-3 space-y-2">
              {(['left', 'right', 'both'] as const).map((pawKey) => (
                <button
                  type="button"
                  data-filter-paw={pawKey}
                  class="sidebar-paw-btn w-full flex items-center justify-between px-3 py-2 rounded-xl border border-[#E5DEC9] bg-[#FAF6F0]/60 text-left text-xs transition-all hover:border-[#C6922C] cursor-pointer"
                >
                  <div>
                    <span class="block font-semibold text-[#161412]">{tt.paws[pawKey].title}</span>
                    <span class="block text-[10px] text-stone-500">{tt.paws[pawKey].desc}</span>
                  </div>
                  <span class="paw-indicator w-3.5 h-3.5 rounded-full border border-stone-400 flex items-center justify-center"></span>
                </button>
              ))}
            </div>
          </details>

          <!-- 2. COLOR DEL ACABADO -->
          <details open class="py-4 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.colorSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-3 grid grid-cols-2 gap-1.5">
              {colorOptions.map((c) => (
                <button
                  type="button"
                  data-filter-color={c.key}
                  class="sidebar-color-btn flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-[#E5DEC9] bg-white text-xs text-stone-700 hover:border-[#C6922C] transition-all cursor-pointer"
                >
                  <span class={\`w-3.5 h-3.5 rounded-full shrink-0 border \${c.swatchClass}\`}></span>
                  <span class="truncate">{tt.colors[c.key]}</span>
                </button>
              ))}
            </div>
          </details>

          <!-- 3. RANGO DE PRECIO -->
          <details open class="py-4 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.priceSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-5 px-1.5 mb-1">
              <div class="relative h-1.5 w-full bg-[#E5DEC9] rounded-full mb-5">
                <div id="price-track" class="absolute top-0 bottom-0 bg-[#8E1323] rounded-full pointer-events-none" style="left: 0%; right: 0%;"></div>
                <input type="range" id="range-min" min="0" max="250" step="5" value="0" class="dual-range absolute w-full -top-[5px] h-1.5 appearance-none bg-transparent pointer-events-none z-20" />
                <input type="range" id="range-max" min="0" max="250" step="5" value="250" class="dual-range absolute w-full -top-[5px] h-1.5 appearance-none bg-transparent pointer-events-none z-30" />
              </div>
              <div class="flex items-center gap-3">
                <label class="block flex-1">
                  <div class="relative">
                    <input type="number" id="input-price-min" min="0" max="250" placeholder="0" class="w-full rounded-lg border border-[#E5DEC9] bg-white px-2.5 py-1.5 pr-6 text-xs text-[#161412] focus:border-[#8E1323] focus:outline-none" />
                    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 font-medium">€</span>
                  </div>
                </label>
                <span class="text-stone-300">-</span>
                <label class="block flex-1">
                  <div class="relative">
                    <input type="number" id="input-price-max" min="0" max="250" placeholder="250+" class="w-full rounded-lg border border-[#E5DEC9] bg-white px-2.5 py-1.5 pr-6 text-xs text-[#161412] focus:border-[#8E1323] focus:outline-none" />
                    <span class="absolute right-2.5 top-1/2 -translate-y-1/2 text-[11px] text-stone-400 font-medium">€</span>
                  </div>
                </label>
              </div>
            </div>
          </details>

          <!-- 4. MATERIAL -->
          <details open class="py-4 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.materialSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-3 space-y-2">
              {(['ceramica', 'porcelana', 'resina', 'hariko', 'madera', 'metal'] as const).map((matKey) => (
                <label class="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-[#161412]">
                  <input type="checkbox" name="material" value={matKey} data-label={tt.materials[matKey]} class="filter-checkbox rounded border-stone-300 text-[#8E1323] focus:ring-[#8E1323]" />
                  <span>{tt.materials[matKey]}</span>
                </label>
              ))}
            </div>
          </details>

          <!-- 5. TAMAÑO -->
          <details open class="py-4 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.sizeSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-3 space-y-2">
              {(['mini', 'pequeno', 'mediano', 'grande'] as const).map((sizeKey) => (
                <label class="flex items-center justify-between gap-2 text-xs text-stone-700 cursor-pointer hover:text-[#161412]">
                  <span class="flex items-center gap-2.5">
                    <input type="checkbox" name="tamano" value={sizeKey} data-label={tt.sizes[sizeKey].label} class="filter-checkbox rounded border-stone-300 text-[#8E1323] focus:ring-[#8E1323]" />
                    <span>{tt.sizes[sizeKey].label}</span>
                  </span>
                  <span class="text-[11px] text-stone-400">{tt.sizes[sizeKey].range}</span>
                </label>
              ))}
            </div>
          </details>

          <!-- 6. MECANISMO Y DETALLES -->
          <details class="py-4 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.extrasSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-3 space-y-2">
              {(['estatico', 'solar', 'koban', 'japon', 'hucha'] as const).map((extKey) => (
                <label class="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-[#161412]">
                  <input type="checkbox" name="extra" value={extKey} data-label={tt.extras[extKey]} class="filter-checkbox rounded border-stone-300 text-[#8E1323] focus:ring-[#8E1323]" />
                  <span>{tt.extras[extKey]}</span>
                </label>
              ))}
            </div>
          </details>

          <!-- 7. FECHA DE PUBLICACIÓN -->
          <details class="py-4 last:pb-0 group">
            <summary class="flex items-center justify-between list-none cursor-pointer text-[11px] font-bold uppercase tracking-widest text-stone-600 select-none">
              <span>{tt.dateSection}</span>
              <span class="text-stone-400 transition-transform group-open:rotate-180">▾</span>
            </summary>
            <div class="mt-3 space-y-2">
              {(['all', '7d', '30d', '90d'] as const).map((dateKey) => (
                <label class="flex items-center gap-2.5 text-xs text-stone-700 cursor-pointer hover:text-[#161412]">
                  <input type="radio" name="fecha" value={dateKey} checked={dateKey === 'all'} class="text-[#8E1323] focus:ring-[#8E1323]" />
                  <span>{tt.dates[dateKey]}</span>
                </label>
              ))}
            </div>
          </details>
        </div>
      </aside>

      <!-- ZONA PRINCIPAL -->
      <div class="lg:col-span-8 xl:col-span-9 space-y-5">
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-4 shadow-xs space-y-3">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div class="flex items-center gap-2">
              <span id="catalog-count-label" class="text-xs font-semibold text-[#161412]">
                {tt.catalogCount.replace('{count}', String(catalogItems.length))}
              </span>
            </div>

            <div class="flex items-center gap-2 self-start sm:self-auto">
              <label for="sort-select" class="text-[11px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
                {tt.sortBy}
              </label>
              <select
                id="sort-select"
                class="rounded-xl border border-[#E5DEC9] bg-[#FAF6F0]/70 px-3 py-1.5 text-xs font-medium text-[#161412] focus:border-[#8E1323] focus:bg-white focus:outline-none cursor-pointer"
              >
                {(['recientes', 'antiguos', 'precio_asc', 'precio_desc', 'relevancia'] as const).map((sortKey) => (
                  <option value={sortKey}>{tt.sorts[sortKey]}</option>
                ))}
              </select>
            </div>
          </div>

          <div id="active-chips-bar" class="hidden pt-2.5 border-t border-[#E5DEC9]/80 flex flex-wrap items-center gap-1.5"></div>
        </div>

        <!-- CUADRÍCULA DE FICHAS -->
        <div id="catalog-grid" class={\`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 \${catalogItems.length === 0 ? 'hidden' : ''}\`}>
          {catalogItems.map((item) => (
            <article
              data-figura-card
              data-paw={item.data.paw}
              data-color={item.data.color}
              data-price={item.price}
              data-material={item.data.material}
              data-tamano={item.data.sizeCategory}
              data-extras={item.data.extras.join(',')}
              data-published={item.data.publishedAt}
              data-order={item.data.featuredOrder}
              class="group bg-white border border-[#E5DEC9] rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-[#C6922C]/70 transition-all duration-300 flex flex-col"
            >
              <a href={item.url} class="block aspect-[4/3] overflow-hidden bg-[#FAF6F0] relative">
                <img
                  src={item.data.images[0]}
                  alt={item.data.title}
                  class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div class="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span class="px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full bg-white/95 text-[#8E1323] border border-[#E5DEC9]">
                    {tt.colors[item.data.color]}
                  </span>
                  <span class="px-2.5 py-0.5 text-[10px] font-semibold rounded-full bg-[#161412]/85 text-white">
                    {tt.paws[item.data.paw].title}
                  </span>
                </div>
              </a>

              <div class="p-5 flex-1 flex flex-col">
                <div class="flex items-center justify-between text-[11px] text-stone-500 mb-1.5">
                  <span>{item.data.dimensions}</span>
                  <span class={item.inStock ? 'text-emerald-700 font-medium' : 'text-amber-700 font-medium'}>
                    {item.inStock ? '●' : '○'}
                  </span>
                </div>

                <h2 class="font-serif text-lg font-bold text-[#161412] group-hover:text-[#8E1323] transition-colors mb-2 leading-snug">
                  <a href={item.url}>{item.data.title}</a>
                </h2>

                <p class="text-xs text-stone-600 leading-relaxed mb-4 flex-1 line-clamp-3">
                  {item.data.summary}
                </p>

                <div class="pt-3.5 border-t border-[#E5DEC9] flex items-center justify-between gap-2">
                  {item.price > 0 ? (
                    <span class="font-serif text-lg font-bold text-[#161412]">
                      {item.price.toFixed(2).replace('.', ',')} €
                    </span>
                  ) : (
                    <span class="text-xs text-stone-400">—</span>
                  )}

                  <a
                    href={item.url}
                    class="inline-flex items-center gap-1 text-xs font-semibold text-[#8E1323] hover:text-[#700E1B]"
                  >
                    <span>{tt.viewDetails}</span>
                    <span aria-hidden="true">→</span>
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>

        <!-- ESTADO VACÍO / PRÓXIMAMENTE -->
        <div id="catalog-empty-state" class={\`\${catalogItems.length > 0 ? 'hidden' : ''} bg-white border border-[#E5DEC9] rounded-2xl p-8 sm:p-14 text-center shadow-xs relative overflow-hidden\`}>
          <div class="max-w-lg mx-auto flex flex-col items-center">
            <span class="hanko-stamp px-3 py-1 text-[11px] font-bold tracking-widest uppercase bg-[#FAF6F0] mb-6">
              {tt.emptyBadge}
            </span>

            <div class="w-40 h-40 sm:w-44 sm:h-44 rounded-full overflow-hidden bg-white border border-dashed border-[#C6922C]/70 shadow-xs flex items-center justify-center p-5 mb-6">
              <img
                id="store-preview-cat"
                src="/MN_1_00_line.svg"
                alt="Maneki-neko"
                class="w-28 sm:w-32 h-auto object-contain transition-transform duration-300"
              />
            </div>

            <h2 class="font-serif text-2xl sm:text-3xl text-[#161412] mb-3">
              {tt.emptyTitle}
            </h2>

            <p id="store-empty-description" class="text-sm sm:text-base text-stone-600 leading-relaxed mb-6">
              {tt.emptyDefaultDesc}
            </p>

            <div class="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#FAF6F0] border border-[#E5DEC9] text-xs text-stone-600">
              <span class="w-2 h-2 rounded-full bg-[#C6922C] animate-pulse"></span>
              <span>{tt.emptyStatus}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <style is:global>
    .dual-range::-webkit-slider-thumb {
      pointer-events: auto;
      appearance: none;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background-color: #8E1323;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      cursor: pointer;
    }
    .dual-range::-moz-range-thumb {
      pointer-events: auto;
      width: 15px;
      height: 15px;
      border-radius: 50%;
      background-color: #8E1323;
      border: 2px solid #ffffff;
      box-shadow: 0 1px 3px rgba(0,0,0,0.3);
      cursor: pointer;
    }
  </style>

  <script
    id="tienda-i18n-data"
    type="application/json"
    set:html={JSON.stringify({
      pawLabels: {
        left: tt.paws.left.title,
        right: tt.paws.right.title,
        both: tt.paws.both.title,
      },
      colorLabels: tt.colors,
      dateLabels: tt.dates,
      catalogCountTemplate: tt.catalogCount,
      emptyDefaultDesc: tt.emptyDefaultDesc,
      emptyFilteredDesc: tt.emptyFilteredDesc,
    })}
  />

  <script>
    const cfgEl = document.getElementById('tienda-i18n-data');
    if (cfgEl?.textContent) {
      const cfg = JSON.parse(cfgEl.textContent);
      const maxSliderPrice = 250;

      const colorFiles: Record<string, string> = {
        tricolor: '01_tri',
        white: '02_white',
        black: '03_black',
        gold: '04_golden',
        yellow: '05_yellow',
        green: '06_green',
        blue: '07_blue',
        purple: '08_purple',
        pink: '09_pink',
        red: '10_red',
      };

      const state = {
        pata: null as string | null,
        color: null as string | null,
        precio_min: '',
        precio_max: '',
        material: [] as string[],
        tamano: [] as string[],
        extra: [] as string[],
        fecha: 'all',
        orden: 'recientes',
      };

      const pawButtons = document.querySelectorAll<HTMLButtonElement>('.sidebar-paw-btn');
      const colorButtons = document.querySelectorAll<HTMLButtonElement>('.sidebar-color-btn');
      const rangeMin = document.getElementById('range-min') as HTMLInputElement | null;
      const rangeMax = document.getElementById('range-max') as HTMLInputElement | null;
      const priceTrack = document.getElementById('price-track');
      const priceMinInput = document.getElementById('input-price-min') as HTMLInputElement | null;
      const priceMaxInput = document.getElementById('input-price-max') as HTMLInputElement | null;
      const checkboxes = document.querySelectorAll<HTMLInputElement>('.filter-checkbox');
      const dateRadios = document.querySelectorAll<HTMLInputElement>('input[name="fecha"]');
      const sortSelect = document.getElementById('sort-select') as HTMLSelectElement | null;
      const resetBtn = document.getElementById('btn-reset-filters');
      const filterCountBadge = document.getElementById('sidebar-filter-count');
      const chipsBar = document.getElementById('active-chips-bar');
      const countLabel = document.getElementById('catalog-count-label');
      const gridEl = document.getElementById('catalog-grid');
      const emptyStateEl = document.getElementById('catalog-empty-state');
      const descriptionEl = document.getElementById('store-empty-description');
      const previewImg = document.getElementById('store-preview-cat') as HTMLImageElement | null;
      const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-figura-card]'));

      function syncURL() {
        const url = new URL(window.location.href);
        const params = url.searchParams;
        state.pata ? params.set('pata', state.pata) : params.delete('pata');
        state.color ? params.set('color', state.color) : params.delete('color');
        state.precio_min ? params.set('precio_min', state.precio_min) : params.delete('precio_min');
        state.precio_max && state.precio_max !== String(maxSliderPrice) ? params.set('precio_max', state.precio_max) : params.delete('precio_max');
        state.material.length ? params.set('material', state.material.join(',')) : params.delete('material');
        state.tamano.length ? params.set('tamano', state.tamano.join(',')) : params.delete('tamano');
        state.extra.length ? params.set('extra', state.extra.join(',')) : params.delete('extra');
        state.fecha !== 'all' ? params.set('fecha', state.fecha) : params.delete('fecha');
        state.orden !== 'recientes' ? params.set('orden', state.orden) : params.delete('orden');
        window.history.replaceState({}, '', url.toString());
      }

      function updatePriceTrackUI() {
        if (!rangeMin || !rangeMax || !priceTrack) return;
        const minVal = parseInt(rangeMin.value);
        const maxVal = parseInt(rangeMax.value);
        priceTrack.style.left = \`\${(minVal / maxSliderPrice) * 100}%\`;
        priceTrack.style.right = \`\${100 - (maxVal / maxSliderPrice) * 100}%\`;
      }

      function buildActiveChips() {
        if (!chipsBar) return [];
        const chips: { label: string; onRemove: () => void }[] = [];

        if (state.pata && cfg.pawLabels[state.pata]) {
          chips.push({ label: cfg.pawLabels[state.pata], onRemove: () => { state.pata = null; render(); } });
        }
        if (state.color && cfg.colorLabels[state.color]) {
          chips.push({ label: cfg.colorLabels[state.color], onRemove: () => { state.color = null; render(); } });
        }
        if (state.precio_min || (state.precio_max && state.precio_max !== String(maxSliderPrice))) {
          const minTxt = state.precio_min ? \`\${state.precio_min} €\` : '0 €';
          const maxTxt = (state.precio_max && state.precio_max !== String(maxSliderPrice)) ? \`\${state.precio_max} €\` : '250+ €';
          chips.push({ label: \`\${minTxt} – \${maxTxt}\`, onRemove: () => { state.precio_min = ''; state.precio_max = ''; render(); } });
        }

        checkboxes.forEach((cb) => {
          if (cb.checked) {
            const group = cb.name as 'material' | 'tamano' | 'extra';
            const val = cb.value;
            chips.push({
              label: cb.dataset.label || val,
              onRemove: () => {
                cb.checked = false;
                state[group] = state[group].filter((v) => v !== val);
                render();
              },
            });
          }
        });

        if (state.fecha !== 'all' && cfg.dateLabels[state.fecha]) {
          chips.push({
            label: cfg.dateLabels[state.fecha],
            onRemove: () => {
              state.fecha = 'all';
              dateRadios.forEach((r) => { r.checked = r.value === 'all'; });
              render();
            },
          });
        }

        chipsBar.innerHTML = '';
        chipsBar.classList.toggle('hidden', chips.length === 0);
        chips.forEach((chip) => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E5DEC9] text-[11px] font-medium text-[#161412] hover:border-[#8E1323] transition-colors cursor-pointer';
          btn.innerHTML = \`<span>\${chip.label}</span><span class="text-stone-400 hover:text-[#8E1323]">×</span>\`;
          btn.addEventListener('click', chip.onRemove);
          chipsBar.appendChild(btn);
        });
        return chips;
      }

      function filterAndSortCards() {
        const now = Date.now();
        const maxDays = state.fecha === '7d' ? 7 : state.fecha === '30d' ? 30 : state.fecha === '90d' ? 90 : null;
        const minP = state.precio_min ? parseFloat(state.precio_min) : 0;
        const maxP = state.precio_max ? parseFloat(state.precio_max) : Infinity;

        let visibleCount = 0;

        cards.forEach((card) => {
          const paw = card.dataset.paw || '';
          const color = card.dataset.color || '';
          const price = parseFloat(card.dataset.price || '0');
          const material = card.dataset.material || '';
          const tamano = card.dataset.tamano || '';
          const extras = (card.dataset.extras || '').split(',').filter(Boolean);
          const published = card.dataset.published ? Date.parse(card.dataset.published) : now;

          let ok = true;
          if (state.pata && paw !== state.pata) ok = false;
          if (ok && state.color && color !== state.color) ok = false;
          if (ok && price > 0 && (price < minP || price > maxP)) ok = false;
          if (ok && state.material.length > 0 && !state.material.includes(material)) ok = false;
          if (ok && state.tamano.length > 0 && !state.tamano.includes(tamano)) ok = false;
          if (ok && state.extra.length > 0 && !state.extra.every((ex) => extras.includes(ex))) ok = false;
          if (ok && maxDays !== null && (now - published) > maxDays * 86400000) ok = false;

          card.classList.toggle('hidden', !ok);
          if (ok) visibleCount++;
        });

        if (gridEl) {
          const sorted = [...cards].sort((a, b) => {
            if (state.orden === 'precio_asc') return parseFloat(a.dataset.price || '0') - parseFloat(b.dataset.price || '0');
            if (state.orden === 'precio_desc') return parseFloat(b.dataset.price || '0') - parseFloat(a.dataset.price || '0');
            if (state.orden === 'antiguos') return Date.parse(a.dataset.published || '0') - Date.parse(b.dataset.published || '0');
            if (state.orden === 'relevancia') return parseInt(a.dataset.order || '100') - parseInt(b.dataset.order || '100');
            return Date.parse(b.dataset.published || '0') - Date.parse(a.dataset.published || '0');
          });
          sorted.forEach((c) => gridEl.appendChild(c));
          gridEl.classList.toggle('hidden', visibleCount === 0);
        }

        emptyStateEl?.classList.toggle('hidden', visibleCount > 0);
        if (countLabel) {
          countLabel.textContent = cfg.catalogCountTemplate.replace('{count}', String(visibleCount));
        }
      }

      function render() {
        pawButtons.forEach((btn) => {
          const isActive = (btn.dataset.filterPaw || '') === state.pata;
          const indicator = btn.querySelector('.paw-indicator');
          btn.classList.toggle('border-[#8E1323]', isActive);
          btn.classList.toggle('bg-[#FAF6F0]', isActive);
          btn.classList.toggle('ring-1', isActive);
          btn.classList.toggle('ring-[#8E1323]', isActive);
          btn.classList.toggle('border-[#E5DEC9]', !isActive);
          btn.classList.toggle('bg-[#FAF6F0]/60', !isActive);
          if (indicator) {
            indicator.innerHTML = isActive ? '<span class="w-2 h-2 rounded-full bg-[#8E1323]"></span>' : '';
            indicator.classList.toggle('border-[#8E1323]', isActive);
            indicator.classList.toggle('border-stone-400', !isActive);
          }
        });

        colorButtons.forEach((btn) => {
          const isActive = (btn.dataset.filterColor || '') === state.color;
          btn.classList.toggle('border-[#8E1323]', isActive);
          btn.classList.toggle('bg-[#FAF6F0]', isActive);
          btn.classList.toggle('font-semibold', isActive);
          btn.classList.toggle('text-[#161412]', isActive);
          btn.classList.toggle('ring-1', isActive);
          btn.classList.toggle('ring-[#8E1323]', isActive);
          btn.classList.toggle('border-[#E5DEC9]', !isActive);
          btn.classList.toggle('bg-white', !isActive);
        });

        const minVal = state.precio_min ? parseInt(state.precio_min) : 0;
        const maxVal = state.precio_max ? parseInt(state.precio_max) : maxSliderPrice;
        if (rangeMin && rangeMax) {
          rangeMin.value = String(minVal);
          rangeMax.value = String(maxVal);
        }
        if (priceMinInput) priceMinInput.value = state.precio_min;
        if (priceMaxInput) priceMaxInput.value = state.precio_max === String(maxSliderPrice) ? '' : state.precio_max;
        updatePriceTrackUI();

        const activeChips = buildActiveChips();
        const count = activeChips.length;
        resetBtn?.classList.toggle('hidden', count === 0);
        if (filterCountBadge) {
          filterCountBadge.textContent = String(count);
          filterCountBadge.classList.toggle('hidden', count === 0);
        }

        if (descriptionEl) {
          if (count > 0) {
            const summary = activeChips.map((c) => c.label).join(' · ');
            descriptionEl.textContent = cfg.emptyFilteredDesc.replace('{summary}', summary);
          } else {
            descriptionEl.textContent = cfg.emptyDefaultDesc;
          }
        }

        if (previewImg) {
          const prefix = state.pata === 'both' ? '2' : '1';
          const fileSuffix = state.color && colorFiles[state.color] ? colorFiles[state.color] : '00_line';
          previewImg.src = \`/MN_\${prefix}_\${fileSuffix}.svg\`;
          previewImg.style.transform = state.pata === 'right' ? 'scaleX(-1)' : 'scaleX(1)';
        }

        filterAndSortCards();
        syncURL();
      }

      function hydrateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const pata = params.get('pata');
        if (pata && cfg.pawLabels[pata]) state.pata = pata;
        const color = params.get('color');
        if (color && cfg.colorLabels[color]) state.color = color;
        state.precio_min = params.get('precio_min') || '';
        state.precio_max = params.get('precio_max') || '';

        (['material', 'tamano', 'extra'] as const).forEach((group) => {
          const raw = params.get(group);
          if (raw) state[group] = raw.split(',').filter(Boolean);
        });
        checkboxes.forEach((cb) => {
          const group = cb.name as 'material' | 'tamano' | 'extra';
          cb.checked = state[group].includes(cb.value);
        });

        const fecha = params.get('fecha');
        if (fecha && cfg.dateLabels[fecha]) {
          state.fecha = fecha;
          dateRadios.forEach((r) => { r.checked = r.value === fecha; });
        }
        const orden = params.get('orden');
        if (orden && sortSelect) {
          state.orden = orden;
          sortSelect.value = orden;
        }
      }

      pawButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.filterPaw || null;
          state.pata = state.pata === key ? null : key;
          render();
        });
      });

      colorButtons.forEach((btn) => {
        btn.addEventListener('click', () => {
          const key = btn.dataset.filterColor || null;
          state.color = state.color === key ? null : key;
          render();
        });
      });

      rangeMin?.addEventListener('input', (e) => {
        let val = parseInt((e.target as HTMLInputElement).value);
        const max = parseInt(rangeMax?.value || '250');
        if (val > max - 5) { val = max - 5; (e.target as HTMLInputElement).value = String(val); }
        state.precio_min = val === 0 ? '' : String(val);
        updatePriceTrackUI();
        if (priceMinInput) priceMinInput.value = state.precio_min;
        filterAndSortCards();
        syncURL();
      });
      rangeMin?.addEventListener('change', render);

      rangeMax?.addEventListener('input', (e) => {
        let val = parseInt((e.target as HTMLInputElement).value);
        const min = parseInt(rangeMin?.value || '0');
        if (val < min + 5) { val = min + 5; (e.target as HTMLInputElement).value = String(val); }
        state.precio_max = val === maxSliderPrice ? '' : String(val);
        updatePriceTrackUI();
        if (priceMaxInput) priceMaxInput.value = state.precio_max;
        filterAndSortCards();
        syncURL();
      });
      rangeMax?.addEventListener('change', render);

      priceMinInput?.addEventListener('change', () => {
        let val = parseInt(priceMinInput.value);
        const max = state.precio_max ? parseInt(state.precio_max) : maxSliderPrice;
        if (isNaN(val) || val < 0) val = 0;
        if (val > max - 5) val = max - 5;
        state.precio_min = val === 0 ? '' : String(val);
        render();
      });

      priceMaxInput?.addEventListener('change', () => {
        let val = parseInt(priceMaxInput.value);
        const min = state.precio_min ? parseInt(state.precio_min) : 0;
        if (isNaN(val) || val > maxSliderPrice) val = maxSliderPrice;
        if (val < min + 5) val = min + 5;
        state.precio_max = val === maxSliderPrice ? '' : String(val);
        render();
      });

      checkboxes.forEach((cb) => {
        cb.addEventListener('change', () => {
          const group = cb.name as 'material' | 'tamano' | 'extra';
          if (cb.checked) {
            if (!state[group].includes(cb.value)) state[group].push(cb.value);
          } else {
            state[group] = state[group].filter((v) => v !== cb.value);
          }
          render();
        });
      });

      dateRadios.forEach((radio) => {
        radio.addEventListener('change', () => {
          if (radio.checked) { state.fecha = radio.value; render(); }
        });
      });

      sortSelect?.addEventListener('change', () => {
        state.orden = sortSelect.value;
        filterAndSortCards();
        syncURL();
      });

      resetBtn?.addEventListener('click', () => {
        state.pata = null;
        state.color = null;
        state.precio_min = '';
        state.precio_max = '';
        state.material = [];
        state.tamano = [];
        state.extra = [];
        state.fecha = 'all';
        if (priceMinInput) priceMinInput.value = '';
        if (priceMaxInput) priceMaxInput.value = '';
        checkboxes.forEach((cb) => { cb.checked = false; });
        dateRadios.forEach((r) => { r.checked = r.value === 'all'; });
        render();
      });

      hydrateFromURL();
      render();
    }
  </script>
</BaseLayout>
`,

  // 6. Plantilla de Ficha Individual de Producto (/tienda/[slug]/ y /[lang]/tienda/[slug]/)
  "src/components/FiguraDetailPage.astro": `---
import { render } from 'astro:content';
import BaseLayout from '../layouts/BaseLayout.astro';
import { useTranslatedPath, type Lang } from '../i18n/ui';
import { homeTranslations } from '../i18n/home';
import { tiendaTranslations } from '../i18n/tienda';
import preciosStock from '../data/precios-stock.json';

interface Props {
  entry: any;
  baseSlug: string;
  lang: Lang;
  related: Array<{ slug: string; data: any; price: number }>;
}

const { entry, baseSlug, lang, related } = Astro.props;
const { Content } = await render(entry);
const tr = homeTranslations[lang];
const tt = tiendaTranslations[lang];
const translatePath = useTranslatedPath(lang);

const {
  title,
  subtitle,
  paw,
  color,
  material,
  dimensions,
  weight,
  origin,
  extras,
  anatomy,
  placementAdvice,
  images,
} = entry.data;

const stockMap = preciosStock as Record<string, {
  price: number;
  currency: string;
  inStock: boolean;
  lastChecked: string;
  affiliateLinks: Record<string, string>;
}>;

const stock = stockMap[baseSlug] || {
  price: 0,
  currency: 'EUR',
  inStock: true,
  lastChecked: '',
  affiliateLinks: { default: '#pendiente-afiliado' },
};

const rawAffiliateUrl = stock.affiliateLinks[lang] || stock.affiliateLinks.default || '#pendiente-afiliado';
const hasActiveAffiliateLink = rawAffiliateUrl.startsWith('http://') || rawAffiliateUrl.startsWith('https://');

const pawMeaning = tr.paws[paw as 'left' | 'right' | 'both'];
const colorMeaning = tr.colors[color as keyof typeof tr.colors];

const colorFileMap: Record<string, string> = {
  tricolor: '01_tri',
  white: '02_white',
  black: '03_black',
  gold: '04_golden',
  yellow: '05_yellow',
  green: '06_green',
  blue: '07_blue',
  purple: '08_purple',
  pink: '09_pink',
  red: '10_red',
};
const schematicSvg = \`/MN_\${paw === 'both' ? '2' : '1'}_\${colorFileMap[color] || '00_line'}.svg\`;
---

<BaseLayout title={\`\${title} | Manekineko.es\`} description={subtitle}>
  <div class="max-w-6xl mx-auto px-6 py-10 sm:py-14">
    <nav class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <a href={translatePath('/tienda/')} class="text-sm font-medium text-[#8E1323] hover:underline">
        ← {tt.backToCatalog}
      </a>
      <a
        href={\`\${translatePath('/tienda/')}?color=\${color}&pata=\${paw}\`}
        class="text-xs font-medium text-stone-500 hover:text-[#8E1323] transition-colors"
      >
        {tt.colors[color as keyof typeof tt.colors]} • {tt.paws[paw as 'left' | 'right' | 'both'].title}
      </a>
    </nav>

    <!-- BLOQUE PRINCIPAL: GALERÍA + FICHA DE COMPRA Y SIMBOLISMO -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <!-- Galería -->
      <div class="lg:col-span-6 space-y-4">
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-3 shadow-xs">
          <img
            id="figura-main-img"
            src={images[0]}
            alt={title}
            class="w-full aspect-[4/3] object-cover rounded-xl"
          />
        </div>

        {images.length > 1 && (
          <div class="grid grid-cols-4 gap-3">
            {images.map((img: string, idx: number) => (
              <button
                type="button"
                data-thumb-src={img}
                class={\`figura-thumb rounded-xl overflow-hidden border bg-white p-1 transition-all cursor-pointer \${idx === 0 ? 'border-[#8E1323] ring-2 ring-[#8E1323]/20' : 'border-[#E5DEC9] hover:border-[#C6922C]'}\`}
              >
                <img src={img} alt={\`\${title} (\${idx + 1})\`} class="w-full aspect-[4/3] object-cover rounded-lg" />
              </button>
            ))}
          </div>
        )}
      </div>

      <!-- Datos principales + CTA de referido -->
      <div class="lg:col-span-6 space-y-6">
        <div>
          <div class="flex flex-wrap items-center gap-2 mb-3">
            <span class="hanko-stamp px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-white">
              {tt.colors[color as keyof typeof tt.colors]}
            </span>
            <span class="px-3 py-0.5 text-xs font-semibold rounded-full bg-white border border-[#E5DEC9] text-[#8E1323]">
              {tt.paws[paw as 'left' | 'right' | 'both'].title}
            </span>
          </div>

          <h1 class="font-serif text-3xl sm:text-4xl font-bold text-[#161412] leading-tight mb-3">
            {title}
          </h1>
          <p class="text-base text-stone-600 leading-relaxed">
            {subtitle}
          </p>
        </div>

        <!-- Caja de Precio + Disponibilidad + Enlace de Afiliado -->
        <div
          id="live-stock-box"
          data-slug={baseSlug}
          data-in-stock-label={tt.inStock}
          data-out-of-stock-label={tt.outOfStock}
          class="bg-white border border-[#E5DEC9] border-l-4 border-l-[#8E1323] rounded-2xl p-6 shadow-xs space-y-4"
        >
          <div class="flex flex-wrap items-baseline justify-between gap-4">
            {stock.price > 0 && (
              <div id="live-price-value" class="font-serif text-3xl font-bold text-[#161412]">
                {stock.price.toFixed(2).replace('.', ',')} €
              </div>
            )}

            <span
              id="live-stock-badge"
              class={\`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold \${stock.inStock ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'}\`}
            >
              <span>{stock.inStock ? '●' : '○'}</span>
              <span id="live-stock-text">{stock.inStock ? tt.inStock : tt.outOfStock}</span>
            </span>
          </div>

          {hasActiveAffiliateLink ? (
            <a
              id="live-buy-btn"
              href={rawAffiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener"
              class="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#8E1323] hover:bg-[#700E1B] text-white font-semibold text-sm shadow-sm transition-colors"
            >
              <span>{tt.buyBtn}</span>
              <span aria-hidden="true">↗</span>
            </a>
          ) : (
            <div class="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-[#FAF6F0] border border-[#E5DEC9] text-stone-500 font-semibold text-sm">
              <span>{tt.buyPendingBtn}</span>
            </div>
          )}

          <p class="text-[11px] text-stone-500 leading-relaxed">
            {tt.affiliateNote}
          </p>
        </div>

        <!-- Conexión directa con el Configurador Simbólico -->
        <div class="bg-[#FAF6F0] border border-[#E5DEC9] rounded-2xl p-5 flex items-center gap-4">
          <div class="w-16 h-16 shrink-0 rounded-full bg-white border border-[#C6922C]/50 flex items-center justify-center p-2">
            <img
              src={schematicSvg}
              alt={title}
              class="w-11 h-auto object-contain"
              style={paw === 'right' ? 'transform: scaleX(-1);' : undefined}
            />
          </div>
          <div class="text-xs text-stone-700 leading-relaxed">
            <div class="font-bold uppercase tracking-wider text-[10px] text-[#8E1323] mb-1">
              {pawMeaning?.tag} • {colorMeaning?.tag}
            </div>
            <p>{pawMeaning?.sentence} {colorMeaning?.sentence}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- BLOQUE INFERIOR: DESCRIPCIÓN EDITORIAL + FICHA TÉCNICA COMPLETA -->
    <div class="mt-14 grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
      <article class="lg:col-span-7 bg-white border border-[#E5DEC9] rounded-2xl p-6 sm:p-8 shadow-xs">
        <div class="article-body text-[#161412] [&>p]:text-base [&>p]:text-stone-700 [&>p]:leading-[1.85] [&>p]:mb-5 [&>h3]:font-serif [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-[#161412] [&>h3]:mt-7 [&>h3]:mb-3 [&>ul]:my-4 [&>ul]:pl-5 [&>ul]:list-disc [&>ul]:space-y-2.5 [&>ul]:text-stone-700 [&>ul]:leading-relaxed [&_strong]:font-semibold [&_strong]:text-[#161412]">
          <Content />
        </div>

        <div class="mt-8 p-5 rounded-xl bg-[#FAF6F0] border-l-4 border-l-[#C6922C]">
          <h3 class="font-serif text-base font-bold text-[#161412] mb-1.5">
            {tt.placementTitle}
          </h3>
          <p class="text-sm text-stone-700 leading-relaxed">
            {placementAdvice}
          </p>
        </div>
      </article>

      <aside class="lg:col-span-5 space-y-6">
        <!-- Tabla de especificaciones artesanales -->
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-6 shadow-xs">
          <h2 class="font-serif text-lg font-bold text-[#161412] mb-4 pb-3 border-b border-[#E5DEC9]">
            {tt.specsTitle}
          </h2>
          <dl class="divide-y divide-[#E5DEC9]/70 text-xs">
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.paw}</dt>
              <dd class="font-semibold text-[#161412] text-right">{tt.paws[paw as 'left' | 'right' | 'both'].title}</dd>
            </div>
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.color}</dt>
              <dd class="font-semibold text-[#161412] text-right">{tt.colors[color as keyof typeof tt.colors]}</dd>
            </div>
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.material}</dt>
              <dd class="font-semibold text-[#161412] text-right">{tt.materials[material as keyof typeof tt.materials]}</dd>
            </div>
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.origin}</dt>
              <dd class="font-semibold text-[#161412] text-right">{origin}</dd>
            </div>
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.dimensions}</dt>
              <dd class="font-semibold text-[#161412] text-right">{dimensions}</dd>
            </div>
            {weight && (
              <div class="py-2.5 flex justify-between gap-4">
                <dt class="text-stone-500">{tt.specLabels.weight}</dt>
                <dd class="font-semibold text-[#161412] text-right">{weight}</dd>
              </div>
            )}
          </dl>
        </div>

        <!-- Rasgos iconográficos (Koban, cascabel, babero, accesorios) -->
        <div class="bg-white border border-[#E5DEC9] rounded-2xl p-6 shadow-xs">
          <h2 class="font-serif text-lg font-bold text-[#161412] mb-4 pb-3 border-b border-[#E5DEC9]">
            {tt.anatomyTitle}
          </h2>
          <dl class="divide-y divide-[#E5DEC9]/70 text-xs">
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.koban}</dt>
              <dd class="font-semibold text-[#161412] text-right">
                {anatomy.kobanText ? anatomy.kobanText : tt.specLabels.noKoban}
              </dd>
            </div>
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.bell}</dt>
              <dd class="font-semibold text-[#161412] text-right">{anatomy.bell}</dd>
            </div>
            <div class="py-2.5 flex justify-between gap-4">
              <dt class="text-stone-500">{tt.specLabels.bib}</dt>
              <dd class="font-semibold text-[#161412] text-right">{anatomy.bibColor}</dd>
            </div>
            {anatomy.accessory && (
              <div class="py-2.5 flex justify-between gap-4">
                <dt class="text-stone-500">{tt.specLabels.accessory}</dt>
                <dd class="font-semibold text-[#161412] text-right">{anatomy.accessory}</dd>
              </div>
            )}
          </dl>

          {extras.length > 0 && (
            <div class="mt-4 pt-3 border-t border-[#E5DEC9] flex flex-wrap gap-1.5">
              {extras.map((ext: keyof typeof tt.extras) => (
                <span class="px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E5DEC9] text-[11px] font-medium text-stone-700">
                  {tt.extras[ext]}
                </span>
              ))}
            </div>
          )}
        </div>
      </aside>
    </div>

    {related.length > 0 && (
      <section class="mt-16 pt-10 border-t border-[#E5DEC9]">
        <h2 class="font-serif text-2xl font-bold text-[#161412] mb-6">{tt.relatedTitle}</h2>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {related.map((rel) => (
            <a
              href={translatePath(\`/tienda/\${rel.slug}/\`) }
              class="group bg-white border border-[#E5DEC9] rounded-2xl overflow-hidden shadow-xs hover:border-[#C6922C] transition-all"
            >
              <div class="aspect-[4/3] overflow-hidden bg-[#FAF6F0]">
                <img src={rel.data.images[0]} alt={rel.data.title} class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div class="p-4">
                <h3 class="font-serif text-base font-bold text-[#161412] group-hover:text-[#8E1323] transition-colors">
                  {rel.data.title}
                </h3>
                {rel.price > 0 && (
                  <div class="text-xs font-semibold text-stone-600 mt-1">
                    {rel.price.toFixed(2).replace('.', ',')} €
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      </section>
    )}
  </div>

  <script>
    // Galería de miniaturas
    const mainImg = document.getElementById('figura-main-img') as HTMLImageElement | null;
    const thumbs = document.querySelectorAll<HTMLButtonElement>('.figura-thumb');
    thumbs.forEach((btn) => {
      btn.addEventListener('click', () => {
        const src = btn.dataset.thumbSrc;
        if (mainImg && src) mainImg.src = src;
        thumbs.forEach((b) => {
          b.classList.remove('border-[#8E1323]', 'ring-2', 'ring-[#8E1323]/20');
          b.classList.add('border-[#E5DEC9]');
        });
        btn.classList.remove('border-[#E5DEC9]');
        btn.classList.add('border-[#8E1323]', 'ring-2', 'ring-[#8E1323]/20');
      });
    });

    // Sincronización en vivo con /data/precios-stock.json
    const box = document.getElementById('live-stock-box');
    const slug = box?.dataset.slug;
    if (box && slug) {
      fetch('/data/precios-stock.json', { cache: 'no-store' })
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          const item = data?.[slug];
          if (!item) return;
          const priceEl = document.getElementById('live-price-value');
          if (priceEl && typeof item.price === 'number' && item.price > 0) {
            priceEl.textContent = \`\${item.price.toFixed(2).replace('.', ',')} €\`;
          }
          const badgeEl = document.getElementById('live-stock-badge');
          const textEl = document.getElementById('live-stock-text');
          if (badgeEl && textEl) {
            const available = Boolean(item.inStock);
            textEl.textContent = available ? (box.dataset.inStockLabel || '') : (box.dataset.outOfStockLabel || '');
            badgeEl.className = available
              ? 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200';
          }
        })
        .catch(() => {});
    }
  </script>
</BaseLayout>
`,

  // 7. Rutas de Astro para catálogo y fichas individuales (ES + 8 idiomas)
  "src/pages/tienda/index.astro": `---
import TiendaPage from '../../components/TiendaPage.astro';
---
<TiendaPage lang="es" />
`,

  "src/pages/[lang]/tienda/index.astro": `---
import TiendaPage from '../../../components/TiendaPage.astro';
import { languages, defaultLang, type Lang } from '../../../i18n/ui';

export function getStaticPaths() {
  return (Object.keys(languages) as Lang[])
    .filter((l) => l !== defaultLang)
    .map((lang) => ({ params: { lang } }));
}

const { lang } = Astro.params as { lang: Lang };
---
<TiendaPage lang={lang} />
`,

  "src/pages/tienda/[...slug].astro": `---
import { getCollection } from 'astro:content';
import FiguraDetailPage from '../../components/FiguraDetailPage.astro';
import preciosStock from '../../data/precios-stock.json';

export async function getStaticPaths() {
  const allFiguras = await getCollection('figuras');
  const baseFiguras = allFiguras.filter((e) => !e.id.includes('/'));
  const stockMap = preciosStock as Record<string, { price: number }>;

  return baseFiguras.map((entry) => {
    const related = baseFiguras
      .filter((other) => other.id !== entry.id)
      .slice(0, 3)
      .map((other) => ({
        slug: other.id,
        data: other.data,
        price: stockMap[other.id]?.price || 0,
      }));

    return {
      params: { slug: entry.id },
      props: { entry, baseSlug: entry.id, related },
    };
  });
}

const { entry, baseSlug, related } = Astro.props;
---
<FiguraDetailPage entry={entry} baseSlug={baseSlug} lang="es" related={related} />
`,

  "src/pages/[lang]/tienda/[...slug].astro": `---
import { getCollection } from 'astro:content';
import FiguraDetailPage from '../../../components/FiguraDetailPage.astro';
import { languages, defaultLang, type Lang } from '../../../i18n/ui';
import preciosStock from '../../../data/precios-stock.json';

export async function getStaticPaths() {
  const allFiguras = await getCollection('figuras');
  const baseFiguras = allFiguras.filter((e) => !e.id.includes('/'));
  const langs = (Object.keys(languages) as Lang[]).filter((l) => l !== defaultLang);
  const stockMap = preciosStock as Record<string, { price: number }>;

  return langs.flatMap((lang) =>
    baseFiguras.map((base) => {
      const entry = allFiguras.find((e) => e.id === \`\${lang}/\${base.id}\`) || base;
      const related = baseFiguras
        .filter((other) => other.id !== base.id)
        .slice(0, 3)
        .map((other) => {
          const relEntry = allFiguras.find((e) => e.id === \`\${lang}/\${other.id}\`) || other;
          return {
            slug: other.id,
            data: relEntry.data,
            price: stockMap[other.id]?.price || 0,
          };
        });

      return {
        params: { lang, slug: base.id },
        props: { entry, baseSlug: base.id, lang, related },
      };
    })
  );
}

const { entry, baseSlug, lang, related } = Astro.props as {
  entry: any;
  baseSlug: string;
  lang: Lang;
  related: Array<{ slug: string; data: any; price: number }>;
};
---
<FiguraDetailPage entry={entry} baseSlug={baseSlug} lang={lang} related={related} />
`,

  // 8. Script IA para importar nuevas fichas desde una URL y traducirlas a los 9 idiomas
  "scripts/importar-figura.cjs": `/**
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
  for (const line of fs.readFileSync('.env', 'utf8').split(/\\r?\\n/)) {
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
  const matches = [...html.matchAll(/<script[^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi)];
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
    const clean = targetUrl.split('?')[0].replace(/\\/$/, '');
    const shopifyRes = await fetch(clean + '.json', { headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (shopifyRes.ok) {
      const json = await shopifyRes.json();
      if (json.product) {
        const p = json.product;
        const v = p.variants?.[0] || {};
        return {
          rawTitle: p.title,
          rawDesc: (p.body_html || '').replace(/<[^>]+>/g, ' ').replace(/\\s+/g, ' ').trim(),
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

  const prompt = \`Eres el editor cultural de Manekineko.es. A partir de estos datos de producto, devuelve SOLO un JSON válido con:
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

Datos del producto: \${JSON.stringify(raw)}\`;

  const resp = await fetch(\`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=\${apiKey}\`, {
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
      ? path.join('src/content/figuras', \`\${slug}.md\`)
      : path.join('src/content/figuras', lang, \`\${slug}.md\`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    const md = \`---
title: \${JSON.stringify(tr.title)}
subtitle: \${JSON.stringify(tr.subtitle)}
publishedAt: "\${today}"
featuredOrder: 10
paw: "\${meta.paw}"
color: "\${meta.color}"
material: "\${meta.material}"
sizeCategory: "\${meta.sizeCategory}"
dimensions: \${JSON.stringify(tr.dimensions || meta.dimensions)}
weight: \${JSON.stringify(meta.weight || '')}
origin: \${JSON.stringify(tr.origin || 'Japón')}
extras: \${JSON.stringify(meta.extras || ['estatico'])}
anatomy:
  kobanText: \${JSON.stringify(tr.kobanText || '')}
  bell: \${JSON.stringify(tr.bell || '')}
  bibColor: \${JSON.stringify(tr.bibColor || '')}
  accessory: \${JSON.stringify(tr.accessory || '')}
placementAdvice: \${JSON.stringify(tr.placementAdvice || '')}
images: \${JSON.stringify(raw.images)}
summary: \${JSON.stringify(tr.summary)}
---

\${tr.bodyMarkdown}
\`;
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

  console.log(\`FICHA_IMPORTADA: \${slug} (\${Object.keys(locales).length} idiomas)\`);
})();
`,

  // 9. Script de sincronización automática de precios y stock
  "scripts/sync-precios.cjs": `/**
 * Sincroniza precio y disponibilidad de todos los productos en src/data/precios-stock.json
 * Uso: node scripts/sync-precios.cjs
 */
const fs = require('fs');

function extractOfferFromHtml(html) {
  const matches = [...html.matchAll(/<script[^>]*type=["']application\\/ld\\+json["'][^>]*>([\\s\\S]*?)<\\/script>/gi)];
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
      const clean = item.sourceUrl.split('?')[0].replace(/\\/$/, '');
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
        console.log(\`OK \${slug}: \${item.price} \${item.currency} | Stock: \${item.inStock}\`);
      }
    } catch (err) {
      console.warn(\`AVISO \${slug}: no se pudo consultar (\${err.message})\`);
    }
  }

  const serialized = JSON.stringify(db, null, 2);
  fs.writeFileSync(dbPath, serialized, 'utf8');
  fs.writeFileSync('public/data/precios-stock.json', serialized, 'utf8');
  console.log(\`SINCRONIZACION_COMPLETADA (\${updated} productos actualizados)\`);
})();
`
};

for (const [relPath, content] of Object.entries(files)) {
  fs.mkdirSync(path.dirname(relPath), { recursive: true });
  fs.writeFileSync(relPath, content.trimStart(), 'utf8');
}

// Limpiar archivos temporales antiguos si siguen ahí
for (const tmp of ['temp_articles.txt', 'temp_tienda.txt']) {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}

console.log('TIENDA_Y_FICHAS_LISTAS: ' + Object.keys(files).length + ' archivos creados/actualizados');
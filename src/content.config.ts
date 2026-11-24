import { defineCollection, z } from 'astro:content';
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

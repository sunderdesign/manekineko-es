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

export const collections = { leyendas, historia };
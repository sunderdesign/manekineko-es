import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cultura = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/cultura' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    category: z.string().default('Tradición'),
    readTime: z.string().default('4 min'),
  }),
});

const leyendas = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/leyendas' }),
  schema: z.object({
    title: z.string(),
    subtitle: z.string(),
    era: z.string(),
    location: z.string(),
    summary: z.string(),
    coverImage: z.string(),
    coverAlt: z.string(),
    readingTime: z.string(),
    order: z.number(),
    isOriginal: z.boolean().default(false),
    featuredFigure: z.object({
      name: z.string(),
      meaning: z.string(),
      shopUrl: z.string(),
    }),
  }),
});

export const collections = { cultura, leyendas };
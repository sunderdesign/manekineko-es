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

export const collections = { cultura };
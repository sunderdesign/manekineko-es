import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://manekineko.es',
  integrations: [sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
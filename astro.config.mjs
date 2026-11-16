import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://prashantkeshr.github.io',
  base: '/thpedianv26.lv',
  output: 'static',
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'hi'],
    routing: {
      prefixDefaultLocale: true,
    },
  },
  build: {
    assets: '_assets',
  },
  vite: {
    optimizeDeps: {
      exclude: ['@orama/orama'],
    },
  },
});

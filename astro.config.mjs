import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://thiago-alexandre.cloud',
  i18n: {
    locales: ['pt', 'en'],
    defaultLocale: 'pt',
    routing: { prefixDefaultLocale: false },
  },
});

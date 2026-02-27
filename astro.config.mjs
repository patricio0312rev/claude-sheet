import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://clawd.patriciomarroquin.dev',
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
});

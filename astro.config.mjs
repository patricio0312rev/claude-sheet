import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://clawd.patriciomarroquin.dev',
  integrations: [react(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      allowedHosts: ['nonextinct-overrichly-trisha.ngrok-free.dev'],
    },
  },
});

// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://www.craigloewen.com',
  trailingSlash: 'ignore',
  integrations: [vue(), mdx(), sitemap()],
  /**
   * Legacy Jekyll routes. Post permalinks (/blog/:y/:m/:d/:slug/) are preserved
   * natively by the route structure, so only these standalone pages need mapping.
   */
  redirects: {
    '/allposts': '/writing',
    '/allposts.html': '/writing',
    '/activity': '/talks',
    '/activity.html': '/talks',
    '/spot-me': '/projects/spotme',
    '/spot-me.html': '/projects/spotme',
    '/blog': '/writing',
  },
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      themes: {
        light: 'github-light',
        dark: 'github-dark-default',
      },
      wrap: true,
    },
  },
  image: {
    responsiveStyles: true,
    layout: 'constrained',
  },
  build: {
    format: 'directory',
  },
});

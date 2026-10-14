/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@mdx-js/rollup';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import path from 'path';

export default defineConfig({
  // Static HTML uses the same page styles before JavaScript loads.
  build: { cssCodeSplit: false },
  plugins: [
    mdx({
      remarkPlugins: [remarkGfm, remarkFrontmatter],
      rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@content': path.resolve(__dirname, './content'),
    },
  },
  server: {
    fs: {
      deny: ['**/.git/**', '**/.env*', '**/*.{crt,pem}', '**/studio/**', '**/runtime/**'],
    },
    proxy: {
      '/api': {
        target: process.env.DEV_API_TARGET || 'http://localhost:8080',
        changeOrigin: true,
      },
      '/umami': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/umami/, ''),
      },
    },
  },
  test: {
    exclude: ['**/node_modules/**', '**/.git/**', 'studio/**'],
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: false,
  },
});

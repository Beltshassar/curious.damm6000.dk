import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { imagetools } from 'vite-imagetools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    // Project photos are full-resolution phone camera photos - resize/
    // recompress them at build time so adding a new one never requires
    // manually shrinking it first. Applies to every imported raster image by
    // default (nothing else in this project imports one this way).
    imagetools({
      defaultDirectives: () => new URLSearchParams({ w: '1280', quality: '70', withoutEnlargement: 'true' }),
    }),
  ],
  base: '/',
})

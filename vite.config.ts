<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
=======
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
>>>>>>> b56f4d0 (chore: setup husky + lint-staged (non blocking))

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
<<<<<<< HEAD
  base: './', // important pour que les chemins JS/CSS fonctionnent sur Netlify
})
=======
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
>>>>>>> b56f4d0 (chore: setup husky + lint-staged (non blocking))

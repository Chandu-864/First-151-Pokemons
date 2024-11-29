import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/First-151-Pokemons/', // Replace with your repository name
  plugins: [react()],
});

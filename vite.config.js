import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Chandu-s-Pokedex/', // Ensure this matches your repo name
  plugins: [react()]
});

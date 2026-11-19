import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages serves this project from its repository subpath.
  base: process.env.GITHUB_ACTIONS ? '/MINI-PROJECT/' : '/',
  plugins: [react()],
})

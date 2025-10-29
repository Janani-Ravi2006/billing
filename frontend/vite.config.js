import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './',   // 👈 Important! makes assets relative for Electron
  build: {
    outDir: "dist", // output folder (already fine)
  },
})

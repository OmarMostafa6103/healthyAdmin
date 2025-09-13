import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // use repo base only in production (GitHub Pages). Keeps dev server working at '/'.
  base: mode === 'production' ? '/healthyAdmin/' : '/',
  plugins: [react()],
  server: {
    port: 5174,
    strictPort: true,
  }
}))

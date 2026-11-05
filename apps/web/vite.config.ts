import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: { include: ['@job-tracker/shared'] },
  build: { commonjsOptions: { include: [/packages\/shared/, /node_modules/] } },
})

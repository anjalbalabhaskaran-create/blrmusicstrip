import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/blrmusicstrip/',
  plugins: [react({
    jsxRuntime: 'automatic' // This allows JSX without importing React
  })]
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.bin', '**/*.hdr', '**/*.mp3'],
  server: { port: 3000, open: true },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          three:  ['three'],
          r3f:    ['@react-three/fiber', '@react-three/drei'],
          rapier: ['@react-three/rapier'],
          react:  ['react', 'react-dom'],
          motion: ['framer-motion', 'gsap'],
          store:  ['zustand'],
        },
      },
    },
  },
})

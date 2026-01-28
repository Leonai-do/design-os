import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/ollama-cloud': {
            target: 'https://ollama.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/ollama-cloud/, ''),
          },
          '/lmstudio-proxy': {
              target: 'http://localhost:1234',
              changeOrigin: true,
              secure: false,
              rewrite: (path) => path.replace(/^\/lmstudio-proxy/, ''),
          }
        },
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom', 'react-router-dom'],
              'ui-vendor': ['framer-motion', 'lucide-react'],
              'syntax-highlighting': ['prismjs', 'react-simple-code-editor'],
              'genai': ['@google/genai'],
              'utils': ['jszip', 'html-to-image', 'file-saver', 'zod']
            }
          }
        }
      }
    };
});


import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],

    // Environment variables
    // Only variables prefixed with VITE_ will be exposed to your client source code
    define: {
      // For backwards compatibility with existing code using process.env
      'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
    },

    // Build configuration
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'terser',

      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            vendor: ['react', 'react-dom'],

            // AI/ML libraries
            genai: ['@google/genai'],

            // Document processing libraries
            documents: ['jspdf', 'docx', 'jszip', 'mammoth', 'pdfjs-dist']
          }
        }
      },

      // Increase chunk size warning limit (default is 500kb)
      chunkSizeWarningLimit: 1000,
    },

    // Development server configuration
    server: {
      port: 3000,
      open: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
    }
  };
});

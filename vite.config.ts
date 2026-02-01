
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

      // Terser options for better compression
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
        },
      },

      // Optimize chunk splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Core React libraries
            vendor: ['react', 'react-dom'],

            // AI/ML libraries
            genai: ['@google/genai'],

            // Auth library
            auth: ['@supabase/supabase-js'],

            // Document processing libraries
            documents: ['jspdf', 'docx', 'jszip', 'mammoth', 'pdfjs-dist']
          },
          // Optimize asset file names for better caching
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name?.split('.');
            const ext = info?.[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
              return `assets/images/[name]-[hash][extname]`;
            } else if (/woff2?|ttf|otf|eot/i.test(ext || '')) {
              return `assets/fonts/[name]-[hash][extname]`;
            }
            return `assets/[name]-[hash][extname]`;
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
        }
      },

      // Increase chunk size warning limit (default is 500kb)
      chunkSizeWarningLimit: 1000,

      // Enable CSS code splitting
      cssCodeSplit: true,
    },

    // Development server configuration
    server: {
      port: 3000,
      open: true,
    },

    // Preview server configuration
    preview: {
      port: 4173,
    },

    // Optimize dependencies
    optimizeDeps: {
      include: ['react', 'react-dom', '@google/genai', '@supabase/supabase-js'],
      exclude: ['pdfjs-dist'], // Large library, load on demand
    },
  };
});

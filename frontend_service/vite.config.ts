
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  if (mode === 'production') {
    if (!env.VITE_API_URL) {
      console.warn('\n⚠️  WARNING: VITE_API_URL is not set for production build.\n');
    } else if (!env.VITE_API_URL.startsWith('https://')) {
      console.warn(`\n⚠️  WARNING: VITE_API_URL should use HTTPS. Current: ${env.VITE_API_URL}\n`);
    }
  }
  
  return {
    plugins: [react()],
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    build: {
      target: 'esnext',
      outDir: 'build',
      // Performance: Enable minification and tree shaking
      minify: 'esbuild',
      // Performance: Code splitting for better caching
      rollupOptions: {
        output: {
          manualChunks: {
            // Vendor chunk - React core (cached separately)
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // UI library chunk
            'vendor-ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-checkbox',
              '@radix-ui/react-tabs',
              '@radix-ui/react-popover',
              '@radix-ui/react-slot',
            ],
            // Data fetching chunk
            'vendor-data': ['@tanstack/react-query', 'axios', 'zustand'],
          },
        },
      },
      // Performance: Increase chunk size warning limit
      chunkSizeWarningLimit: 500,
    },
    server: {
      port: 5173,  // Changed from 3000 to avoid conflict with API Gateway
      open: true,
      proxy: {
        // Proxy API requests to backend (development only)
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
          // Don't rewrite path - keep /api prefix
        }
      }
    },
    preview: {
      port: 4173,
      proxy: {
        // Proxy API requests to backend (preview mode)
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        }
      }
    },
  };
  });
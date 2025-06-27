// vite.config.ts

import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // THE UPDATE: The '@' alias now points directly to the '/src' folder.
      // This is the standard convention and makes for cleaner import paths
      // throughout your application (e.g., '@/components/...' instead of '@/src/components/...').
      '@': path.resolve(__dirname, './src'), 
    },
  },
  // The rest of your configuration is already perfect for a modern Vite setup
  // that uses `import.meta.env` for environment variables.
});
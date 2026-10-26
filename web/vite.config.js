import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// BASE_PATH：GitHub Pages 部署时设为 /fortune-site/；本地/自建服务器保持 /
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: 5188,
    fs: { allow: ['..'] }, // 允许引用仓库根目录的 shared/ 共用引擎
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  build: { outDir: 'dist' },
});

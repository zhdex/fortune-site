import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// BASE_PATH：GitHub Pages 部署时设为 /fortune-site/；本地/自建服务器保持 /
export default defineConfig({
  base: process.env.BASE_PATH || '/',
  plugins: [react()],
  resolve: {
    // shared/ 位于仓库根目录，其 import 需从 web/ 自己的安装目录解析，
    // 否则 CI 上（只安装 web/node_modules）会报 Rollup failed to resolve import。
    alias: {
      'lunar-javascript': path.resolve(__dirname, 'node_modules/lunar-javascript'),
      iztro: path.resolve(__dirname, 'node_modules/iztro'),
    },
  },
  server: {
    port: 5188,
    fs: { allow: ['..'] }, // 允许引用仓库根目录的 shared/ 共用引擎
    proxy: {
      '/api': { target: 'http://localhost:8787', changeOrigin: true },
    },
  },
  build: { outDir: 'dist' },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
// import { Apis } from './src/api/api';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     '/vapi': {
  //       target: "https://vidsrc.to",
  //       changeOrigin: true,
  //       secure: true,
  //       rewrite: (path) => path.replace(/^\/vapi/, ''),
  //     },
  //   },
  // },
});

import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    proxy: {
      '/gfonts-css': {
        target: 'https://fonts.googleapis.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gfonts-css/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('User-Agent', 'Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_5_8) AppleWebKit/531.21.8 Version/4.0.4 Safari/531.21.10');
          });
        }
      },
      '/gfonts-file': {
        target: 'https://fonts.gstatic.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/gfonts-file/, ''),
      }
    }
  }
})

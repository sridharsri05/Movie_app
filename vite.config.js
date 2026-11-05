/* global process */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import sitemapPlugin from 'vite-plugin-sitemap';
import axios from 'axios';
import fs from 'fs/promises';
import https from 'https';

const hostname = 'https://movienexus-ruddy-nine.vercel.app';
const staticRoutes = [
    '/', '/signup', '/forgot-password', '/reset-password/:token',
    '/dashboard', '/dashboard/profile', '/dashboard/tvShows',
    '/dashboard/PrivacyPolicy', '/dashboard/DMCA',
    '/dashboard/searchResults/:query', '/admindashboard', '/unauthorized',
];

async function fetchDynamicRoutes() {
    // Build-time only (never shipped to the browser). Without a key, fall back to movie-routes.json.
    const apiKey = process.env.TMDB_API_KEY;
    try {
        if (!apiKey) throw new Error('TMDB_API_KEY not set');
        const url = `https://api.themoviedb.org/3/movie/popular?api_key=${apiKey}`;
        const response = await axios.get(url, {
            timeout: 8000,
            httpsAgent: new https.Agent({ keepAlive: true }),
        });

        const routes = response.data.results.map(
            movie => `/dashboard/movie/${movie.id}`
        );
        await fs.writeFile('./movie-routes.json', JSON.stringify(routes, null, 2));
        return routes;
    } catch (error) {
        console.warn('⚠️ TMDB fetch failed, using fallback if available.');
        try {
            const fallback = await fs.readFile('./movie-routes.json', 'utf-8');
            return JSON.parse(fallback);
        } catch {
            return [];
        }
    }
}

export default defineConfig(async () => {
    const dynamicRoutes = await fetchDynamicRoutes();
    return {
        plugins: [
            react(),
            sitemapPlugin({
                hostname,
                routes: [...staticRoutes, ...dynamicRoutes],
            }),
        ],
        build: {
            rollupOptions: {
                output: {
                    manualChunks(id) {
                        if (!id.includes('node_modules')) return undefined;
                        if (/node_modules\/(react|react-dom|react-router|react-router-dom|scheduler|@remix-run)\//.test(id)) return 'vendor-react';
                        if (/node_modules\/(@reduxjs|redux|redux-persist|react-redux|reselect|immer|redux-thunk)\//.test(id)) return 'vendor-redux';
                        if (/node_modules\/(framer-motion|motion-dom|motion-utils)\//.test(id)) return 'vendor-motion';
                        if (/node_modules\/(swiper|ssr-window|dom7)\//.test(id)) return 'vendor-swiper';
                        if (/node_modules\/(@firebase|firebase)\//.test(id)) return 'vendor-firebase';
                        return undefined;
                    },
                },
            },
        },
        server: {
            proxy: {
                '/api': {
                    target: 'http://localhost:3001',
                    changeOrigin: true,
                    secure: false,
                },
            },
        },
    };
});

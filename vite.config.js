import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import sitemapPlugin from 'vite-plugin-sitemap';
import axios from 'axios';
import fs from 'fs/promises';
import https from 'https';
import { Apis } from './src/api/api';

const hostname = 'https://movienexus-ruddy-nine.vercel.app';
const staticRoutes = [
    '/', '/signup', '/forgot-password', '/reset-password/:token',
    '/dashboard', '/dashboard/profile', '/dashboard/tvShows',
    '/dashboard/PrivacyPolicy', '/dashboard/DMCA',
    '/dashboard/searchResults/:query', '/admindashboard', '/unauthorized',
];

async function fetchDynamicRoutes() {
    const url = `https://api.themoviedb.org/3/movie/popular?api_key=${Apis.apiKey}`;

    try {
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

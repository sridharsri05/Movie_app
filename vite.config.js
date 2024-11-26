import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import sitemapPlugin from 'vite-plugin-sitemap';
import { Apis } from './src/api/api';
import axios from 'axios';


const hostname = 'https://movienexus-ruddy-nine.vercel.app'
const staticRoutes = [
    '/',                       // Login page
    '/signup',                 // Signup page
    '/forgot-password',        // Forgot Password page
    '/reset-password/:token',  // Reset Password
    '/dashboard',              // User Dashboard
    '/dashboard/profile',      // User Profile
    '/dashboard/tvShows',      // TV Shows
    '/dashboard/PrivacyPolicy',// Privacy Policy
    '/dashboard/DMCA',         // DMCA Policy
    '/dashboard/searchResults/:query', // Search Results
    '/admindashboard',         // Admin Dashboard
    '/unauthorized',
]
async function fetchDynamicRoutes() {
    try {
        // Replace with your backend or TMDB API endpoint to get movie details
        const response = await axios.get(`https://api.themoviedb.org/3/movie/popular?api_key=${Apis.apiKey}`);
        const data = response.data;

        // Map movie details to dynamic URLs, such as `/movie/{id}`
        return data.results.map((movie) => `/dashboard/movie/${movie.id}`);
    } catch (error) {
        console.error('Error fetching dynamic routes:', error);
        return []; // Return an empty array if the API request fails
    }
}


export default defineConfig(async () => {
    const dynamicRoutes = await fetchDynamicRoutes();
    const routes = [...staticRoutes, ...dynamicRoutes];
    return {
        plugins: [
            react(),
            sitemapPlugin({
                hostname,
                routes,
            })
        ],
    }
});

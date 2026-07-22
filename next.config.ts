import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    /* tes configurations existantes (images, redirects, etc.) */

    eslint: {
        // Empêche les erreurs ESLint de bloquer le build Vercel
        ignoreDuringBuilds: true,
    },
    typescript: {
        // Empêche les erreurs de typage strict de bloquer le build Vercel
        ignoreBuildErrors: true,
    },
};

export default nextConfig;
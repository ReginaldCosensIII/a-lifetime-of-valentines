import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['pwa-icons/ltv-wpa-icon-180x180.png'],
            manifest: {
                name: 'A Lifetime of Valentines',
                short_name: 'Valentines',
                description: 'A shared timeline of love and memories.',
                theme_color: '#fff9fa',
                background_color: '#fff9fa',
                display: 'standalone',
                orientation: 'portrait',
                icons: [
                    {
                        src: 'pwa-icons/ltv-wpa-icon-192x192.png',
                        sizes: '192x192',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'pwa-icons/ltv-wpa-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any'
                    },
                    {
                        src: 'pwa-icons/ltv-wpa-icon-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'maskable' // Attempting maskable, but reused the standard icon per user request
                    }
                ]
            }
        })
    ],
    server: {
        host: true, // Enables network access
    }
})

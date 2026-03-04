import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function loadCert() {
    const certDir = path.resolve(__dirname, '.cert')
    const keyFile = path.join(certDir, 'key.pem')
    const certFile = path.join(certDir, 'cert.pem')
    if (fs.existsSync(keyFile) && fs.existsSync(certFile)) {
        return { key: fs.readFileSync(keyFile), cert: fs.readFileSync(certFile) }
    }
    return undefined
}

export default defineConfig(({ mode }) => {
    const isSSL = mode === 'ssl' || process.env.VITE_SSL === 'true'

    return {
        plugins: [react()],
        server: {
            port: 4300,
            host: isSSL ? 'dvag-demo.com' : 'localhost',
            open: true,
            https: isSSL ? loadCert() : undefined,
            cors: {
                origin: '*',
                credentials: false,
                methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
                allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
            },
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With'
            }
        },
        build: {
            outDir: 'dist'
        }
    }
})

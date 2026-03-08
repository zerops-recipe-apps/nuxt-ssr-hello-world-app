import pg from 'pg'

const { Pool } = pg

// Database connection pool - reused across requests
let pool: InstanceType<typeof Pool> | null = null

function getPool() {
  if (!pool) {
    pool = new Pool({
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT) || 5432,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  }
  return pool
}

export default defineEventHandler(async (event) => {
  // Build-time constants embedded via nuxt.config.ts runtimeConfig
  const config = useRuntimeConfig()

  let dbStatus = 'OK'
  let greeting = 'Hello from Zerops!'
  let httpStatus = 200

  // Test real database connectivity and query migrated data
  try {
    const client = await getPool().connect()
    try {
      const result = await client.query(
        'SELECT message FROM greetings LIMIT 1'
      )
      if (result.rows.length > 0) {
        greeting = result.rows[0].message
      }
    } finally {
      client.release()
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    dbStatus = `ERROR: ${message}`
    httpStatus = 503
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Nuxt SSR — Zerops</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #0f0f13;
      color: #e8e8f0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex;
      justify-content: center;
      align-items: flex-start;
      min-height: 100vh;
      padding: 60px 16px;
    }
    .card {
      width: 100%;
      max-width: 560px;
    }
    .logos {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-bottom: 32px;
    }
    .logos svg { flex-shrink: 0; }
    .sep {
      width: 1px;
      height: 36px;
      background: #3a3a50;
    }
    h1 {
      font-size: 2rem;
      font-weight: 700;
      letter-spacing: -0.02em;
      margin-bottom: 6px;
      color: #ffffff;
    }
    .subtitle {
      font-size: 0.875rem;
      color: #8888a8;
      margin-bottom: 32px;
    }
    .details {
      background: #1a1a24;
      border: 1px solid #2a2a3c;
      border-radius: 12px;
      overflow: hidden;
    }
    .row {
      display: flex;
      align-items: baseline;
      padding: 14px 20px;
      gap: 16px;
      border-bottom: 1px solid #2a2a3c;
    }
    .row:last-child { border-bottom: none; }
    .label {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      color: #6060808;
      width: 140px;
      flex-shrink: 0;
      color: #60608a;
    }
    .value {
      font-size: 0.875rem;
      color: #c8c8e0;
      font-family: 'SF Mono', 'Fira Mono', monospace;
      word-break: break-all;
    }
    .value.ok { color: #4ade80; }
    .value.error { color: #f87171; }
  </style>
</head>
<body>
  <div class="card">
    <div class="logos">
      <!-- Nuxt logo -->
      <svg width="48" height="32" viewBox="0 0 64 42" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M36.14 41.999H58.64c.68 0 1.35-.18 1.93-.52.58-.35 1.05-.84 1.38-1.43.32-.59.47-1.25.44-1.91a3.58 3.58 0 0 0-.56-1.88L47.73 14.22a3.55 3.55 0 0 0-1.33-1.3 3.6 3.6 0 0 0-3.68.01 3.55 3.55 0 0 0-1.32 1.32L38.62 18l-5.92-10.22A3.56 3.56 0 0 0 31.37 6.5a3.6 3.6 0 0 0-3.67 0 3.56 3.56 0 0 0-1.33 1.3L2.18 36.22a3.58 3.58 0 0 0-.56 1.88c-.03.66.12 1.32.44 1.91.33.59.8 1.08 1.38 1.43.58.34 1.25.52 1.93.52h15.26c6.03 0 10.5-2.62 13.51-7.73l7.44-12.9 3.76 6.52-6.82 11.79c-2.97 5-6.06 7.37-10.38 7.37Zm-14.25-7.28-9.13.01 16.22-28.06 4.5 7.78-7.17 12.41c-2.04 3.5-3.62 7.87-4.42 7.86Z" fill="#00DC82"/>
      </svg>
      <div class="sep"></div>
      <!-- Zerops wordmark -->
      <svg width="96" height="20" viewBox="0 0 120 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <text x="0" y="20" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="20" font-weight="700" fill="#e8e8f0">zerops</text>
      </svg>
    </div>

    <h1>${escapeHtml(greeting)}</h1>
    <p class="subtitle">Nuxt running on Zerops SSR — Node.js at runtime.</p>

    <div class="details">
      <div class="row">
        <span class="label">Framework</span>
        <span class="value">Nuxt ${escapeHtml(config.nuxtVersion as string)}</span>
      </div>
      <div class="row">
        <span class="label">Environment</span>
        <span class="value">${escapeHtml(process.env.NODE_ENV || 'production')}</span>
      </div>
      <div class="row">
        <span class="label">Build time</span>
        <span class="value">${escapeHtml(config.buildTime as string)}</span>
      </div>
      <div class="row">
        <span class="label">Database</span>
        <span class="value ${httpStatus === 200 ? 'ok' : 'error'}">${escapeHtml(dbStatus)}</span>
      </div>
    </div>
  </div>
</body>
</html>`

  setResponseStatus(event, httpStatus)
  setResponseHeader(event, 'Content-Type', 'text/html; charset=utf-8')
  return html
})

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

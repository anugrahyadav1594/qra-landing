/** @type {import('next').NextConfig} */

// The browser always calls same-origin `/api/v1/...`; Next proxies those
// requests to the FastAPI backend (BACKEND_URL, default localhost:8000).
// This keeps CORS out of the picture and works behind any host/proxy.
const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  // CSP / frame guards only in production builds — the local dev server and
  // preview environments embed the app and need to stay embeddable (§15.10).
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  async headers() {
    if (process.env.NODE_ENV !== "production") return [];
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

module.exports = nextConfig;

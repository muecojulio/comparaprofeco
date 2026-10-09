const esDesarrollo = process.env.NODE_ENV !== "production";

/*
 * Política de contenido: sólo se permiten los orígenes que la app usa de verdad.
 *  · fonts.googleapis.com / fonts.gstatic.com → tipografía DM Sans
 *  · image.pollinations.ai → fotos ilustrativas de cada ficha
 *  · api.qrserver.com → código QR de la pantalla Instalar
 * Las llamadas de datos van siempre al propio servidor (connect-src 'self').
 * Next.js necesita 'unsafe-inline' para su hidratación; no se usa eval en producción.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${esDesarrollo ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https://image.pollinations.ai https://api.qrserver.com",
  "connect-src 'self'",
  "manifest-src 'self'",
  "worker-src 'self'",
  "frame-ancestors 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests"
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cache-Control", value: "public, max-age=60, stale-while-revalidate=600" }
        ]
      },
      {
        source: "/api/:path*",
        headers: [
          { key: "Cache-Control", value: "public, s-maxage=300, stale-while-revalidate=1800" }
        ]
      }
    ];
  }
};

export default nextConfig;

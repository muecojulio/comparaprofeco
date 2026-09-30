import "./globals.css";
import Shell from "./components/Shell";

export const metadata = {
  title: "ComparaProfeco",
  description:
    "App familiar con comparativos de la Revista del Consumidor: qué cumple, qué no y cuál destaca.",
  manifest: "/manifest.json",
  applicationName: "ComparaProfeco",
  appleWebApp: {
    capable: true,
    title: "ComparaProfeco",
    statusBarStyle: "black-translucent"
  },
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
  other: {
    "mobile-web-app-capable": "yes"
  }
};

export const viewport = {
  themeColor: "#0b3d2e",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover"
};

export default function RootLayout({ children }) {
  return (
    <html lang="es-MX">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon.svg" />
      </head>
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/components/auth-provider";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXTAUTH_URL || "https://homeoclinic-ia.com"
  ),
  title: {
    default: "HomeoClinic Pro",
    template: "%s | HomeoClinic Pro",
  },
  description:
    "Plataforma profissional para clínicas homeopáticas. Prontuário eletrônico, repertório com 188 mil rubricas, repertorização avançada, matéria médica e gestão completa — tudo em conformidade com a LGPD.",
  keywords: [
    "homeopatia",
    "prontuário eletrônico",
    "repertório homeopático",
    "repertorização",
    "LGPD",
    "clínica homeopática",
    "matéria médica",
  ],
  authors: [{ name: "HomeoClinic Pro" }],
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.svg",
    apple: "/icons/icon-192.svg",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "HomeoClinic Pro",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "HomeoClinic Pro",
    title: "HomeoClinic Pro — Prontuário Eletrônico Homeopático",
    description:
      "O maior repertório homeopático em português com 188 mil rubricas. Repertorização avançada, matéria médica completa e gestão de clínica — LGPD compliant.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "HomeoClinic Pro — A plataforma clínica de homeopatia mais completa do Brasil",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeoClinic Pro",
    description:
      "Plataforma profissional para clínicas homeopáticas com repertório de 188 mil rubricas.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <meta name="theme-color" content="#0d9488" />
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && location.hostname !== 'localhost') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js');
                });
              }
              // PWA Install Prompt
              var deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                deferredPrompt = e;
                if (localStorage.getItem('pwa-install-dismissed')) return;
                var banner = document.createElement('div');
                banner.id = 'pwa-install-banner';
                banner.style.cssText = 'position:fixed;bottom:20px;left:50%;transform:translateX(-50%);z-index:9999;background:#111118;border:1px solid rgba(20,184,166,0.3);border-radius:12px;padding:12px 20px;display:flex;align-items:center;gap:12px;box-shadow:0 8px 32px rgba(0,0,0,0.4);max-width:420px;width:calc(100%-40px)';
                banner.innerHTML = '<div style="flex:1"><p style="color:#e5e5e5;font-size:14px;font-weight:600;margin:0">Instalar HomeoClinic Pro</p><p style="color:#9ca3af;font-size:12px;margin:4px 0 0">Acesse mais rapido como app no seu dispositivo</p></div><button id="pwa-install-btn" style="background:#14b8a6;color:#fff;border:none;border-radius:8px;padding:8px 16px;font-size:13px;font-weight:600;cursor:pointer;white-space:nowrap">Instalar</button><button id="pwa-dismiss-btn" style="background:none;border:none;color:#6b7280;font-size:18px;cursor:pointer;padding:4px">x</button>';
                document.body.appendChild(banner);
                document.getElementById('pwa-install-btn').onclick = function() {
                  deferredPrompt.prompt();
                  deferredPrompt.userChoice.then(function() { banner.remove(); });
                };
                document.getElementById('pwa-dismiss-btn').onclick = function() {
                  banner.remove();
                  localStorage.setItem('pwa-install-dismissed', '1');
                };
              });
            `,
          }}
        />
      </body>
    </html>
  );
}

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
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "HomeoClinic Pro",
    title: "HomeoClinic Pro — Prontuário Eletrônico Homeopático",
    description:
      "O maior repertório homeopático em português com 188 mil rubricas. Repertorização avançada, matéria médica completa e gestão de clínica — LGPD compliant.",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeoClinic Pro",
    description:
      "Plataforma profissional para clínicas homeopáticas com repertório de 188 mil rubricas.",
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
      <body className={`${inter.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/components/ui/app-providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://spartanfit.app"),
  title: {
    default: "SpartanFit | Fitness y coaching con IA",
    template: "%s",
  },
  description:
    "Plataforma de fitness con IA para registrar entrenamientos, visualizar progreso y optimizar tus resultados.",
  icons: {
    icon: "/icon.png",
    apple: "/icon.png",
  },
  openGraph: {
    title: "SpartanFit",
    description:
      "Entrenamiento inteligente con seguimiento de progreso y coaching asistido por IA.",
    type: "website",
    locale: "es_CO",
    images: [{ url: "/icon.png", width: 512, height: 512, alt: "Logo de SpartanFit" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-zinc-950 font-sans text-zinc-100 antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}


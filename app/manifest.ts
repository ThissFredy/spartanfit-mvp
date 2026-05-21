import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SpartanFit MVP",
    short_name: "SpartanFit",
    description:
      "Plataforma de fitness con seguimiento de progreso y coaching asistido por IA.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0a0b",
    theme_color: "#c22524",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Minimil",
    short_name: "Minimil",
    description:
      "A sleek and minimal Next.js starter template, optimized for performance and rapid development.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#FFFFFF",
    orientation: "portrait",
    icons: [
      {
        src: "icons/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "icons/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
    ],
  };
}

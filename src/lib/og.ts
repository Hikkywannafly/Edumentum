import type { Metadata } from "next";

const APP_NAME = "Minimil";
const APP_DEFAULT_TITLE = "Minimil";
const APP_TITLE_TEMPLATE = "%s - Minimil";
const APP_DESCRIPTION =
  "A sleek and minimal Next.js starter template, optimized for performance and rapid development.";

export const OpenGraph: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      {
        media: "(prefers-color-scheme: light)",
        url: "/icons/favicon-light.ico",
        href: "/icons/favicon-light.ico",
      },
      {
        media: "(prefers-color-scheme: dark)",
        url: "/icons/favicon.ico",
        href: "/icons/favicon.ico",
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  keywords: [
    "Next.js PWA",
    "Next.js 15 PWA Template",
    "Minimal PWA",
    "Tailwind CSS",
    "Serwist",
    "React",
    "Starter Template",
    "Offline Support",
    "Fast and Lightweight",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

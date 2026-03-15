import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/patients",
          "/repertory",
          "/settings",
          "/api",
          "/audit",
          "/lgpd",
          "/financial",
          "/agenda",
          "/onboarding",
        ],
      },
    ],
    sitemap: "https://homeoclinic-ia.com/sitemap.xml",
  };
}

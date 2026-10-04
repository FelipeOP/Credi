import type { MetadataRoute } from "next";

export const dynamic = "force-static";
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (!origin) return [];
  return [
    "/credito/",
    "/abonos/",
    "/inversion/",
    "/ingresos/",
    "/metodologia/",
    "/privacidad/",
  ].map((path) => ({
    url: `${origin}${path}`,
    changeFrequency: "monthly",
    priority: path === "/privacidad/" ? 0.3 : 0.8,
  }));
}

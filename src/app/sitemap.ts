import type { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

export const revalidate = 3600; // revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://hso2.connectionscuracao.net";
  const supabase = await createClient();

  const { data: phones } = await supabase
    .from("phones")
    .select("id, updated_at")
    .eq("status", "available")
    .not("reference", "like", "TEST-%")
    .order("updated_at", { ascending: false });

  const phoneEntries: MetadataRoute.Sitemap = (phones ?? []).map((phone) => ({
    url: `${base}/phones/${phone.id}`,
    lastModified: phone.updated_at,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [
    {
      url: base,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${base}/phones`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...phoneEntries,
  ];
}

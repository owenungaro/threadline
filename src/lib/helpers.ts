import { load } from "cheerio";

export function stripHtml(html?: string | null): string | null {
  if (!html) return null;
  const $ = load(html);
  return $.text().replace(/\s+/g, " ").trim() || null;
}

export function extractImageUrl(item: any): string | null {
  if (item.enclosure?.url) return item.enclosure.url;

  if (item["media:content"]?.[0]?.["$"]?.url) {
    return item["media:content"][0]["$"].url;
  }

  if (item["media:thumbnail"]?.[0]?.["$"]?.url) {
    return item["media:thumbnail"][0]["$"].url;
  }

  if (item.content) {
    const $ = load(item.content);
    return $("img").first().attr("src") || null;
  }

  return null;
}

export function safeDate(input?: string): string | null {
  if (!input) return null;
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export function makeId(source: string, url: string) {
  return `${source}:${url}`;
}

export function formatPublishedAt(publishedAt: string | null): string {
  if (!publishedAt) return "Unknown date";
  const d = new Date(publishedAt);
  if (isNaN(d.getTime())) return "Unknown date";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
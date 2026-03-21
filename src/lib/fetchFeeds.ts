import Parser from "rss-parser";
import { Article, SourceName } from "@/types";
import { stripHtml, extractImageUrl, safeDate, makeId } from "./helpers";

const parser = new Parser({
  customFields: {
    item: [
      ["media:content", "media:content", { keepArray: true }],
      ["media:thumbnail", "media:thumbnail", { keepArray: true }],
      ["content:encoded", "content"],
    ],
  },
});

const FEEDS: { source: SourceName; url: string }[] = [
  { source: "Fox News", url: "https://moxie.foxnews.com/google-publisher/latest.xml" },
  { source: "NPR", url: "https://feeds.npr.org/1001/rss.xml" },
  { source: "BBC", url: "https://feeds.bbci.co.uk/news/rss.xml" },
  { source: "New York Times", url: "https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml" },
  { source: "Daily Wire", url: "https://www.dailywire.com/feeds/rss.xml" },
];

function normalizeCategories(input: unknown): string[] {
  if (!Array.isArray(input)) return [];

  return input
    .map((c) => {
      if (typeof c === "string") return c.trim();

      if (c && typeof c === "object") {
        if ("name" in c && typeof (c as any).name === "string") {
          return (c as any).name.trim();
        }

        if ("_" in c && typeof (c as any)._ === "string") {
          return (c as any)._.trim();
        }
      }

      return "";
    })
    .filter(Boolean);
}

function normalize(item: any, source: SourceName): Article | null {
  if (!item.title || !item.link) return null;

  return {
    id: makeId(source, item.link),
    title: item.title.trim(),
    url: item.link,
    source,
    publishedAt: safeDate(item.isoDate || item.pubDate),
    description:
      stripHtml(item.contentSnippet) ||
      stripHtml(item.content) ||
      stripHtml(item.description),
    imageUrl: extractImageUrl(item),
    categories: normalizeCategories(item.categories),
  };
}

async function fetchOne(source: SourceName, url: string): Promise<Article[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items
      .map((item) => normalize(item, source))
      .filter(Boolean) as Article[];
  } catch (e) {
    console.error("Feed failed:", source);
    return [];
  }
}

function dedupe(articles: Article[]) {
  const seen = new Set();
  return articles.filter((a) => {
    if (seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

export async function fetchAllArticles(): Promise<Article[]> {
  const results = await Promise.all(
    FEEDS.map((f) => fetchOne(f.source, f.url))
  );

  const merged = results.flat();
  const unique = dedupe(merged);

  return unique.sort((a, b) => {
    const t1 = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
    const t2 = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
    return t2 - t1;
  });
}

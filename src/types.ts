export type SourceName =
  | "Fox News"
  | "NPR"
  | "BBC"
  | "New York Times"
  | "Daily Wire";

export type Article = {
  id: string;
  title: string;
  url: string;
  source: SourceName;
  publishedAt: string | null;
  description: string | null;
  imageUrl: string | null;
  categories: string[];
};
import { NextResponse } from "next/server";
import { fetchAllArticles } from "@/lib/fetchFeeds";
import { groupByTopic } from "@/lib/topics";

export async function GET() {
  const articles = await fetchAllArticles();
  const topics = groupByTopic(articles);

  return NextResponse.json({ topics });
}
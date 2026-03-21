import { NextResponse } from "next/server";
import { fetchAllArticles } from "@/lib/fetchFeeds";

export async function GET() {
  const articles = await fetchAllArticles();
  return NextResponse.json({ articles });
}
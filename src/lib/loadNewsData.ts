import fs from "fs/promises";
import path from "path";

export async function loadNewsData() {
  const filePath = path.join(process.cwd(), "public", "data", "news.json");
  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file);
}
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import fs from "fs/promises";
import path from "path";
import { buildNewsData } from "../src/lib/buildNewsData";

async function main() {
  console.log("OPENAI KEY FOUND:", !!process.env.OPENAI_API_KEY);

  const data = await buildNewsData();

  const outputDir = path.join(process.cwd(), "public", "data");
  const outputFile = path.join(outputDir, "news.json");

  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(outputFile, JSON.stringify(data, null, 2), "utf-8");

  console.log(`Wrote ${outputFile}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
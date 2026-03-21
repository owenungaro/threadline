import OpenAI from "openai";
import type { Article } from "@/types";

type SubtopicResult = {
  subtopics: Array<{
    label: string;
    articleIds: string[];
  }>;
};

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY");
  }

  return new OpenAI({ apiKey });
}

function normalizeLabel(label: string) {
  return label.trim().replace(/\s+/g, " ");
}

export async function generateSubtopicsWithAI(
  topic: string,
  articles: Article[]
): Promise<Record<string, Article[]>> {
  if (articles.length === 0) {
    return {};
  }

  const client = getOpenAIClient();

  const compactArticles = articles.map((a) => ({
    id: a.id,
    title: a.title,
    source: a.source,
    description: a.description ?? "",
    publishedAt: a.publishedAt ?? "",
  }));

  const response = await client.responses.create({
    model: "gpt-4.1-mini",
    input: [
      {
        role: "system",
        content: [
          {
            type: "input_text",
            text:
              "You group news articles into meaningful subtopics inside a broader news topic. " +
              "Return 2 to 5 subtopics when possible. " +
              "Use short, human-readable labels that describe an actual story angle. " +
              "Do not use vague or generic labels like 'Other', 'Misc', 'Thursday', 'Today', 'First', or 'One'. " +
              "Group articles by shared story or angle, not by random repeated words. " +
              "Every article id must appear in exactly one subtopic. " +
              "Return valid JSON only.",
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: JSON.stringify({
              topic,
              articles: compactArticles,
            }),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_schema",
        name: "subtopic_groups",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            subtopics: {
              type: "array",
              minItems: 1,
              maxItems: 5,
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  label: {
                    type: "string",
                  },
                  articleIds: {
                    type: "array",
                    items: {
                      type: "string",
                    },
                  },
                },
                required: ["label", "articleIds"],
              },
            },
          },
          required: ["subtopics"],
        },
      },
    },
  });

  const parsed = JSON.parse(response.output_text) as SubtopicResult;

  const byId = new Map(articles.map((a) => [a.id, a]));
  const grouped: Record<string, Article[]> = {};
  const used = new Set<string>();

  for (const subtopic of parsed.subtopics) {
    const label = normalizeLabel(subtopic.label);
    if (!label) continue;

    const groupedArticles = subtopic.articleIds
      .map((id) => byId.get(id))
      .filter((article): article is Article => Boolean(article));

    if (groupedArticles.length === 0) continue;

    if (!grouped[label]) {
      grouped[label] = [];
    }

    for (const article of groupedArticles) {
      if (used.has(article.id)) continue;
      grouped[label].push(article);
      used.add(article.id);
    }

    if (grouped[label].length === 0) {
      delete grouped[label];
    }
  }

  const leftovers = articles.filter((a) => !used.has(a.id));
  if (leftovers.length > 0) {
    grouped["Other Coverage"] = leftovers;
  }

  if (Object.keys(grouped).length === 0) {
    return {
      "Other Coverage": articles,
    };
  }

  return grouped;
}
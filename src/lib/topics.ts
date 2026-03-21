import { Article } from "@/types";
import winkNLP from "wink-nlp";
import model from "wink-eng-lite-web-model";

const nlp = winkNLP(model);

export type Topic =
  | "Politics"
  | "World"
  | "Technology"
  | "Business"
  | "Science"
  | "Entertainment"
  | "Sports"
  | "Other";

const TOPIC_LABELS: Topic[] = [
  "Politics",
  "World",
  "Technology",
  "Business",
  "Science",
  "Entertainment",
  "Sports",
];

let zeroShotClassifierPromise: Promise<any> | null = null;

async function getZeroShotClassifier() {
  if (!zeroShotClassifierPromise) {
    zeroShotClassifierPromise = (async () => {
      const { pipeline, env } = await import("@huggingface/transformers");

      // Keeps things simpler in Node and avoids browser-only assumptions.
      env.allowLocalModels = false;

      return pipeline(
        "zero-shot-classification",
        "Xenova/nli-deberta-v3-xsmall"
      );
    })();
  }

  return zeroShotClassifierPromise;
}

function buildArticleText(article: Article) {
  return [article.title, article.description ?? "", article.categories.join(" ")]
    .filter(Boolean)
    .join(". ");
}

function mapLabelToTopic(label: string): Topic {
  const normalized = label.toLowerCase();

  if (normalized.includes("politic")) return "Politics";
  if (normalized.includes("world")) return "World";
  if (normalized.includes("tech")) return "Technology";
  if (normalized.includes("business")) return "Business";
  if (normalized.includes("science")) return "Science";
  if (normalized.includes("entertainment")) return "Entertainment";
  if (normalized.includes("sports")) return "Sports";

  return "Other";
}

async function classifyArticleTopic(article: Article): Promise<Topic> {
  const classifier = await getZeroShotClassifier();
  const text = buildArticleText(article);

  if (!text.trim()) return "Other";

  const result = await classifier(text, TOPIC_LABELS, {
    multi_label: false,
    hypothesis_template: "This article is about {}.",
  });

  const bestLabel = result?.labels?.[0];
  const bestScore = result?.scores?.[0] ?? 0;

  if (!bestLabel || bestScore < 0.35) {
    return "Other";
  }

  return mapLabelToTopic(bestLabel);
}

export async function groupByTopic(articles: Article[]) {
  const grouped: Record<Topic, Article[]> = {
    Politics: [],
    World: [],
    Technology: [],
    Business: [],
    Science: [],
    Entertainment: [],
    Sports: [],
    Other: [],
  };

  console.log("groupByTopic article count:", articles.length);

  const classified = await Promise.all(
    articles.map(async (article) => {
      try {
        const topic = await classifyArticleTopic(article);
        console.log("classified:", article.title, "=>", topic);
        return { article, topic };
      } catch (err) {
        console.error("classification failed for:", article.title, err);
        return { article, topic: "Other" as Topic };
      }
    })
  );

  console.log("classified count:", classified.length);

  for (const { article, topic } of classified) {
    grouped[topic].push(article);
  }

  console.log(
    "grouped counts:",
    Object.fromEntries(
      Object.entries(grouped).map(([k, v]) => [k, v.length])
    )
  );

  for (const topic of Object.keys(grouped) as Topic[]) {
    grouped[topic].sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
  }

  return grouped;
}

const ENTITY_STOPWORDS = new Set([
  "The",
  "A",
  "An",
  "This",
  "That",
  "These",
  "Those",
  "New",
  "Latest",
  "Live",
  "Watch",
  "Video",
  "Report",
  "Reports",
  "Analysis",
  "Opinion",
  "Today",
  "Tonight",
  "Week",
  "Weeks",
  "Day",
  "Days",
  "Year",
  "Years",

  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",

  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",

  "First",
  "Second",
  "Third",
  "One",
  "Two",
  "Three",
  "This Year",
  "Last Year",
  "Next Year",
  "This Week",
  "Last Week",
  "Breaking News",
  "Top Stories",
]);

function normalizeEntity(entity: string) {
  return entity.trim().replace(/\s+/g, " ").toLowerCase();
}

function isUsableEntity(value: string) {
  if (!value) return false;
  if (value.length < 4) return false;
  if (ENTITY_STOPWORDS.has(value)) return false;
  if (/^\d+$/.test(value)) return false;
  if (/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/i.test(value)) return false;
  if (/^(first|second|third|one|two|three)$/i.test(value)) return false;
  if (/^(this year|last year|next year|this week|last week)$/i.test(value)) return false;
  return true;
}

function extractEntities(article: Article): string[] {
  const text = buildArticleText(article);
  const doc = nlp.readDoc(text);

  const raw = doc.entities().out() as any[];

  const entities = raw
    .map((e) => {
      if (typeof e === "string") return e;
      if (e && typeof e.value === "string") return e.value;
      return "";
    })
    .filter(Boolean);

  const filtered = entities
    .map(normalizeEntity)
    .filter(isUsableEntity);

  return Array.from(new Set(filtered));
}

function buildEntityScores(articles: Article[]) {
  const entityToArticles = new Map<string, Set<string>>();
  const entityToSources = new Map<string, Set<string>>();

  for (const article of articles) {
    const entities = extractEntities(article);

    for (const entity of entities) {
      if (!entityToArticles.has(entity)) entityToArticles.set(entity, new Set());
      if (!entityToSources.has(entity)) entityToSources.set(entity, new Set());

      entityToArticles.get(entity)!.add(article.id);
      entityToSources.get(entity)!.add(article.source);
    }
  }

  return Array.from(entityToArticles.entries())
    .map(([entity, articleIds]) => {
      const articleCount = articleIds.size;
      const sourceCount = entityToSources.get(entity)?.size ?? 0;

      let score = articleCount * 2 + sourceCount * 3;
      if (entity.includes(" ")) score += 1;

      return {
        entity,
        articleCount,
        sourceCount,
        score,
      };
    })
    .filter((item) => item.articleCount >= 2)
    .sort((a, b) => b.score - a.score);
}

function chooseTopEntities(articles: Article[], maxSubtopics = 5): string[] {
  const scored = buildEntityScores(articles);
  const selected: string[] = [];

  for (const item of scored) {
    if (selected.length >= maxSubtopics) break;

    const duplicateish = selected.some(
      (existing) =>
        existing === item.entity ||
        existing.includes(item.entity) ||
        item.entity.includes(existing)
    );

    if (!duplicateish) {
      selected.push(item.entity);
    }
  }

  return selected;
}

function scoreArticleForEntity(article: Article, entity: string): number {
  const text = buildArticleText(article).toLowerCase();
  const entityLower = entity.toLowerCase();

  let score = 0;

  if (text.includes(entityLower)) score += 4;

  for (const part of entityLower.split(" ")) {
    if (part.length >= 3 && text.includes(part)) {
      score += 1;
    }
  }

  return score;
}

export function groupArticlesIntoSubtopics(
  articles: Article[],
  maxSubtopics = 5
): Record<string, Article[]> {
  const chosenEntities = chooseTopEntities(articles, maxSubtopics);

  const grouped: Record<string, Article[]> = {};
  for (const entity of chosenEntities) {
    grouped[entity] = [];
  }
  grouped["Other Coverage"] = [];

  for (const article of articles) {
    let bestEntity: string | null = null;
    let bestScore = 0;

    for (const entity of chosenEntities) {
      const score = scoreArticleForEntity(article, entity);
      if (score > bestScore) {
        bestScore = score;
        bestEntity = entity;
      }
    }

    if (bestEntity && bestScore >= 3) {
      grouped[bestEntity].push(article);
    } else {
      grouped["Other Coverage"].push(article);
    }
  }

  Object.keys(grouped).forEach((key) => {
    grouped[key].sort((a, b) => {
      const aTime = a.publishedAt ? new Date(a.publishedAt).getTime() : 0;
      const bTime = b.publishedAt ? new Date(b.publishedAt).getTime() : 0;
      return bTime - aTime;
    });
  });

  return grouped;
}
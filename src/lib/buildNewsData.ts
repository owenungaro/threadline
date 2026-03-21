import { fetchAllArticles } from "@/lib/fetchFeeds";
import { groupByTopic } from "@/lib/topics";
import { generateSubtopicsWithAI } from "@/lib/generateSubtopicsWithAI";

export async function buildNewsData() {
  const articles = await fetchAllArticles();
  console.log("buildNewsData articles:", articles.length);

  const topics = await groupByTopic(articles);

  console.log(
    "buildNewsData topics before filtering:",
    Object.fromEntries(
      Object.entries(topics).map(([k, v]) => [k, v.length])
    )
  );

  const topicEntries = await Promise.all(
    Object.entries(topics)
      .filter(([, topicArticles]) => topicArticles.length > 0)
      .map(async ([topic, topicArticles]) => {
        let subtopics: Record<string, typeof topicArticles> = {};

        try {
          subtopics = await generateSubtopicsWithAI(topic, topicArticles);
        } catch (err) {
          console.error("AI subtopic generation failed for:", topic, err);
          subtopics = { "Other Coverage": topicArticles };
        }

        return [
          topic,
          {
            articleCount: topicArticles.length,
            sourceCount: new Set(topicArticles.map((a) => a.source)).size,
            articles: topicArticles,
            subtopics,
          },
        ] as const;
      })
  );

  console.log("topicEntries length:", topicEntries.length);

  return {
    generatedAt: new Date().toISOString(),
    stats: {
      articleCount: articles.length,
      sourceCount: new Set(articles.map((a) => a.source)).size,
      topicCount: topicEntries.length,
    },
    topics: Object.fromEntries(topicEntries),
    latestArticles: articles.slice(0, 12),
  };
}
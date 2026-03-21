import Link from "next/link";
import { loadNewsData } from "@/lib/loadNewsData";
import { formatPublishedAt } from "@/lib/helpers";
import {
  HERO_SUPPORTING_LINE,
  PRODUCT_DESCRIPTION,
  SITE_NAME,
} from "@/lib/brand";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { TopicCard } from "@/components/TopicCard";
import { SourceBadge } from "@/components/SourceBadge";

export default async function Home() {
  const data = await loadNewsData();
  const topics = data.topics ?? {};
  const latestArticles = data.latestArticles ?? [];

  const activeTopicEntries = Object.entries(topics).filter(
    ([, topicData]: any) => (topicData?.articles?.length ?? 0) > 0
  );

  const articleIdToTopic = new Map<string, string>();
  for (const [topic, topicData] of activeTopicEntries as any[]) {
    for (const article of topicData.articles ?? []) {
      articleIdToTopic.set(article.id, topic);
    }
  }

  const featuredTopics = [...activeTopicEntries]
    .map(([topic, topicData]: any) => {
      const list = topicData.articles ?? [];
      const sourceCount =
        topicData.sourceCount ?? new Set(list.map((a: any) => a.source)).size;

      const topSubtopics = Object.entries(topicData.subtopics ?? {})
        .filter(([name]) => name !== "Other Coverage")
        .map(([name, groupedArticles]: any) => ({
          name,
          articleCount: groupedArticles.length,
        }))
        .sort((a, b) => b.articleCount - a.articleCount)
        .slice(0, 2);

      const headline = list[0]?.title ?? "No headline available";

      const score = list.length * 1.3 + sourceCount * 3;

      return {
        topic,
        href: `/topics/${encodeURIComponent(topic)}`,
        articleCount: topicData.articleCount ?? list.length,
        sourceCount,
        headline,
        topSubtopics,
        score,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 9);

  const latestCoverage = latestArticles.slice(0, 10);

  const sources = Array.from(
    new Set(latestArticles.map((a: any) => a.source))
  );

  const latestBySource = sources
    .map((source) => latestArticles.find((a: any) => a.source === source))
    .filter(Boolean);

  const activeTopicCount = activeTopicEntries.length;
  const totalArticleCount =
    data.stats?.articleCount ??
    Object.values(topics).reduce(
      (sum: number, topicData: any) => sum + (topicData?.articleCount ?? 0),
      0
    );

  const totalSourceCount =
    data.stats?.sourceCount ?? new Set(latestArticles.map((a: any) => a.source)).size;

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-7xl px-6 py-10 pb-20">
        <section className="mb-10 rounded-[2rem] border border-neutral-200 bg-white px-6 py-8 shadow-sm">
          <div className="grid gap-10 lg:grid-cols-[1fr_380px] lg:items-center">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-blue-700">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-600" />
                Updated from RSS feeds
              </div>

              <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
                {SITE_NAME}
              </h1>

              <p className="mt-3 max-w-2xl text-lg leading-7 text-neutral-700">
                {PRODUCT_DESCRIPTION}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                {HERO_SUPPORTING_LINE}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Link
                  href="#top-topics"
                  className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Explore top topics
                </Link>
                <span className="text-sm text-neutral-500">
                  Compare grouped coverage in one view.
                </span>
              </div>
            </div>

            <div className="rounded-3xl border border-neutral-200 bg-neutral-50 p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Quick stats
              </p>
              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Outlets
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                    {totalSourceCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Topics
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                    {activeTopicCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-white px-3 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Articles
                  </p>
                  <p className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">
                    {totalArticleCount}
                  </p>
                </div>
              </div>

              <p className="mt-4 text-xs leading-5 text-neutral-500">
                Topic and subtopic grouping is automated and may be incomplete.
              </p>
            </div>
          </div>
        </section>

        <div className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <section id="top-topics" className="mb-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    Top Topics
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    Most active topic clusters right now, ranked by volume and
                    outlet spread.
                  </p>
                </div>
                <span className="hidden text-sm text-neutral-500 sm:block">
                  {activeTopicCount} active
                </span>
              </div>

              <div className="grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {featuredTopics.map((t, idx) => {
                  const featured = idx === 0;
                  return (
                    <div key={t.topic} className="h-full">
                      <TopicCard
                        href={t.href}
                        topic={t.topic}
                        articleCount={t.articleCount}
                        sourceCount={t.sourceCount}
                        headline={t.headline}
                        topSubtopics={t.topSubtopics}
                        variant={featured ? "featured" : "standard"}
                      />
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="mb-8">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                    Latest Coverage
                  </h2>
                  <p className="mt-2 text-sm text-neutral-600">
                    Newest items across all sources.
                  </p>
                </div>
                <span className="text-sm text-neutral-500">
                  {latestCoverage.length} items
                </span>
              </div>

              <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
                <ol className="divide-y divide-neutral-200">
                  {latestCoverage.map((a: any) => {
                    const topic = articleIdToTopic.get(a.id) ?? "Other";
                    return (
                      <li key={a.id} className="px-6 py-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 font-medium text-neutral-700">
                                {topic}
                              </span>
                              <SourceBadge source={a.source} />
                              <span className="text-neutral-400">•</span>
                              <time className="font-medium">
                                {formatPublishedAt(a.publishedAt)}
                              </time>
                            </div>

                            <a
                              href={a.url}
                              target="_blank"
                              rel="noreferrer"
                              className="mt-2 block line-clamp-2 text-sm font-semibold tracking-tight text-neutral-900 transition hover:text-neutral-700"
                            >
                              {a.title}
                            </a>
                          </div>

                          <a
                            href={a.url}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-0.5 flex-none rounded-lg border border-neutral-200 bg-white px-3 py-1.5 text-xs font-semibold text-neutral-700 transition hover:border-neutral-300 hover:bg-neutral-50"
                          >
                            Open
                          </a>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <section className="sticky top-6">
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <div className="flex items-end justify-between gap-4">
                  <div>
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                      Latest Across Sources
                    </h2>
                    <p className="mt-2 text-sm text-neutral-600">
                      Latest headline from each outlet.
                    </p>
                  </div>
                  <span className="text-sm text-neutral-500">
                    {latestBySource.length} outlets
                  </span>
                </div>

                <ol className="mt-5 space-y-0.5">
                  {latestBySource.map((a: any) => {
                    const topic = articleIdToTopic.get(a.id) ?? "Other";
                    return (
                      <li key={a.id}>
                        <a
                          href={a.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex gap-3 rounded-2xl px-3 py-3 transition hover:bg-neutral-50"
                        >
                          <div className="flex flex-col items-start">
                            <SourceBadge source={a.source} />
                          </div>
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2 py-1 font-medium text-neutral-700">
                                {topic}
                              </span>
                              <span className="text-neutral-400">•</span>
                              <time className="font-medium">
                                {formatPublishedAt(a.publishedAt)}
                              </time>
                            </div>
                            <p className="mt-1 line-clamp-2 text-sm font-semibold tracking-tight text-neutral-900 transition group-hover:text-neutral-700">
                              {a.title}
                            </p>
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </section>
          </aside>
        </div>

        <section className="mt-8">
          <div className="max-w-3xl">
            <DisclaimerBox title="Methodology: heuristic groupings, not guarantees">
              Threadline groups articles into topics and subtopics using an
              automated heuristic. It may miss context or group similar stories
              imperfectly. Always open the original outlet links for definitive
              details.
            </DisclaimerBox>
          </div>
        </section>

        <footer className="mt-10 text-center text-sm text-neutral-500">
          <p>Threadline aggregates RSS feeds and organizes coverage for comparison.</p>
        </footer>
      </div>
    </main>
  );
}
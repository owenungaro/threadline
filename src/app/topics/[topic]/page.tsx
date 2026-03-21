import Link from "next/link";
import { loadNewsData } from "@/lib/loadNewsData";
import { SITE_NAME } from "@/lib/brand";
import { DisclaimerBox } from "@/components/DisclaimerBox";
import { SourceBadge } from "@/components/SourceBadge";
import { ArticleCard } from "@/components/ArticleCard";
import type { Article } from "@/types";

export default async function Page({
  params,
}: {
  params: Promise<{ topic: string }>;
}) {
  const { topic: rawTopic } = await params;
  const topic = decodeURIComponent(rawTopic);

  const data = await loadNewsData();
  const topicData = data.topics?.[topic];

  if (!topicData) {
    return (
      <main className="min-h-screen bg-neutral-50 text-neutral-900">
        <div className="mx-auto max-w-6xl px-6 py-10 pb-16">
          <div className="mb-6">
            <Link
              href="/"
              className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
            >
              ← Back to {SITE_NAME}
            </Link>
          </div>

          <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
            <h1 className="text-3xl font-bold tracking-tight">Topic not found</h1>
            <p className="mt-3 text-neutral-600">
              That topic does not exist in the current news dataset.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const articles: Article[] = topicData.articles ?? [];
  const subtopics = topicData.subtopics ?? {};

  const visibleSubtopics = Object.entries(subtopics).filter(
    ([, groupedArticles]: any) => groupedArticles.length > 0
  ) as [string, Article[]][];

  const sourcesInTopic = Array.from(new Set(articles.map((a) => a.source)));
  const mostRecent = articles[0];

  const slugify = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-900">
      <div className="mx-auto max-w-6xl px-6 py-10 pb-16">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-neutral-600 transition hover:text-neutral-900"
          >
            ← Back to {SITE_NAME}
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
          <section className="min-w-0">
            <div className="rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
              <p className="text-sm font-medium uppercase tracking-wide text-neutral-500">
                Topic
              </p>
              <h1 className="mt-2 text-4xl font-bold tracking-tight sm:text-5xl">
                {topic}
              </h1>

              <p className="mt-4 text-base leading-7 text-neutral-600">
                {articles.length} articles • {visibleSubtopics.length} subtopics •{" "}
                {sourcesInTopic.length} outlets
              </p>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-neutral-500">
                Use the subtopic chips to scan grouped coverage quickly, then open
                the original links for full context.
              </p>
            </div>

            <div className="mt-5">
              <DisclaimerBox title="Heuristic-based subtopic grouping">
                Subtopics are clustered automatically and may not perfectly match
                how outlets frame the story. Treat them as a helpful starting
                point, not a guarantee.
              </DisclaimerBox>
            </div>

            {visibleSubtopics.length === 0 ? (
              <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-7 shadow-sm">
                <p className="text-neutral-600">No articles found for this topic.</p>
              </div>
            ) : (
              <>
                <div className="mt-6 flex flex-wrap gap-2">
                  {visibleSubtopics.map(([subtopic, groupedArticles]) => {
                    const id = `subtopic-${slugify(subtopic)}`;
                    return (
                      <a
                        key={subtopic}
                        href={`#${id}`}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1.5 text-sm font-medium text-neutral-700 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
                      >
                        {subtopic}{" "}
                        <span className="text-neutral-500">
                          ({groupedArticles.length})
                        </span>
                      </a>
                    );
                  })}
                </div>

                <div className="mt-10 space-y-10">
                  {visibleSubtopics.map(([subtopic, groupedArticles]) => {
                    const id = `subtopic-${slugify(subtopic)}`;

                    const sourceSet = new Set(groupedArticles.map((a) => a.source));
                    const topSources = Array.from(sourceSet).slice(0, 3);
                    const extraSources = sourceSet.size - topSources.length;

                    return (
                      <section key={subtopic} id={id} className="scroll-mt-28">
                        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-baseline sm:justify-between">
                          <div>
                            <h2 className="text-2xl font-semibold tracking-tight">
                              {subtopic}
                            </h2>
                            <p className="mt-2 text-sm text-neutral-600">
                              {groupedArticles.length} articles
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2">
                            {topSources.map((s) => (
                              <SourceBadge key={s} source={s} />
                            ))}
                            {extraSources > 0 && (
                              <span className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1 text-xs font-medium text-neutral-600">
                                +{extraSources} more
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid gap-4 lg:grid-cols-2">
                          {groupedArticles.map((a) => (
                            <ArticleCard key={a.id} article={a} />
                          ))}
                        </div>
                      </section>
                    );
                  })}
                </div>
              </>
            )}
          </section>

          <aside className="sticky top-6 self-start">
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-500">
                Overview
              </h2>

              <div className="mt-4 grid grid-cols-3 gap-3">
                <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Outlets
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {sourcesInTopic.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Articles
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {articles.length}
                  </p>
                </div>
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                    Subtopics
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-tight">
                    {visibleSubtopics.length}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Most recent
                </h3>
                {mostRecent ? (
                  <div className="mt-3">
                    <ArticleCard article={mostRecent} variant="compact" />
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-neutral-600">No recent article.</p>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-sm font-semibold text-neutral-900">
                  Subtopic breakdown
                </h3>

                {visibleSubtopics.length > 0 ? (
                  <ol className="mt-3 space-y-2">
                    {visibleSubtopics
                      .slice(0, 6)
                      .map(([subtopic, groupedArticles]) => (
                        <li key={subtopic}>
                          <a
                            href={`#subtopic-${slugify(subtopic)}`}
                            className="flex items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm font-medium text-neutral-800 transition hover:bg-white"
                          >
                            <span className="min-w-0 truncate">{subtopic}</span>
                            <span className="flex-none text-neutral-500">
                              {groupedArticles.length}
                            </span>
                          </a>
                        </li>
                      ))}
                  </ol>
                ) : null}
              </div>

              <div className="mt-6 rounded-2xl border border-neutral-200 bg-neutral-50 p-4 text-sm leading-6 text-neutral-600">
                Groupings are automated and may be incomplete or imprecise. For
                definitive details, open articles from the original outlets.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
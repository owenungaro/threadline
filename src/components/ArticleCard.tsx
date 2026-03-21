import type { Article } from "@/types";
import { formatPublishedAt } from "@/lib/helpers";
import { SourceBadge } from "./SourceBadge";

export function ArticleCard({
  article,
  variant = "standard",
}: {
  article: Article;
  variant?: "standard" | "compact";
}) {
  const compact = variant === "compact";

  return (
    <article
      className={[
        "group rounded-2xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-sm",
        compact ? "p-4" : "p-5",
      ].join(" ")}
    >
      <div className={compact ? "flex gap-3" : "flex gap-4"}>
        {article.imageUrl && (
          <img
            src={article.imageUrl}
            alt=""
            loading="lazy"
            className={[
              "aspect-square flex-none rounded-xl border border-neutral-200 bg-neutral-50 object-cover",
              compact ? "h-10 w-10" : "h-14 w-14",
            ].join(" ")}
          />
        )}

        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <SourceBadge source={article.source} />
            <span className="text-neutral-400">•</span>
            <time dateTime={article.publishedAt ?? undefined}>
              {formatPublishedAt(article.publishedAt)}
            </time>
          </div>

          <a
            href={article.url}
            target="_blank"
            rel="noreferrer"
            className={[
              "block font-semibold tracking-tight text-neutral-900 transition group-hover:text-neutral-700",
              compact ? "text-base leading-6" : "text-lg leading-7",
            ].join(" ")}
          >
            {article.title}
          </a>

          {!compact && article.description && (
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-neutral-600">
              {article.description}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}


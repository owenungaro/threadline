import Link from "next/link";

export function TopicCard({
  href,
  topic,
  articleCount,
  sourceCount,
  headline,
  topSubtopics,
  variant = "standard",
}: {
  href: string;
  topic: string;
  articleCount: number;
  sourceCount: number;
  headline: string;
  topSubtopics: { name: string; articleCount: number }[];
  variant?: "standard" | "featured";
}) {
  const featured = variant === "featured";

  return (
    <Link
      href={href}
      className="group block h-full overflow-hidden rounded-3xl border border-neutral-200 bg-white transition hover:border-neutral-300 hover:shadow-sm"
    >
      <div className="flex">
        <div
          aria-hidden="true"
          className={[
            "flex-none",
            featured ? "w-2 bg-blue-600" : "w-1 bg-neutral-200",
          ].join(" ")}
        />

        <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">
          <div className="flex flex-col gap-1">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2
                className={[
                  "text-lg font-semibold tracking-tight text-neutral-900",
                  featured ? "sm:text-xl" : "",
                ].join(" ")}
              >
                {topic}
              </h2>
              <p className="text-sm text-neutral-500">
                {articleCount} articles • {sourceCount} outlets
              </p>
            </div>
          </div>

          <p
            className={[
              "mt-3 font-medium leading-6 transition group-hover:text-neutral-900",
              featured ? "text-base line-clamp-3" : "text-base text-neutral-800 line-clamp-2",
            ].join(" ")}
          >
            {headline}
          </p>

          {topSubtopics.length > 0 && (
            <div className="mt-auto pt-4 flex flex-wrap gap-2">
              {topSubtopics.slice(0, featured ? 2 : 1).map((st) => (
                <span
                  key={st.name}
                  className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-medium text-neutral-700"
                >
                  {st.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}


import type { SourceName } from "@/types";

export function SourceBadge({ source }: { source: SourceName | string }) {
  const style =
    source === "Fox News"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : source === "NPR"
        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
        : source === "BBC"
          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
          : source === "New York Times"
            ? "border-sky-200 bg-sky-50 text-sky-700"
            : source === "Daily Wire"
              ? "border-amber-200 bg-amber-50 text-amber-700"
              : "border-neutral-200 bg-neutral-100 text-neutral-700";

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium",
        style,
      ].join(" ")}
    >
      {source}
    </span>
  );
}


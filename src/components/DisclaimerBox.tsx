import type { ReactNode } from "react";

export function DisclaimerBox({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-blue-200 bg-blue-50/70 p-4">
      <div
        aria-hidden="true"
        className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-blue-200 bg-white text-blue-700"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M12 17.5V13"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M12 10.2V10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
          <path
            d="M10.3 3.7C11.1 2.3 13 2.3 13.7 3.7L20.5 15.9C21.2 17.2 20.2 18.8 18.7 18.8H5.3C3.8 18.8 2.8 17.2 3.5 15.9L10.3 3.7Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <div>
        <p className="text-sm font-semibold text-neutral-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-neutral-700">{children}</p>
      </div>
    </div>
  );
}


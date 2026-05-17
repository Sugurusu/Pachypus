import { cn } from "@/lib/utils";
import type { PlantStatus } from "@/lib/types";

const frameColor: Record<PlantStatus, string> = {
  在庫: "border-moss/25 bg-[#f7f4ec]",
  販売中: "border-gold bg-[#fff8e5] shadow-[0_0_0_3px_rgba(185,154,91,0.14)]",
  売約済: "border-clay bg-[#fbf0e9]",
  入金済: "border-ink/30 bg-[#f1efe7]",
  売却済: "border-stone bg-[#f4f0e7]",
  枯死: "border-stone bg-stone/40 grayscale opacity-70",
  返品: "border-clay bg-clay/10"
};

export function PlantMark({ status, className }: { status: PlantStatus; className?: string }) {
  const isSold = status === "売却済" || status === "入金済";

  return (
    <div className={cn("relative mx-auto h-28 w-24 rounded-md border-2", frameColor[status], className)}>
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 120 140" role="img" aria-label="パキプス">
        <defs>
          <linearGradient id="potGradient" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor="#34312b" />
            <stop offset="1" stopColor="#171815" />
          </linearGradient>
          <radialGradient id="caudexGradient" cx="46%" cy="38%" r="62%">
            <stop offset="0" stopColor="#d8ceb9" />
            <stop offset="0.48" stopColor="#9b8c72" />
            <stop offset="1" stopColor="#5d5141" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#141712" floodOpacity="0.22" />
          </filter>
        </defs>

        <ellipse cx="60" cy="123" rx="36" ry="7" fill="#11140f" opacity="0.18" />
        <path d="M25 98h70l-8 29H33z" fill="url(#potGradient)" />
        <path d="M22 94c0-6 7-9 38-9s38 3 38 9-7 10-38 10-38-4-38-10Z" fill="#3c3a33" />
        <path d="M30 92c8 3 52 3 60 0" fill="none" stroke="#7b7566" strokeWidth="2" opacity="0.75" />

        <g filter="url(#softShadow)">
          <path
            d="M41 90c-9-11-7-27 4-36 4-4 5-12 12-14 7-2 12 3 15 10 9 2 14 11 13 21-1 13-11 22-24 23-8 1-15 0-20-4Z"
            fill="url(#caudexGradient)"
          />
          <path
            d="M48 88c-6-9-3-18 4-23 5-4 3-12 9-15 4-2 8 1 10 7 6 2 9 7 8 14-2 10-11 16-21 16"
            fill="none"
            stroke="#6d604d"
            strokeWidth="2"
            opacity="0.45"
          />
          <path d="M45 72c6-4 9-10 8-19" fill="none" stroke="#e5dcc9" strokeWidth="1.5" opacity="0.45" />
          <path d="M65 52c-2 14 2 24 12 31" fill="none" stroke="#4b4235" strokeWidth="1.4" opacity="0.42" />
        </g>

        <g fill="none" stroke="#5b5143" strokeLinecap="round">
          <path d="M58 49C49 33 40 23 27 17" strokeWidth="3" />
          <path d="M61 50C63 33 67 20 80 11" strokeWidth="3" />
          <path d="M69 55C83 43 94 38 107 38" strokeWidth="2.7" />
          <path d="M53 55C42 47 31 45 19 49" strokeWidth="2.4" />
          <path d="M40 31c-9-5-17-7-26-5" strokeWidth="1.8" />
          <path d="M73 31c7-9 15-14 25-16" strokeWidth="1.8" />
          <path d="M86 44c9-1 16 2 22 8" strokeWidth="1.7" />
          <path d="M31 49c-8 2-13 6-17 12" strokeWidth="1.6" />
        </g>

        <g fill="#7d9b68">
          <ellipse cx="25" cy="17" rx="4" ry="2" transform="rotate(-28 25 17)" />
          <ellipse cx="17" cy="27" rx="3.5" ry="2" transform="rotate(20 17 27)" />
          <ellipse cx="81" cy="12" rx="4" ry="2" transform="rotate(-36 81 12)" />
          <ellipse cx="96" cy="16" rx="3.5" ry="2" transform="rotate(18 96 16)" />
          <ellipse cx="107" cy="39" rx="4" ry="2" transform="rotate(18 107 39)" />
          <ellipse cx="18" cy="61" rx="3.5" ry="2" transform="rotate(-18 18 61)" />
          <ellipse cx="102" cy="52" rx="3.4" ry="1.8" transform="rotate(38 102 52)" />
        </g>

        {isSold ? (
          <g>
            <rect x="14" y="12" width="45" height="18" rx="9" fill="#141712" opacity="0.9" />
            <text x="36.5" y="25" textAnchor="middle" fontSize="10" fontWeight="800" fill="#f7f4ec">
              SOLD
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}

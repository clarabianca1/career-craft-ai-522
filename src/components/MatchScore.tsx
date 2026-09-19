import { matchTier } from "@/lib/matching";
import { cn } from "@/lib/utils";

export function MatchRing({
  score,
  size = 72,
  label = true,
}: {
  score: number;
  size?: number;
  label?: boolean;
}) {
  const tier = matchTier(score);
  const stroke = size >= 64 ? 7 : 5;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const color =
    tier.tone === "success"
      ? "var(--success)"
      : tier.tone === "gold"
        ? "var(--gold)"
        : "var(--muted-foreground)";

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="var(--border)"
            strokeWidth={stroke}
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference - (circumference * Math.min(score, 100)) / 100}
            style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1)" }}
          />
        </svg>
        <span
          className="absolute inset-0 flex items-center justify-center font-display font-semibold"
          style={{ fontSize: size / 3.4 }}
        >
          {score}%
        </span>
      </div>
      {label ? (
        <div className="leading-tight">
          <p className="text-sm font-semibold">Match</p>
          <p
            className={cn(
              "text-xs",
              tier.tone === "success"
                ? "text-[var(--success)]"
                : tier.tone === "gold"
                  ? "text-[var(--gold)]"
                  : "text-muted-foreground",
            )}
          >
            {tier.label}
          </p>
        </div>
      ) : null}
    </div>
  );
}

export function MatchBadge({ score }: { score: number }) {
  const tier = matchTier(score);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold",
        tier.tone === "success"
          ? "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]"
          : tier.tone === "gold"
            ? "border-[var(--gold)]/40 bg-[var(--gold-soft)] text-[color:var(--accent-foreground)]"
            : "border-border bg-muted text-muted-foreground",
      )}
    >
      {score}% Match
    </span>
  );
}

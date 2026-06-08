import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { MapPin, Clock, ChevronDown, ChevronUp, Link2 } from "lucide-react";
import { CategoryBadge } from "./CategoryBadge";

export type Submission = {
  id: string;
  category: string;
  description: string;
  country: string | null;
  state: string | null;
  is_anonymous: boolean;
  ai_status: string;
  ai_response: string | null;
  blockchain_tx_hash: string | null;
  created_at: string;
};

export function SubmissionCard({ s }: { s: Submission }) {
  const [expanded, setExpanded] = useState(false);
  const desc = s.description ?? "";
  const long = desc.length > 200;
  const text = expanded || !long ? desc : desc.slice(0, 200) + "…";

  const status = s.ai_status ?? "pending";
  const aiStatus =
    status === "answered"
      ? { label: "AI Responded", className: "text-success bg-success/10", icon: "✅" }
      : status === "escalated"
        ? {
            label: "Escalated to Human",
            className: "text-destructive bg-destructive/10",
            icon: "🔺",
          }
        : { label: "Pending", className: "text-muted-foreground bg-muted", icon: "⏳" };

  return (
    <article className="card-editorial p-5 hover:shadow-[var(--shadow-card-hover)]">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <CategoryBadge category={s.category ?? "Other"} />
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${aiStatus.className}`}
        >
          <span>{aiStatus.icon}</span> {aiStatus.label}
        </span>
        {(s.blockchain_tx_hash ?? null) ? (
          <a
            href={`https://amoy.polygonscan.com/tx/${s.blockchain_tx_hash ?? ""}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-primary-light text-primary-dark hover:underline"
          >
            <Link2 size={11} /> Verified on chain
          </a>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
            📋 Logging…
          </span>
        )}
      </div>

      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{text}</p>
      {long && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-2 text-xs text-primary font-medium inline-flex items-center gap-1"
        >
          {expanded ? (
            <>
              <ChevronUp size={12} /> Show less
            </>
          ) : (
            <>
              <ChevronDown size={12} /> Read more
            </>
          )}
        </button>
      )}

      {s.ai_response && (
        <details className="mt-3 group">
          <summary className="cursor-pointer text-xs font-medium text-primary inline-flex items-center gap-1 select-none">
            <ChevronDown size={12} className="group-open:rotate-180 transition-transform" /> AI
            guidance
          </summary>
          <div className="mt-2 p-3 bg-primary-light/40 border border-primary-light rounded-md text-sm text-foreground whitespace-pre-wrap">
            {s.ai_response}
          </div>
        </details>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <Clock size={12} />{" "}
          {formatDistanceToNow(new Date(s.created_at ?? new Date().toISOString()), {
            addSuffix: true,
          })}
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} />
          {(s.country ?? null) || (s.state ?? null)
            ? [s.state, s.country].filter(Boolean).join(", ")
            : "Location not shared"}
        </span>
        <span className="font-mono text-[10px]">#{(s.id ?? "").slice(0, 8)}</span>
      </div>
    </article>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Search, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubmissionCard, type Submission } from "@/components/SubmissionCard";
import { CATEGORIES } from "@/lib/categories";

const PAGE = 20;

export const Route = createFileRoute("/audit")({
  head: () => ({
    meta: [
      { title: "Public Audit Log — JanSeva Protocol" },
      {
        name: "description",
        content:
          "Every civic submission is permanent and verifiable. Browse the live public ledger.",
      },
      { property: "og:title", content: "Public Audit Log — JanSeva Protocol" },
      { property: "og:description", content: "Live, tamper-proof civic ledger." },
    ],
  }),
  component: Audit,
});

function Audit() {
  const [rows, setRows] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [cat, setCat] = useState("");
  const [sort, setSort] = useState<"new" | "old">("new");
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    let qb = supabase
      .from("submissions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: sort === "old" })
      .range(page * PAGE, page * PAGE + PAGE - 1);
    if (cat) qb = qb.eq("category", cat);
    qb.then(({ data, count, error }) => {
      if (cancelled) return;
      if (error) console.error(error);
      setRows((data as Submission[]) ?? []);
      setTotal(count ?? 0);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [page, cat, sort]);

  // Realtime: prepend new submissions when on page 0 with no filter
  useEffect(() => {
    const channel: RealtimeChannel = supabase
      .channel("submissions-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions" },
        (payload) => {
          if (page !== 0 || cat) return;
          setRows((r) => [payload.new as Submission, ...r].slice(0, PAGE));
          setTotal((t) => t + 1);
        },
      )
      .subscribe();
    return () => {
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [page, cat]);

  const filtered = useMemo(() => {
    if (!q.trim()) return rows;
    const needle = q.toLowerCase();
    return rows.filter((r) => r.description.toLowerCase().includes(needle));
  }, [rows, q]);

  const pages = Math.max(1, Math.ceil(total / PAGE));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
            <h1 className="font-display text-4xl sm:text-5xl text-foreground">Public Audit Log</h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-light text-primary-dark text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
              {total.toLocaleString()} total
            </span>
          </div>
          <p className="text-muted-foreground">
            Every submission is permanent and tamper-proof. Nothing can be deleted.
          </p>

          {/* Filters */}
          <div className="mt-6 card-editorial p-3 flex flex-wrap gap-2 items-center">
            <div className="relative flex-1 min-w-[180px]">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search descriptions…"
                className="w-full bg-background border border-input rounded-md pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={cat}
              onChange={(e) => {
                setCat(e.target.value);
                setPage(0);
              }}
              className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">All categories</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value as "new" | "old");
                setPage(0);
              }}
              className="bg-background border border-input rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="new">Newest first</option>
              <option value="old">Oldest first</option>
            </select>
          </div>

          {/* List */}
          <div className="mt-6 space-y-4">
            {loading ? (
              <div className="py-12 text-center text-muted-foreground inline-flex items-center justify-center gap-2 w-full">
                <Loader2 className="animate-spin" size={16} /> Loading ledger…
              </div>
            ) : filtered.length === 0 ? (
              <div className="card-editorial p-12 text-center">
                <p className="font-display text-2xl text-foreground">No submissions yet</p>
                <p className="text-muted-foreground mt-2 text-sm">
                  Be the first to submit a civic issue to the public ledger.
                </p>
              </div>
            ) : (
              filtered.map((s) => <SubmissionCard key={s.id} s={s} />)
            )}
          </div>

          {/* Pagination */}
          {total > PAGE && (
            <div className="mt-8 flex items-center justify-between">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-input rounded-md disabled:opacity-40 hover:bg-muted"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <span className="text-sm text-muted-foreground">
                {page * PAGE + 1}–{Math.min((page + 1) * PAGE, total)} of {total}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
                disabled={page >= pages - 1}
                className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-input rounded-md disabled:opacity-40 hover:bg-muted"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

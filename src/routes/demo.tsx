import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { SubmissionCard, type Submission } from "@/components/SubmissionCard";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/demo")({
  head: () => ({
    meta: [
      { title: "Demo — JanSeva Protocol" },
      { name: "description", content: "Demo view showing seeded submissions and chat logs." },
    ],
  }),
  component: Demo,
});

function Demo() {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [logs, setLogs] = useState<Array<{ id: string; query: string; response?: string; category?: string; created_at?: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    Promise.all([
      supabase.from("submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("chat_logs").select("*").order("created_at", { ascending: false }),
    ]).then(([sRes, cRes]) => {
      if (cancelled) return;
      if (sRes.error) console.warn("submissions fetch:", sRes.error);
      if (cRes.error) console.warn("chat_logs fetch:", cRes.error);
      setSubs((sRes.data as Submission[]) ?? []);
      setLogs((cRes.data as any) ?? []);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl mb-3">Demo Data — Submissions & Chat Logs</h1>
          <p className="text-sm text-muted-foreground mb-6">This page surfaces seeded demo data so you can explore typical platform flows.</p>

          <section className="grid lg:grid-cols-2 gap-6">
            <div>
              <h2 className="font-medium text-lg mb-3">Recent Submissions</h2>
              {loading ? (
                <div className="p-6 bg-card text-sm">Loading submissions…</div>
              ) : subs.length === 0 ? (
                <div className="p-6 bg-card text-sm">No demo submissions found.</div>
              ) : (
                <div className="space-y-4">
                  {subs.map((s) => (
                    <SubmissionCard key={s.id} s={s} />
                  ))}
                </div>
              )}
            </div>

            <div>
              <h2 className="font-medium text-lg mb-3">Recent Chat Logs</h2>
              {loading ? (
                <div className="p-6 bg-card text-sm">Loading chat logs…</div>
              ) : logs.length === 0 ? (
                <div className="p-6 bg-card text-sm">No demo chat logs found.</div>
              ) : (
                <div className="space-y-3">
                  {logs.map((l) => (
                    <article key={l.id} className="p-4 border border-border rounded-md bg-background">
                      <div className="text-sm font-medium">{l.query}</div>
                      {l.response && <div className="mt-2 text-sm text-foreground/90 whitespace-pre-wrap">{l.response}</div>}
                      <div className="mt-2 text-xs text-muted-foreground">{l.category ?? "(uncategorized)"} • {l.created_at}</div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Shield, Eye, Users, Globe, Database } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CATEGORY_CONFIG } from "@/lib/categories";

export const Route = createFileRoute("/governance")({
  head: () => ({
    meta: [
      { title: "Governance — JanSeva Protocol" },
      {
        name: "description",
        content: "JanSeva Protocol is governed by a distributed stewardship council. No single entity controls it.",
      },
      { property: "og:title", content: "Governance — JanSeva Protocol" },
      { property: "og:description", content: "Distributed, transparent stewardship." },
    ],
  }),
  component: Governance,
});

const STEWARDS = [
  { name: "Aisha Banerjee", country: "🇮🇳", role: "Civic Tech Lead", since: "2024" },
  { name: "Kwame Mensah", country: "🇬🇭", role: "Legal Steward", since: "2024" },
  { name: "Priya Ramanathan", country: "🇱🇰", role: "Community Council", since: "2024" },
  { name: "Layla Hassan", country: "🇰🇪", role: "Welfare Steward", since: "2025" },
  { name: "Rohit Sharma", country: "🇳🇵", role: "Technical Steward", since: "2024" },
  { name: "Marisol Vega", country: "🇲🇽", role: "Transparency Lead", since: "2025" },
  { name: "Tariq Aziz", country: "🇵🇰", role: "AI Ethics", since: "2024" },
];

type Vote = { id: string; proposal: string; votes_for: number; votes_against: number; outcome: string | null; voted_at: string };

function Governance() {
  const [stats, setStats] = useState({ total: 0, answered: 0, countries: 0, chain: 0 });
  const [byCat, setByCat] = useState<Array<{ name: string; value: number; color: string }>>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  useEffect(() => {
    (async () => {
      const [tot, ans, chain, cats, c, v] = await Promise.all([
        supabase.from("submissions").select("*", { count: "exact", head: true }),
        supabase.from("submissions").select("*", { count: "exact", head: true }).eq("ai_status", "answered"),
        supabase.from("submissions").select("*", { count: "exact", head: true }).neq("blockchain_tx_hash", ""),
        supabase.from("submissions").select("category"),
        supabase.from("submissions").select("country").neq("country", ""),
        supabase.from("governance_votes").select("*").order("voted_at", { ascending: false }).limit(10),
      ]);
      const countries = [...new Set((c.data ?? []).map((r) => r.country).filter(Boolean))].length;
      setStats({ total: tot.count ?? 0, answered: ans.count ?? 0, countries, chain: chain.count ?? 0 });
      const counts: Record<string, number> = {};
      (cats.data ?? []).forEach((r) => { counts[r.category] = (counts[r.category] ?? 0) + 1; });
      setByCat(
        Object.entries(counts).map(([name, value]) => ({
          name: CATEGORY_CONFIG[name]?.label ?? name,
          value,
          color: CATEGORY_CONFIG[name]?.color ?? "#374151",
        })),
      );
      setVotes((v.data as Vote[]) ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">Platform Governance</h1>
          <p className="mt-3 text-muted-foreground max-w-2xl">
            JanSeva is governed by a distributed stewardship council. No single entity controls it.
            Every action is visible, every decision is recorded.
          </p>

          {/* Stats */}
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<Database size={18} />} label="Total submissions" value={stats.total} />
            <StatCard icon={<Eye size={18} />} label="AI responses" value={stats.answered} />
            <StatCard icon={<Globe size={18} />} label="Countries" value={stats.countries} />
            <StatCard icon={<Shield size={18} />} label="On-chain records" value={stats.chain} />
          </div>

          {/* Principles */}
          <h2 className="font-display text-2xl text-foreground mt-12 mb-4">Principles</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <Principle title="No single point of capture" body="The protocol is designed so no government, corporation, or individual can shut it down or alter records." />
            <Principle title="Radical transparency" body="Every submission, every AI response, every governance vote is permanently public." />
            <Principle title="Distributed stewardship" body="Seven independent stewards from different countries — none with unilateral control." />
          </div>

          {/* Chart */}
          {byCat.length > 0 && (
            <>
              <h2 className="font-display text-2xl text-foreground mt-12 mb-4">Submissions by category</h2>
              <div className="card-editorial p-4 sm:p-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={byCat}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip cursor={{ fill: "rgba(0,0,0,0.04)" }} />
                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                      {byCat.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {/* Stewards */}
          <h2 className="font-display text-2xl text-foreground mt-12 mb-4">Stewardship council</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {STEWARDS.map((s) => (
              <div key={s.name} className="card-editorial p-4 flex items-center gap-3">
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(s.name)}&background=0F6E56&color=fff&bold=true`}
                  alt={s.name}
                  className="w-12 h-12 rounded-full"
                />
                <div className="min-w-0">
                  <div className="font-medium text-sm text-foreground truncate">
                    {s.name} <span className="ml-1">{s.country}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">{s.role}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">Since {s.since}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Votes table */}
          {votes.length > 0 && (
            <>
              <h2 className="font-display text-2xl text-foreground mt-12 mb-4">Recent governance votes</h2>
              <div className="card-editorial overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-2.5">Proposal</th>
                      <th className="text-right px-4 py-2.5">For</th>
                      <th className="text-right px-4 py-2.5">Against</th>
                      <th className="text-left px-4 py-2.5">Outcome</th>
                      <th className="text-right px-4 py-2.5">When</th>
                    </tr>
                  </thead>
                  <tbody>
                    {votes.map((v) => (
                      <tr key={v.id} className="border-t border-border">
                        <td className="px-4 py-3 text-foreground">{v.proposal}</td>
                        <td className="px-4 py-3 text-right text-success font-medium">{v.votes_for}</td>
                        <td className="px-4 py-3 text-right text-destructive font-medium">{v.votes_against}</td>
                        <td className="px-4 py-3">
                          <span className="inline-flex px-2 py-0.5 rounded-full text-xs bg-primary-light text-primary-dark capitalize">
                            {v.outcome ?? "pending"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(v.voted_at), { addSuffix: true })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Open source */}
          <div className="mt-12 card-editorial p-6 sm:p-8 text-center bg-primary text-primary-foreground border-primary">
            <Users className="mx-auto mb-3" size={28} />
            <h2 className="font-display text-2xl mb-2">Every line of code is public</h2>
            <p className="text-primary-foreground/80 text-sm mb-4 max-w-md mx-auto">
              JanSeva is MIT licensed. Fork it, audit it, run your own instance. We can't stop you — that's the point.
            </p>
            <a
              href="#"
              className="inline-flex bg-primary-foreground text-primary px-5 py-2.5 rounded-md text-sm font-medium hover:opacity-90"
            >
              View on GitHub
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="card-editorial p-4">
      <div className="text-primary mb-1.5">{icon}</div>
      <div className="font-display text-3xl text-foreground">{value.toLocaleString()}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{label}</div>
    </div>
  );
}

function Principle({ title, body }: { title: string; body: string }) {
  return (
    <div className="card-editorial p-5">
      <h3 className="font-display text-lg text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}

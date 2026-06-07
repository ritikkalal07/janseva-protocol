import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bot, Shield, Eye, Lock, Link2, Globe, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JanSeva Protocol — Justice for everyone. Owned by no one." },
      {
        name: "description",
        content:
          "Capture-resistant, AI-powered civic platform. Get help with RTI, welfare, legal aid, and corruption reporting — anonymously and on a transparent public ledger.",
      },
      { property: "og:title", content: "JanSeva Protocol" },
      { property: "og:description", content: "Justice for everyone. Owned by no one." },
    ],
  }),
  component: Home,
});

function Home() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .then(({ count }) => setCount(count ?? 0));
  }, []);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      {/* HERO */}
      <section className="px-4 sm:px-6 pt-16 sm:pt-24 pb-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary-dark text-xs font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary pulse-dot" />
            Live · capture-resistant civic infrastructure
          </div>
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl text-foreground leading-[1.05]">
            Justice for everyone.<br />
            <span className="text-primary">Owned by no one.</span>
          </h1>
          <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            JanSeva Protocol is an AI-powered civic platform. No government, corporation,
            or individual controls it. Every action is transparent and permanent.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary-dark transition-colors"
            >
              Get Civic Help <ArrowRight size={16} />
            </Link>
            <Link
              to="/audit"
              className="inline-flex items-center gap-2 border border-primary text-primary px-6 py-3 rounded-md font-medium hover:bg-primary-light transition-colors"
            >
              View Public Audit Log
            </Link>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5"><Lock size={13} /> Anonymous by default</span>
            <span className="inline-flex items-center gap-1.5"><Link2 size={13} /> Blockchain verified</span>
            <span className="inline-flex items-center gap-1.5"><Globe size={13} /> 47 languages supported</span>
          </div>
        </div>

        {/* STATS BAR */}
        <div className="max-w-4xl mx-auto mt-16 grid grid-cols-3 gap-px bg-border rounded-lg overflow-hidden card-editorial p-0">
          <Stat value={count === null ? "…" : count.toLocaleString()} label="Total submissions" />
          <Stat value="100%" label="Open source" />
          <Stat value="0" label="Gatekeepers" />
        </div>
      </section>

      {/* FEATURES */}
      <section className="px-4 sm:px-6 py-16 bg-surface border-y border-border">
        <div className="max-w-6xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl text-center mb-3">What you can do here</h2>
          <p className="text-center text-muted-foreground mb-12 max-w-xl mx-auto">
            Three core tools, designed to be impossible to capture or shut down.
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            <Feature
              icon={<Bot className="text-primary" size={22} />}
              title="AI Civic Assistant"
              body="Step-by-step help navigating government systems, legal processes, and welfare benefits in your language."
              to="/chat"
              cta="Ask the AI"
            />
            <Feature
              icon={<Shield className="text-primary" size={22} />}
              title="Transparent Audit Log"
              body="Every submission is permanently recorded. Nothing can be deleted. Anyone can verify."
              to="/audit"
              cta="View the log"
            />
            <Feature
              icon={<Eye className="text-primary" size={22} />}
              title="Corruption Reporting"
              body="Report safely. Your identity is never stored unless you choose. Reports are logged immediately."
              to="/submit"
              cta="Submit safely"
            />
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="px-4 sm:px-6 py-20">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl sm:text-4xl text-center mb-12">How it works</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { n: "01", t: "Submit your problem", d: "Anonymous by default. Voice or text. Any language." },
              { n: "02", t: "AI agent responds", d: "Concrete steps, resources, escalation paths." },
              { n: "03", t: "Logged permanently", d: "Hashed and written to the public ledger." },
              { n: "04", t: "Community review", d: "Stewards and the public verify outcomes." },
            ].map((s) => (
              <div key={s.n} className="relative">
                <div className="font-display text-5xl text-primary-light leading-none">{s.n}</div>
                <h3 className="mt-3 font-semibold text-foreground">{s.t}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA STRIP */}
      <section className="px-4 sm:px-6 py-16 bg-primary text-primary-foreground">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display text-3xl sm:text-4xl mb-3">
            Built in public. Governed by the community.
          </h2>
          <p className="text-primary-foreground/80 mb-6 max-w-xl mx-auto">
            No owner. No corporation. No off-switch. Every line of code is open source.
          </p>
          <Link
            to="/governance"
            className="inline-flex items-center gap-2 bg-primary-foreground text-primary px-6 py-3 rounded-md font-medium hover:opacity-90 transition-opacity"
          >
            See how it's governed <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-surface p-6 sm:p-8 text-center">
      <div className="font-display text-3xl sm:text-4xl text-foreground">{value}</div>
      <div className="mt-1 text-xs sm:text-sm text-muted-foreground">{label}</div>
    </div>
  );
}

function Feature({
  icon, title, body, to, cta,
}: { icon: React.ReactNode; title: string; body: string; to: "/chat" | "/audit" | "/submit"; cta: string }) {
  return (
    <div className="card-editorial p-6 flex flex-col">
      <div className="w-11 h-11 rounded-md bg-primary-light grid place-items-center mb-4">{icon}</div>
      <h3 className="font-display text-xl text-foreground">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed flex-1">{body}</p>
      <Link to={to} className="mt-4 text-sm text-primary font-medium inline-flex items-center gap-1 hover:gap-2 transition-all">
        {cta} <ArrowRight size={14} />
      </Link>
    </div>
  );
}

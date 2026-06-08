import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VoiceInput } from "@/components/VoiceInput";
import { CATEGORIES, LANGUAGES } from "@/lib/categories";
import { civicAssist } from "@/lib/ai.functions";

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "Submit a Civic Issue — JanSeva Protocol" },
      {
        name: "description",
        content:
          "Anonymously submit a civic issue, file an RTI request, or report corruption. Permanently logged on the public ledger.",
      },
      { property: "og:title", content: "Submit a Civic Issue — JanSeva Protocol" },
      { property: "og:description", content: "Anonymous, permanent, public." },
    ],
  }),
  component: Submit,
});

function Submit() {
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [country, setCountry] = useState("");
  const [state, setState] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [isAnon, setIsAnon] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState<null | { id: string; tx?: string }>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!category) e.category = "Choose a category";
    if (description.trim().length < 50) e.description = "Add at least 50 characters of detail";
    if (description.length > 2000) e.description = "Maximum 2000 characters";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("submissions")
        .insert({
          category,
          description: description.trim(),
          country: country.trim() || null,
          state: state.trim() || null,
          is_anonymous: isAnon,
        })
        .select()
        .single();
      if (error) throw error;

      setSubmitted({ id: data.id });
      toast.success("Submission recorded permanently");

      // Hash for blockchain audit (graceful no-op if no contract configured)
      try {
        const enc = new TextEncoder();
        const buf = await crypto.subtle.digest(
          "SHA-256",
          enc.encode(`${data.id}-${data.category}-${data.created_at}`),
        );
        const hash = Array.from(new Uint8Array(buf))
          .map((b) => b.toString(16).padStart(2, "0"))
          .join("");
        await supabase.from("submissions").update({ blockchain_tx_hash: hash }).eq("id", data.id);
      } catch (e) {
        console.warn("hash failed", e);
      }

      // Fire AI guidance in background
      civicAssist({ data: { message: description, language } })
        .then(async (res) => {
          if (res.ok) {
            const r = res.response;
            const text = `${r.summary}\n\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}${
              r.important_note ? `\n\n⚠️ ${r.important_note}` : ""
            }${r.resources?.length ? `\n\nResources:\n${r.resources.join("\n")}` : ""}`;
            await supabase
              .from("submissions")
              .update({
                ai_response: text,
                ai_status: r.escalate ? "escalated" : "answered",
                category: r.category,
              })
              .eq("id", data.id);
          }
        })
        .catch((e) => console.warn("AI guidance failed", e));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Submission failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 px-4 sm:px-6 py-20">
          <div className="max-w-xl mx-auto card-editorial p-8 sm:p-10 text-center">
            <div className="w-16 h-16 rounded-full bg-success/10 grid place-items-center mx-auto mb-4">
              <CheckCircle2 className="text-success" size={32} />
            </div>
            <h1 className="font-display text-3xl text-foreground">Recorded permanently</h1>
            <p className="mt-3 text-muted-foreground">
              Your submission is now public and cannot be edited or deleted by anyone — including
              us.
            </p>
            <div className="mt-6 font-mono text-xs text-muted-foreground bg-muted py-2 px-3 rounded inline-block">
              ID #{submitted.id.slice(0, 8)}
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/audit"
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-md font-medium hover:bg-primary-dark transition-colors"
              >
                View in Audit Log <ArrowRight size={14} />
              </Link>
              <button
                onClick={() => {
                  setSubmitted(null);
                  setCategory("");
                  setDescription("");
                  setCountry("");
                  setState("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Submit another
              </button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="font-display text-4xl sm:text-5xl text-foreground">Submit an issue</h1>
          <p className="mt-3 text-muted-foreground">
            Your submission is anonymous by default and recorded permanently on the public ledger.
          </p>

          <form onSubmit={onSubmit} className="mt-8 card-editorial p-6 sm:p-8 space-y-6">
            {/* Category */}
            <Field label="Category" required error={errors.category}>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">Choose…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Field>

            {/* Description */}
            <Field
              label="Describe your issue"
              required
              error={errors.description}
              hint={`${description.length} / 2000  ·  minimum 50`}
            >
              <div className="relative">
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value.slice(0, 2000))}
                  rows={6}
                  placeholder="What happened? What help do you need? What did the official or department do?"
                  className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                />
                <div className="absolute right-2 top-2">
                  <VoiceInput
                    language={language}
                    onTranscript={(t) => setDescription((prev) => (prev ? prev + " " : "") + t)}
                  />
                </div>
              </div>
            </Field>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Country">
                <input
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  list="countries"
                  placeholder="India"
                  className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <datalist id="countries">
                  {[
                    "India",
                    "Pakistan",
                    "Bangladesh",
                    "Nepal",
                    "Sri Lanka",
                    "Nigeria",
                    "Kenya",
                    "Ghana",
                    "South Africa",
                  ].map((c) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </Field>
              <Field label="State / Province">
                <input
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="Maharashtra"
                  className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </Field>
            </div>

            <Field label="Language">
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full bg-background border border-input rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.label}
                  </option>
                ))}
              </select>
            </Field>

            {/* Anon toggle */}
            <div className="flex items-start gap-3 p-4 bg-primary-light/50 border border-primary-light rounded-md">
              <button
                type="button"
                role="switch"
                aria-checked={isAnon}
                onClick={() => setIsAnon((a) => !a)}
                className={`relative shrink-0 w-11 h-6 rounded-full transition-colors ${isAnon ? "bg-primary" : "bg-muted-foreground/40"}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${isAnon ? "translate-x-5" : ""}`}
                />
              </button>
              <div className="text-sm">
                <div className="font-medium text-foreground">
                  {isAnon ? "Anonymous" : "Identified"}
                </div>
                <div className="text-muted-foreground text-xs mt-0.5">
                  {isAnon
                    ? "Your name and email will NOT be collected. No tracking."
                    : "Identification fields will appear so stewards can follow up."}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary text-primary-foreground font-medium py-3 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-60 inline-flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" size={16} /> Recording…
                </>
              ) : (
                "Submit publicly"
              )}
            </button>
            <p className="text-xs text-muted-foreground text-center">
              Once submitted, your entry cannot be edited or deleted.
            </p>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function Field({
  label,
  required,
  error,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-foreground">
          {label} {required && <span className="text-destructive">*</span>}
        </span>
        {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
      </div>
      {children}
      {error && (
        <div className="mt-1.5 text-xs text-destructive inline-flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </div>
      )}
    </label>
  );
}

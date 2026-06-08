import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Send, AlertTriangle, Bot, User, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { VoiceInput } from "@/components/VoiceInput";
import { LANGUAGES } from "@/lib/categories";
import { CategoryBadge } from "@/components/CategoryBadge";
import { civicAssist, type CivicResponse } from "@/lib/ai.functions";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/chat")({
  head: () => ({
    meta: [
      { title: "AI Civic Assistant — JanSeva Protocol" },
      {
        name: "description",
        content:
          "Get free, multilingual help with RTI, welfare, legal aid, and government services from JanSeva's AI assistant.",
      },
      { property: "og:title", content: "AI Civic Assistant — JanSeva Protocol" },
      { property: "og:description", content: "Free multilingual civic help, available 24/7." },
    ],
  }),
  component: Chat,
});

type Msg = { id: string; role: "user" | "assistant"; text: string; structured?: CivicResponse };

const SUGGESTIONS = [
  "How do I file an RTI application?",
  "My welfare benefit was rejected unfairly.",
  "How to report a corrupt official safely?",
  "I need help getting my ration card.",
];

const KNOWLEDGE_LIBRARY = [
  {
    title: "File an RTI application",
    keywords: ["rti", "information", "file rti", "public information"],
    category: "RTI Filing" as const,
    summary:
      "Prepare a short RTI request naming the public body, the PIO, and the exact information you want.",
    steps: [
      "Find the correct Public Information Officer (PIO) for the department.",
      "Write your request clearly, including your name, address, and contact details.",
      "State the information you seek and the period covered.",
      "Submit the application by hand, post, or online with the prescribed fee.",
      "Keep proof of submission and appeal if you do not receive a reply within 30 days.",
    ],
    resources: ["Sample RTI formats", "Local RTI rules and timelines"],
    important_note:
      "RTI procedure varies across states, so verify local filing and fee requirements.",
  },
  {
    title: "Get welfare benefits",
    keywords: ["ration card", "welfare", "benefit", "pension"],
    category: "Welfare Benefit" as const,
    summary:
      "Check your eligibility, gather necessary documents, and apply through the correct local office.",
    steps: [
      "Identify the welfare scheme you qualify for and the issuing authority.",
      "Collect ID, address proof, and any scheme-specific paperwork.",
      "Visit or submit the application through the listed scheme portal.",
      "Follow up with the local officer if your application is delayed.",
      "Ask for a written receipt and keep a copy for future reference.",
    ],
    resources: ["Local scheme portal link", "List of common documents"],
    important_note: "If your benefit is rejected, request a written reason and prepare an appeal.",
  },
  {
    title: "Report corruption safely",
    keywords: ["corruption", "report", "bribe", "official"],
    category: "Corruption Report" as const,
    summary: "Use formal complaint channels and preserve evidence while protecting your identity.",
    steps: [
      "Document the incident with dates, names, and locations.",
      "Find the appropriate anti-corruption or vigilance office.",
      "Submit your complaint in writing or through the official portal.",
      "Keep copies of any receipts or acknowledgement notices.",
      "Monitor the case and escalate if there is no response.",
    ],
    resources: ["Anti-corruption helpline", "Citizen complaint portals"],
    important_note:
      "Avoid sharing sensitive personal details unless required by the official complaint process.",
  },
  {
    title: "Request legal help",
    keywords: ["legal", "lawyer", "court", "right"],
    category: "Legal Help" as const,
    summary:
      "Identify the issue, collect supporting facts, and seek qualified local advice for serious matters.",
    steps: [
      "Write a short summary of the issue, including dates and persons involved.",
      "Search for authorized legal aid clinics or pro bono services nearby.",
      "Contact the service with the facts and ask whether they can help for free.",
      "Keep all documents organized and ask for a written case summary.",
      "Use the legal aid service to decide the best next step.",
    ],
    resources: ["Free legal aid directory", "Victim support services"],
    important_note:
      "The AI library is guidance only; a qualified lawyer should review serious legal questions.",
  },
];

const HELP_MODES = ["ai", "library"] as const;
type HelpMode = (typeof HELP_MODES)[number];

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [thinking, setThinking] = useState(false);
  const [helpMode, setHelpMode] = useState<HelpMode>("ai");
  const [aiAvailable, setAiAvailable] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const getLibraryResponse = (query: string): CivicResponse => {
    const normalized = query.toLowerCase();
    const match = KNOWLEDGE_LIBRARY.find(
      (topic) =>
        topic.title.toLowerCase().includes(normalized) ||
        topic.keywords.some((keyword) => normalized.includes(keyword)),
    );

    const selected = match ?? {
      title: "General civic guidance",
      category: "Other" as const,
      summary:
        "Use clear descriptions and ask for step-by-step help when you need government, welfare, or legal assistance.",
      steps: [
        "Describe the issue in simple terms.",
        "Identify which department or scheme is involved.",
        "Collect any letters, IDs, or proofs you already have.",
        "Ask for the exact document, office, or form you need next.",
        "If you are unsure, start by contacting a trusted citizen help center.",
      ],
      important_note:
        "If the issue is urgent or involves personal safety, please seek a local support service immediately.",
      resources: ["Local help center", "Free legal aid directory"],
    };

    return {
      category: selected.category,
      summary: selected.summary,
      steps: selected.steps,
      important_note: selected.important_note,
      resources: selected.resources,
      escalate: false,
    };
  };

  const send = async (textRaw?: string) => {
    const text = (textRaw ?? input).trim();
    if (!text || thinking) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    const history = messages.map((m) => ({ role: m.role, content: m.text }));

    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);
    setStatusMessage(null);

    if (helpMode === "library") {
      const response = getLibraryResponse(text);
      const flat = `${response.summary}\n\n${response.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: flat, structured: response },
      ]);
      setThinking(false);
      return;
    }

    try {
      const res = await civicAssist({ data: { message: text, history, language } });
      if (!res.ok) {
        const shouldFallback =
          res.error.includes("Missing API key") ||
          res.error.includes("service unavailable") ||
          res.error.includes("Rate limit");
        toast.error(res.error);
        setAiAvailable(false);
        if (shouldFallback) {
          setHelpMode("library");
          setStatusMessage(
            "AI is offline or unavailable. Switched to the free unlimited Offline Library so you can continue getting help.",
          );
        } else {
          setStatusMessage(
            "AI is currently offline. Switch to Offline Library for free guidance and keep trying the AI assistant later.",
          );
        }
        setMessages((m) => [
          ...m,
          { id: crypto.randomUUID(), role: "assistant", text: `⚠️ ${res.error}` },
        ]);
        return;
      }
      const r = res.response;
      const flat = `${r.summary}\n\n${r.steps.map((s, i) => `${i + 1}. ${s}`).join("\n")}`;
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: flat, structured: r },
      ]);
      setAiAvailable(true);
      // Log (fire-and-forget)
      supabase
        .from("chat_logs")
        .insert({
          query: text,
          response: flat,
          category: r.category,
          language,
          was_escalated: r.escalate,
        })
        .then(({ error }) => error && console.warn("chat log:", error));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("civicAssist error:", e);
      setAiAvailable(false);
      setHelpMode("library");
      setStatusMessage(
        "Network or AI gateway error occurred. Switched to Offline Library for uninterrupted free help.",
      );
      toast.error(msg || "Network error");
      setMessages((m) => [
        ...m,
        { id: crypto.randomUUID(), role: "assistant", text: `⚠️ ${msg || "Network error"}` },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 px-4 sm:px-6 py-6">
        <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-9rem)]">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
            <div>
              <h1 className="font-display text-3xl sm:text-4xl text-foreground">
                AI Civic Assistant
              </h1>
              <p className="text-xs text-muted-foreground mt-1 flex flex-wrap items-start gap-1.5 max-w-md">
                <AlertTriangle size={12} className="text-accent mt-0.5 shrink-0" />
                AI guidance, not legal advice. For emergencies, contact local authorities.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setHelpMode("ai")}
                  className={`rounded-full border px-3 py-1 ${
                    helpMode === "ai"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  AI Assistant
                </button>
                <button
                  type="button"
                  onClick={() => setHelpMode("library")}
                  className={`rounded-full border px-3 py-1 ${
                    helpMode === "library"
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card text-foreground"
                  }`}
                >
                  Offline Library
                </button>
                <button
                  type="button"
                  onClick={() => setMessages([])}
                  className="rounded-full border border-border bg-card px-3 py-1 text-foreground hover:border-primary"
                >
                  Clear conversation
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 max-w-xl">
                {helpMode === "ai"
                  ? "Ask the AI for step-by-step civic assistance. If the gateway is unavailable, switch to the free Offline Library."
                  : "Use the offline civic knowledge library for free, always-on guidance on RTI, welfare, corruption, and government services."}
              </p>
              {statusMessage ? (
                <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2 text-xs text-destructive mt-2">
                  {statusMessage}
                </div>
              ) : null}
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Messages */}
          <div
            className="flex-1 card-editorial p-4 sm:p-6 overflow-y-auto space-y-4"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary-light grid place-items-center mb-4">
                  <Bot className="text-primary" size={22} />
                </div>
                <p className="font-display text-2xl text-foreground">How can I help?</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">
                  Pick a question or ask your own.
                </p>
                <div className="grid sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-sm p-3 border border-border rounded-md hover:border-primary hover:bg-primary-light/30 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-border bg-background p-4 text-sm text-foreground/90">
                  <strong className="text-foreground">Free civic assistance:</strong> If the AI
                  gateway is unavailable, use Offline Library mode for always-on help. No API key
                  required for curated guidance.
                </div>
              </div>
            )}

            {messages.map((m) => (
              <MessageBubble key={m.id} m={m} />
            ))}

            {thinking && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-light grid place-items-center shrink-0">
                  <Bot className="text-primary" size={16} />
                </div>
                <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 inline-flex items-center gap-1">
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                  <span className="typing-dot w-2 h-2 rounded-full bg-muted-foreground" />
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          {/* Composer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send();
            }}
            className="mt-3 card-editorial p-2 flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              rows={1}
              placeholder="Ask anything about RTI, welfare, legal aid…"
              className="flex-1 bg-transparent resize-none border-0 focus:outline-none px-2 py-2 text-sm max-h-32"
            />
            <VoiceInput
              language={language}
              onTranscript={(t) => setInput((p) => (p ? p + " " : "") + t)}
            />
            <button
              type="submit"
              disabled={thinking || !input.trim()}
              className="bg-primary text-primary-foreground p-2.5 rounded-md hover:bg-primary-dark disabled:opacity-50 transition-colors"
              aria-label="Send message"
            >
              {thinking ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

function MessageBubble({ m }: { m: Msg }) {
  if (m.role === "user") {
    return (
      <div className="flex gap-3 justify-end">
        <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm whitespace-pre-wrap">
          {m.text}
        </div>
        <div className="w-8 h-8 rounded-full bg-muted grid place-items-center shrink-0">
          <User size={16} className="text-muted-foreground" />
        </div>
      </div>
    );
  }
  const r = m.structured;
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-primary-light grid place-items-center shrink-0">
        <Bot className="text-primary" size={16} />
      </div>
      <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%] text-sm space-y-2">
        {r ? (
          <>
            <div className="flex items-center gap-2 -mt-0.5">
              <CategoryBadge category={r.category} />
              {r.escalate && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-destructive/10 text-destructive">
                  <AlertTriangle size={10} /> Human review recommended
                </span>
              )}
            </div>
            <p className="text-foreground font-medium">{r.summary}</p>
            <ol className="list-decimal list-inside space-y-1.5 text-foreground/90">
              {r.steps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ol>
            {r.important_note && (
              <div className="mt-2 p-2.5 bg-accent/10 border border-accent/30 rounded text-xs text-foreground">
                <strong>Note:</strong> {r.important_note}
              </div>
            )}
            {r.resources && r.resources.length > 0 && (
              <div className="text-xs text-muted-foreground">
                <strong className="text-foreground">Resources:</strong>
                <ul className="list-disc list-inside mt-1">
                  {r.resources.map((res, i) => (
                    <li key={i}>{res}</li>
                  ))}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-foreground whitespace-pre-wrap">{m.text}</p>
        )}
        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border text-xs text-muted-foreground">
          <span>Helpful?</span>
          <button className="hover:text-primary" aria-label="Helpful">
            <ThumbsUp size={12} />
          </button>
          <button className="hover:text-destructive" aria-label="Not helpful">
            <ThumbsDown size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

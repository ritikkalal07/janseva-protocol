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
        content: "Get free, multilingual help with RTI, welfare, legal aid, and government services from JanSeva's AI assistant.",
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

function Chat() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [language, setLanguage] = useState("en-IN");
  const [thinking, setThinking] = useState(false);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async (textRaw?: string) => {
    const text = (textRaw ?? input).trim();
    if (!text || thinking) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", text };
    const history = messages.map((m) => ({ role: m.role, content: m.text }));
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setThinking(true);

    try {
      const res = await civicAssist({ data: { message: text, history, language } });
      if (!res.ok) {
        toast.error(res.error);
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
    } catch (e) {
      console.error(e);
      toast.error("Network error");
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
              <h1 className="font-display text-3xl sm:text-4xl text-foreground">AI Civic Assistant</h1>
              <p className="text-xs text-muted-foreground mt-1 flex items-start gap-1.5 max-w-md">
                <AlertTriangle size={12} className="text-accent mt-0.5 shrink-0" />
                AI guidance, not legal advice. For emergencies, contact local authorities.
              </p>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 card-editorial p-4 sm:p-6 overflow-y-auto space-y-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary-light grid place-items-center mb-4">
                  <Bot className="text-primary" size={22} />
                </div>
                <p className="font-display text-2xl text-foreground">How can I help?</p>
                <p className="text-sm text-muted-foreground mt-1 mb-6">Pick a question or ask your own.</p>
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
            onSubmit={(e) => { e.preventDefault(); send(); }}
            className="mt-3 card-editorial p-2 flex items-end gap-2"
          >
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
              }}
              rows={1}
              placeholder="Ask anything about RTI, welfare, legal aid…"
              className="flex-1 bg-transparent resize-none border-0 focus:outline-none px-2 py-2 text-sm max-h-32"
            />
            <VoiceInput language={language} onTranscript={(t) => setInput((p) => (p ? p + " " : "") + t)} />
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
              {r.steps.map((s, i) => <li key={i}>{s}</li>)}
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
                  {r.resources.map((res, i) => <li key={i}>{res}</li>)}
                </ul>
              </div>
            )}
          </>
        ) : (
          <p className="text-foreground whitespace-pre-wrap">{m.text}</p>
        )}
        <div className="flex items-center gap-2 pt-2 mt-2 border-t border-border text-xs text-muted-foreground">
          <span>Helpful?</span>
          <button className="hover:text-primary" aria-label="Helpful"><ThumbsUp size={12} /></button>
          <button className="hover:text-destructive" aria-label="Not helpful"><ThumbsDown size={12} /></button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";

// Minimal browser SpeechRecognition typing
type SRConstructor = new () => {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
};

export function VoiceInput({
  onTranscript,
  language = "en-IN",
}: {
  onTranscript: (text: string) => void;
  language?: string;
}) {
  const [supported, setSupported] = useState(false);
  const [recording, setRecording] = useState(false);
  const recRef = useRef<InstanceType<SRConstructor> | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = window as unknown as {
      SpeechRecognition?: SRConstructor;
      webkitSpeechRecognition?: SRConstructor;
    };
    setSupported(Boolean(w.SpeechRecognition || w.webkitSpeechRecognition));
  }, []);

  const start = () => {
    const w = window as unknown as {
      SpeechRecognition?: SRConstructor;
      webkitSpeechRecognition?: SRConstructor;
    };
    const SR = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang = language;
    rec.onresult = (event) => {
      const transcript = Array.from(event.results as ArrayLike<ArrayLike<{ transcript: string }>>)
        .map((r) => r[0].transcript)
        .join("");
      onTranscript(transcript);
    };
    rec.onend = () => setRecording(false);
    rec.onerror = () => setRecording(false);
    recRef.current = rec;
    rec.start();
    setRecording(true);
  };

  const stop = () => {
    recRef.current?.stop();
    setRecording(false);
  };

  if (!supported) {
    return (
      <span className="text-xs text-muted-foreground">Voice not supported in this browser</span>
    );
  }

  return (
    <button
      type="button"
      onClick={recording ? stop : start}
      aria-label={recording ? "Stop recording" : "Start voice input"}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border text-xs transition-colors ${
        recording
          ? "border-destructive bg-destructive/10 text-destructive"
          : "border-border bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {recording ? (
        <>
          <span className="w-2 h-2 rounded-full bg-destructive pulse-dot" />
          <MicOff size={14} /> Stop
        </>
      ) : (
        <>
          <Mic size={14} /> Speak
        </>
      )}
    </button>
  );
}

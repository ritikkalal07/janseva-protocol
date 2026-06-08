export const CATEGORIES = [
  "RTI Filing",
  "Legal Help",
  "Corruption Report",
  "Welfare Benefit",
  "Government Service",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_CONFIG: Record<string, { color: string; bg: string; label: string }> = {
  "RTI Filing": { color: "#92400E", bg: "#FEF3C7", label: "RTI Filing" },
  "Legal Help": { color: "#1E40AF", bg: "#DBEAFE", label: "Legal Help" },
  "Corruption Report": { color: "#991B1B", bg: "#FEE2E2", label: "Corruption" },
  "Welfare Benefit": { color: "#065F46", bg: "#D1FAE5", label: "Welfare" },
  "Government Service": { color: "#4C1D95", bg: "#EDE9FE", label: "Gov Service" },
  Other: { color: "#374151", bg: "#F3F4F6", label: "Other" },
};

export const LANGUAGES = [
  { code: "en-IN", label: "English" },
  { code: "hi-IN", label: "हिन्दी (Hindi)" },
  { code: "ta-IN", label: "தமிழ் (Tamil)" },
  { code: "te-IN", label: "తెలుగు (Telugu)" },
  { code: "bn-IN", label: "বাংলা (Bengali)" },
  { code: "mr-IN", label: "मराठी (Marathi)" },
  { code: "gu-IN", label: "ગુજરાતી (Gujarati)" },
  { code: "kn-IN", label: "ಕನ್ನಡ (Kannada)" },
  { code: "ml-IN", label: "മലയാളം (Malayalam)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ (Punjabi)" },
  { code: "ur-IN", label: "اردو (Urdu)" },
  { code: "es-ES", label: "Español (Spanish)" },
  { code: "fr-FR", label: "Français (French)" },
  { code: "de-DE", label: "Deutsch (German)" },
  { code: "pt-BR", label: "Português (Portuguese)" },
  { code: "ar-SA", label: "العربية (Arabic)" },
  { code: "sw-KE", label: "Kiswahili (Swahili)" },
  { code: "ja-JP", label: "日本語 (Japanese)" },
  { code: "zh-CN", label: "简体中文 (Chinese)" },
  { code: "ru-RU", label: "Русский (Russian)" },
  { code: "ko-KR", label: "한국어 (Korean)" },
  { code: "tr-TR", label: "Türkçe (Turkish)" },
  { code: "vi-VN", label: "Tiếng Việt (Vietnamese)" },
  { code: "it-IT", label: "Italiano (Italian)" },
];

/** Shared constants — topic colors, icons, band labels */

export const TOPIC_COLORS: Record<string, [string, string, string]> = {
  general: ["bg-slate-700", "border-slate-600", "text-slate-300"],
  "art and culture": ["bg-purple-900/40", "border-purple-700", "text-purple-300"],
  "science and research": ["bg-blue-900/40", "border-blue-700", "text-blue-300"],
  "health and medicine": ["bg-red-900/40", "border-red-700", "text-red-300"],
  "space and exploration": ["bg-indigo-900/40", "border-indigo-700", "text-indigo-300"],
  "law and government": ["bg-gray-800/60", "border-gray-600", "text-gray-300"],
  "education and learning": ["bg-cyan-900/40", "border-cyan-700", "text-cyan-300"],
  "work and employment": ["bg-orange-900/40", "border-orange-700", "text-orange-300"],
  "environment and ecology": ["bg-emerald-900/40", "border-emerald-700", "text-emerald-300"],
  "business and economics": ["bg-yellow-900/40", "border-yellow-700", "text-yellow-300"],
  "psychology and behavior": ["bg-pink-900/40", "border-pink-700", "text-pink-300"],
  "language and communication": ["bg-teal-900/40", "border-teal-700", "text-teal-300"],
  "agriculture and food": ["bg-lime-900/40", "border-lime-700", "text-lime-300"],
  "media and advertising": ["bg-fuchsia-900/40", "border-fuchsia-700", "text-fuchsia-300"],
  "history and archaeology": ["bg-amber-900/40", "border-amber-700", "text-amber-300"],
  "technology and innovation": ["bg-violet-900/40", "border-violet-700", "text-violet-300"],
  "wildlife and conservation": ["bg-green-900/40", "border-green-700", "text-green-300"],
  "transport and infrastructure": ["bg-sky-900/40", "border-sky-700", "text-sky-300"],
  "urban planning and architecture": ["bg-stone-800/60", "border-stone-600", "text-stone-300"],
  "climate and weather": ["bg-cyan-900/40", "border-cyan-600", "text-cyan-200"],
  "society and social issues": ["bg-rose-900/40", "border-rose-700", "text-rose-300"],
};

export const TOPIC_ICONS: Record<string, string> = {
  general: "📚",
  "art and culture": "🎨",
  "science and research": "🔬",
  "health and medicine": "🏥",
  "space and exploration": "🚀",
  "law and government": "⚖️",
  "education and learning": "🎓",
  "work and employment": "💼",
  "environment and ecology": "🌿",
  "business and economics": "📊",
  "psychology and behavior": "🧠",
  "language and communication": "💬",
  "agriculture and food": "🌾",
  "media and advertising": "📺",
  "history and archaeology": "🏛️",
  "technology and innovation": "💡",
  "wildlife and conservation": "🦁",
  "transport and infrastructure": "🚆",
  "urban planning and architecture": "🏗️",
  "climate and weather": "🌦️",
  "society and social issues": "👥",
};

export const BAND_LABELS: Record<string, { text: string; cls: string }> = {
  band_5_6: { text: "5-6", cls: "bg-emerald-900/40 border-emerald-700 text-emerald-300" },
  band_6_7: { text: "6.5-7", cls: "bg-blue-900/40 border-blue-700 text-blue-300" },
  band_7_plus: { text: "7.5+", cls: "bg-purple-900/40 border-purple-700 text-purple-300" },
};

export function getTopicColors(topic: string) {
  return TOPIC_COLORS[topic] || TOPIC_COLORS.general;
}

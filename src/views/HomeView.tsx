import { useEffect, useState } from "react";
import { getStats, getTopics, searchWords, type Stats, type TopicInfo, type WordBrief } from "../lib/api";
import { getTopicColors, TOPIC_ICONS } from "../lib/constants";
import { useNavigate } from "react-router-dom";

export default function HomeView({ onShowWord }: { onShowWord: (w: string) => void }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [hotWords, setHotWords] = useState<WordBrief[]>([]);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getStats().then(setStats);
    getTopics().then(setTopics);
    searchWords({ sort: "score", size: 30 }).then((d) => setHotWords(d.items));
  }, []);

  const handleSearch = () => {
    if (!query.trim()) return;
    navigate(`/browse?q=${encodeURIComponent(query.trim())}`);
  };

  const handleTopic = (topic: string) => {
    navigate(`/browse?topic=${encodeURIComponent(topic)}`);
  };

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-10">
        <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          雅思词汇探索
        </h1>
        <p className="text-slate-400 mb-8">基于剑桥雅思 1-20 语料库 · 9400+ 词汇 · 数据驱动</p>
        <div className="max-w-xl mx-auto relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="搜索单词或中文释义…"
            className="w-full bg-slate-900 border border-slate-700 rounded-2xl px-5 py-4 text-lg focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition placeholder:text-slate-500"
          />
          <button onClick={handleSearch} className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl transition text-sm font-medium">
            搜索
          </button>
        </div>
      </div>

      {/* Stats KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { value: stats?.total_words, label: "总词汇", color: "text-emerald-400" },
          { value: stats?.awl_count, label: "AWL 学术词", color: "text-blue-400" },
          { value: stats?.answer_word_count, label: "答案高频词", color: "text-amber-400" },
          { value: stats?.topic_count, label: "话题分类", color: "text-purple-400" },
        ].map(({ value, label, color }) => (
          <div key={label} className="bg-slate-900 rounded-2xl p-5 border border-slate-800 text-center">
            <div className={`text-3xl font-bold ${color}`}>{value?.toLocaleString() ?? "—"}</div>
            <div className="text-slate-400 text-sm mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Topic Grid */}
      <h2 className="text-xl font-semibold mb-4">话题分类</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-10">
        {topics.filter((t) => t.topic !== "general").map((t) => {
          const [bg, border, text] = getTopicColors(t.topic);
          const icon = TOPIC_ICONS[t.topic] || "📖";
          return (
            <div key={t.topic} className={`topic-card ${bg} border ${border} rounded-2xl p-4 ${text}`} onClick={() => handleTopic(t.topic)}>
              <div className="text-2xl mb-2">{icon}</div>
              <div className="font-medium text-sm leading-tight">{t.topic}</div>
              <div className="text-xs opacity-70 mt-1">{t.count} 词</div>
            </div>
          );
        })}
      </div>

      {/* Hot Words */}
      <h2 className="text-xl font-semibold mb-4">高频核心词</h2>
      <div className="flex flex-wrap gap-2 mb-10">
        {hotWords.map((w) => {
          const [bg, border, text] = getTopicColors(w.topics[0]);
          return (
            <span key={w.word} className={`hot-pill ${bg} border ${border} ${text} px-3 py-1.5 rounded-full text-sm font-medium`} onClick={() => onShowWord(w.word)}>
              {w.word}
            </span>
          );
        })}
      </div>
    </div>
  );
}

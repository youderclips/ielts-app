import type { WordBrief } from "../lib/api";
import { BAND_LABELS, getTopicColors } from "../lib/constants";
import { isFav, toggleFav } from "../lib/favorites";
import { useState } from "react";

interface Props {
  word: WordBrief;
  index: number;
  onShowWord: (word: string) => void;
  onFavChange?: () => void;
}

export default function WordCard({ word: w, index, onShowWord, onFavChange }: Props) {
  const [fav, setFav] = useState(isFav(w.word));
  const bandInfo = BAND_LABELS[w.band_level] || { text: "—", cls: "bg-slate-800 border-slate-700 text-slate-400" };
  const pct = Math.min(100, (w.score / 18) * 100);
  const topicTag = w.topics[0] && w.topics[0] !== "general" ? w.topics[0] : "";
  const [tbg, tborder, ttext] = getTopicColors(w.topics[0]);

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    const now = toggleFav(w.word);
    setFav(now);
    onFavChange?.();
  };

  return (
    <div
      className="card-glow bg-slate-900 border border-slate-800 rounded-2xl p-4 fade-in cursor-pointer"
      style={{ animationDelay: `${index * 30}ms` }}
      onClick={() => onShowWord(w.word)}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="text-lg font-semibold">{w.word}</div>
        <button
          className={`${fav ? "text-red-400" : "text-slate-600"} hover:text-red-400 text-lg transition`}
          onClick={handleFav}
        >
          {fav ? "♥" : "♡"}
        </button>
      </div>
      <div className="text-slate-400 text-sm font-cn mb-3 line-clamp-1">{w.meaning_cn || ""}</div>
      <div className="score-bar mb-3">
        <div className="score-bar-fill bg-emerald-500" style={{ width: `${pct}%` }} />
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className={`badge ${bandInfo.cls}`}>Band {bandInfo.text}</span>
        {w.is_awl && <span className="badge bg-blue-900/40 border-blue-700 text-blue-300">AWL</span>}
        {w.is_answer_word && <span className="badge bg-amber-900/40 border-amber-700 text-amber-300">答案词</span>}
        {w.trend === "rising" && <span className="badge bg-green-900/40 border-green-700 text-green-300">↑ 上升</span>}
        {topicTag && <span className={`badge ${tbg} ${tborder} ${ttext} text-xs`}>{topicTag}</span>}
      </div>
    </div>
  );
}

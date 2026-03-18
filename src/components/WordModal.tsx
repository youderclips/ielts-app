import { useEffect, useState } from "react";
import { getWord, type WordDetail } from "../lib/api";
import { BAND_LABELS, getTopicColors, TOPIC_ICONS } from "../lib/constants";
import { isFav, toggleFav } from "../lib/favorites";

interface Props {
  word: string | null;
  onClose: () => void;
  onNavigate: (word: string) => void;
  onFavChange?: () => void;
}

function highlightWord(text: string, word: string) {
  const re = new RegExp(`\\b(${word}\\w*)\\b`, "gi");
  return text.replace(re, '<span class="text-emerald-400 font-semibold not-italic">$1</span>');
}

export default function WordModal({ word: wordName, onClose, onNavigate, onFavChange }: Props) {
  const [data, setData] = useState<WordDetail | null>(null);
  const [fav, setFav] = useState(false);

  useEffect(() => {
    if (!wordName) return;
    getWord(wordName).then((d) => {
      if ("error" in d) return;
      setData(d);
      setFav(isFav(d.word));
    });
  }, [wordName]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  if (!wordName) return null;

  const handleFav = () => {
    if (!data) return;
    const now = toggleFav(data.word);
    setFav(now);
    onFavChange?.();
  };

  if (!data) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-10" onClick={onClose}>
        <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl mx-4 p-6 text-center">加载中...</div>
      </div>
    );
  }

  const c = data.corpus;
  const bandInfo = BAND_LABELS[data.band_level] || { text: "—", cls: "bg-slate-800 border-slate-700 text-slate-400" };

  const bars = [
    { label: "权重", val: c.score, max: 18, color: "bg-emerald-500" },
    { label: "频次", val: c.freq, max: 800, color: "bg-blue-500" },
    { label: "分布", val: c.spread, max: 21, color: "bg-purple-500" },
  ];

  const secStr = Object.entries(c.sections || {})
    .filter(([, v]) => v > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-10" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-2xl mx-4 p-6 fade-in" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold">{data.word}</h2>
            <div className="text-lg text-slate-300 font-cn mt-1">{data.meaning_cn}</div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={handleFav} className={`text-2xl hover:scale-110 transition ${fav ? "text-red-400" : ""}`}>
              {fav ? "♥" : "♡"}
            </button>
            <button onClick={onClose} className="text-slate-500 hover:text-white text-2xl transition ml-2">&times;</button>
          </div>
        </div>

        {/* Bars */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {bars.map((b) => (
            <div key={b.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">{b.label}</span>
                <span>{typeof b.val === "number" ? (b.val % 1 ? b.val.toFixed(1) : b.val) : b.val}</span>
              </div>
              <div className="score-bar">
                <div className={`score-bar-fill ${b.color}`} style={{ width: `${Math.min(100, (b.val / b.max) * 100)}%` }} />
              </div>
            </div>
          ))}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-5">
          <span className={`badge ${bandInfo.cls}`}>Band {bandInfo.text}</span>
          <span className="badge bg-slate-800 border-slate-700 text-slate-300">Tier {data.tier}</span>
          {c.is_awl && <span className="badge bg-blue-900/40 border-blue-700 text-blue-300">AWL 学术词</span>}
          {data.is_answer_word && <span className="badge bg-amber-900/40 border-amber-700 text-amber-300">答案词 ×{data.answer_freq}</span>}
          {data.trend === "rising" && <span className="badge bg-green-900/40 border-green-700 text-green-300">↑ 上升趋势</span>}
          {data.trend === "declining" && <span className="badge bg-red-900/40 border-red-700 text-red-300">↓ 下降</span>}
          {secStr && <span className="badge bg-slate-800 border-slate-700 text-slate-400">{secStr}</span>}
          {(data.topics || []).map((t) => {
            const [bg, border, text] = getTopicColors(t);
            return <span key={t} className={`badge ${bg} ${border} ${text}`}>{TOPIC_ICONS[t] || ""} {t}</span>;
          })}
        </div>

        {/* Sections */}
        <div className="space-y-5">
          {/* Word Family */}
          {data.word_family && data.word_family.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">词族</h4>
              <div className="flex flex-wrap gap-2">
                {data.word_family.map((w) => (
                  <span key={w} className="family-word text-sm bg-slate-800 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-700 transition" onClick={() => onNavigate(w)}>{w}</span>
                ))}
              </div>
            </div>
          )}

          {/* Paraphrase pairs or Synonyms */}
          {data.paraphrase_pairs && data.paraphrase_pairs.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">同义替换</h4>
              <div className="space-y-1.5">
                {data.paraphrase_pairs.map((p) => {
                  const pct = (p.sim * 100).toFixed(0);
                  return (
                    <div key={p.word} className="flex items-center gap-3 text-sm">
                      <span className="w-28 font-medium cursor-pointer hover:text-emerald-400 transition" onClick={() => onNavigate(p.word)}>{p.word}</span>
                      <div className="flex-1 score-bar"><div className="score-bar-fill bg-emerald-500" style={{ width: `${pct}%` }} /></div>
                      <span className="text-slate-500 w-12 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : data.synonyms && data.synonyms.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">近义词</h4>
              <div className="flex flex-wrap gap-2">
                {data.synonyms.map((s) => (
                  <span key={s} className="text-sm bg-slate-800 px-3 py-1 rounded-lg cursor-pointer hover:bg-slate-700 transition" onClick={() => onNavigate(s)}>{s}</span>
                ))}
              </div>
            </div>
          ) : null}

          {/* Collocations */}
          {data.collocations && data.collocations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">搭配词</h4>
              <div className="flex flex-wrap gap-2">
                {data.collocations.map((col) => (
                  <span key={col.pair} className="text-sm bg-slate-800 border border-slate-700 px-3 py-1.5 rounded-lg">
                    <span className="text-emerald-400">{col.pair}</span>
                    <span className="text-slate-500 text-xs ml-1">×{col.freq}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Example */}
          {data.example?.text && (
            <div>
              <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">真题例句</h4>
              <blockquote className="bg-slate-800/50 border-l-2 border-emerald-500 rounded-r-lg px-4 py-3">
                <p className="text-sm italic leading-relaxed" dangerouslySetInnerHTML={{ __html: highlightWord(data.example.text, data.word) }} />
                <p className="text-xs text-slate-500 mt-2">— {data.example.source}{data.example.page ? `, p.${data.example.page}` : ""}</p>
              </blockquote>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

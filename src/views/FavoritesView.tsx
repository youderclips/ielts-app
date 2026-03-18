import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWord, type WordBrief } from "../lib/api";
import { getFavs, saveFavs } from "../lib/favorites";
import WordCard from "../components/WordCard";

interface Props {
  onShowWord: (word: string) => void;
  refreshKey: number;
}

export default function FavoritesView({ onShowWord, refreshKey }: Props) {
  const [items, setItems] = useState<WordBrief[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const loadFavorites = async () => {
    const favs = getFavs();
    if (!favs.length) {
      setItems([]);
      return;
    }
    setLoading(true);
    const results: WordBrief[] = [];
    for (const w of favs) {
      const d = await getWord(w);
      if (!("error" in d)) {
        results.push({
          word: d.word,
          meaning_cn: d.meaning_cn || "",
          score: d.corpus.score,
          freq: d.corpus.freq,
          spread: d.corpus.spread,
          band_level: d.band_level,
          tier: d.tier,
          is_awl: d.corpus.is_awl,
          is_answer_word: d.is_answer_word,
          topics: d.topics || [],
          trend: d.trend,
          primary_section: d.primary_section,
        });
      }
    }
    setItems(results);
    setLoading(false);
  };

  useEffect(() => {
    loadFavorites();
  }, [refreshKey]);

  const clearAll = () => {
    if (!confirm("确定清空所有收藏？")) return;
    saveFavs([]);
    setItems([]);
  };

  const exportCSV = () => {
    const favs = getFavs();
    if (!favs.length) return;
    const blob = new Blob(["word\n" + favs.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "ielts_vocab_favorites.csv";
    a.click();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold">我的收藏 ({items.length})</h2>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 rounded-lg text-sm transition">导出 CSV</button>
          <button onClick={() => navigate("/learn?source=favorites")} className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition">开始学习</button>
          <button onClick={clearAll} className="bg-red-900/50 hover:bg-red-900 border border-red-800 px-4 py-2 rounded-lg text-sm transition">清空</button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-500">加载中...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-slate-500">
          <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" strokeWidth="1" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p>还没有收藏词汇</p>
          <p className="text-sm mt-1">浏览词汇时点击 ♡ 收藏</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {items.map((w, i) => (
            <WordCard key={w.word} word={w} index={i} onShowWord={onShowWord} onFavChange={loadFavorites} />
          ))}
        </div>
      )}
    </div>
  );
}

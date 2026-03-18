import { useEffect, useState, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { searchWords, getTopics, type TopicInfo, type WordBrief } from "../lib/api";
import WordCard from "../components/WordCard";
import Pagination from "../components/Pagination";

interface Props {
  onShowWord: (word: string) => void;
}

export default function BrowseView({ onShowWord }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [topics, setTopics] = useState<TopicInfo[]>([]);
  const [items, setItems] = useState<WordBrief[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Filter state from URL params
  const q = searchParams.get("q") || "";
  const topic = searchParams.get("topic") || "";
  const band = searchParams.get("band") || "";
  const section = searchParams.get("section") || "";
  const awl = searchParams.get("awl") === "true";
  const answer = searchParams.get("answer") === "true";
  const sort = searchParams.get("sort") || "score";

  useEffect(() => {
    getTopics().then(setTopics);
  }, []);

  const doSearch = useCallback(
    (p: number) => {
      setPage(p);
      searchWords({ q, topic, band, section, awl, answer, sort, page: p, size: 24 }).then((d) => {
        setTotal(d.total);
        setItems(d.items);
      });
    },
    [q, topic, band, section, awl, answer, sort]
  );

  useEffect(() => {
    doSearch(1);
  }, [doSearch]);

  const updateParam = (key: string, value: string) => {
    const sp = new URLSearchParams(searchParams);
    if (value) sp.set(key, value);
    else sp.delete(key);
    setSearchParams(sp);
  };

  const handleFilter = () => doSearch(1);

  return (
    <div>
      {/* Filters */}
      <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800 mb-6">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-slate-400 mb-1 block">搜索</label>
            <input
              type="text"
              value={q}
              onChange={(e) => updateParam("q", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleFilter()}
              placeholder="单词或中文…"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Band</label>
            <select value={band} onChange={(e) => updateParam("band", e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">全部</option>
              <option value="band_5_6">Band 5-6</option>
              <option value="band_6_7">Band 6.5-7</option>
              <option value="band_7_plus">Band 7.5+</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">话题</label>
            <select value={topic} onChange={(e) => updateParam("topic", e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">全部话题</option>
              {topics.map((t) => (
                <option key={t.topic} value={t.topic}>{t.topic} ({t.count})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">科目</label>
            <select value={section} onChange={(e) => updateParam("section", e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="">全部</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>
          <div className="flex gap-3">
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={awl} onChange={(e) => updateParam("awl", e.target.checked ? "true" : "")} className="accent-emerald-500" /> AWL
            </label>
            <label className="flex items-center gap-1.5 text-sm cursor-pointer">
              <input type="checkbox" checked={answer} onChange={(e) => updateParam("answer", e.target.checked ? "true" : "")} className="accent-amber-500" /> 答案词
            </label>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">排序</label>
            <select value={sort} onChange={(e) => updateParam("sort", e.target.value)} className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none">
              <option value="score">权重</option>
              <option value="freq">频次</option>
              <option value="alpha">字母</option>
            </select>
          </div>
          <button onClick={handleFilter} className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
            筛选
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-slate-400">共 {total} 个词汇</span>
        <Pagination total={total} page={page} size={24} onPageChange={doSearch} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
        {items.length === 0 ? (
          <div className="col-span-full text-center py-10 text-slate-500">没有找到匹配的词汇</div>
        ) : (
          items.map((w, i) => <WordCard key={w.word} word={w} index={i} onShowWord={onShowWord} />)
        )}
      </div>
      <div className="flex justify-center mb-6">
        <Pagination total={total} page={page} size={24} onPageChange={doSearch} />
      </div>
    </div>
  );
}

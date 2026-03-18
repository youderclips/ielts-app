import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { getWord, searchWords, getRandomWords, type WordDetail } from "../lib/api";
import { getFavs } from "../lib/favorites";
import { BAND_LABELS } from "../lib/constants";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type Mode = "" | "flashcard" | "spell" | "match";

export default function LearnView() {
  const [searchParams] = useSearchParams();
  const initSource = searchParams.get("source") || "favorites";

  const [source, setSource] = useState(initSource);
  const [mode, setMode] = useState<Mode>("");
  const [words, setWords] = useState<WordDetail[]>([]);
  const [idx, setIdx] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [spInput, setSpInput] = useState("");
  const [spFeedback, setSpFeedback] = useState<null | { ok: boolean; answer: string }>(null);
  const [matchSelected, setMatchSelected] = useState<{ side: string; word: string; idx: number } | null>(null);
  const [matchDone, setMatchDone] = useState(0);
  const [matchStates, setMatchStates] = useState<Record<string, string>>({});
  const [shuffledRight, setShuffledRight] = useState<WordDetail[]>([]);
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const loadWords = async (): Promise<WordDetail[]> => {
    let briefs;
    if (source === "favorites") {
      const favs = getFavs();
      if (!favs.length) { alert("收藏夹为空，请先收藏一些词汇"); return []; }
      const full = [];
      for (const w of favs) {
        const d = await getWord(w);
        if (!("error" in d)) full.push(d);
      }
      return shuffle(full);
    } else if (source === "random") {
      briefs = await getRandomWords({ count: 20 });
    } else if (source === "answer") {
      const data = await searchWords({ answer: true, sort: "score", size: 30 });
      briefs = data.items.slice(0, 20);
    } else {
      const data = await searchWords({ band: source, sort: "score", size: 30 });
      briefs = data.items.slice(0, 20);
    }
    const full = [];
    for (const b of briefs) {
      const d = await getWord(b.word);
      if (!("error" in d)) full.push(d);
    }
    return shuffle(full);
  };

  const startLearn = async (m: Mode) => {
    const w = await loadWords();
    if (!w.length) return;
    setWords(w);
    setIdx(0);
    setCorrect(0);
    setWrong(0);
    setFlipped(false);
    setSpInput("");
    setSpFeedback(null);
    setShowResults(false);
    setMode(m);
    if (m === "match") {
      const count = Math.min(8, w.length);
      const subset = w.slice(0, count);
      setShuffledRight(shuffle([...subset]));
      setMatchDone(0);
      setMatchSelected(null);
      setMatchStates({});
      setWords(subset);
    }
  };

  const endLearn = () => {
    setMode("");
    setShowResults(false);
  };

  const doShowResults = () => setShowResults(true);

  // --- Flashcard ---
  const fcNext = (known: boolean) => {
    if (known) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setFlipped(false);
    const next = idx + 1;
    if (next >= words.length) { setIdx(next); doShowResults(); }
    else setIdx(next);
  };

  // --- Spell ---
  const spCheck = () => {
    if (!spInput.trim()) return;
    const w = words[idx];
    const ok = spInput.trim().toLowerCase() === w.word.toLowerCase();
    if (ok) setCorrect((c) => c + 1);
    else setWrong((w) => w + 1);
    setSpFeedback({ ok, answer: w.word });
  };

  const spNext = () => {
    setSpInput("");
    setSpFeedback(null);
    const next = idx + 1;
    if (next >= words.length) { setIdx(next); doShowResults(); }
    else { setIdx(next); setTimeout(() => inputRef.current?.focus(), 50); }
  };

  // --- Match ---
  const matchClick = (side: string, word: string, btnIdx: number) => {
    const key = `${side}-${btnIdx}`;
    if (matchStates[key] === "matched") return;

    if (!matchSelected) {
      setMatchSelected({ side, word, idx: btnIdx });
      setMatchStates((s) => ({ ...s, [key]: "selected" }));
      return;
    }

    if (matchSelected.side === side) {
      const oldKey = `${matchSelected.side}-${matchSelected.idx}`;
      setMatchStates((s) => { const ns = { ...s }; delete ns[oldKey]; ns[key] = "selected"; return ns; });
      setMatchSelected({ side, word, idx: btnIdx });
      return;
    }

    const selKey = `${matchSelected.side}-${matchSelected.idx}`;
    if (matchSelected.word === word) {
      setCorrect((c) => c + 1);
      setMatchStates((s) => ({ ...s, [selKey]: "matched", [key]: "matched" }));
      setMatchSelected(null);
      const newDone = matchDone + 1;
      setMatchDone(newDone);
      if (newDone >= words.length) setTimeout(doShowResults, 500);
    } else {
      setWrong((w) => w + 1);
      setMatchStates((s) => ({ ...s, [key]: "selected" }));
      setTimeout(() => {
        setMatchStates((s) => { const ns = { ...s }; delete ns[selKey]; delete ns[key]; return ns; });
      }, 500);
      setMatchSelected(null);
    }
  };

  // --- Menu ---
  if (!mode) {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold mb-2">学习模式</h2>
        <p className="text-slate-400 mb-8">选择学习方式和词汇来源</p>
        <div className="max-w-md mx-auto mb-8">
          <label className="text-xs text-slate-400 mb-1 block text-left">词汇来源</label>
          <select value={source} onChange={(e) => setSource(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none">
            <option value="favorites">收藏词汇</option>
            <option value="band_5_6">Band 5-6 高频词</option>
            <option value="band_6_7">Band 6.5-7 学术词</option>
            <option value="band_7_plus">Band 7.5+ 进阶词</option>
            <option value="answer">答案高频词</option>
            <option value="random">随机抽取</option>
          </select>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { m: "flashcard" as Mode, icon: "🔄", title: "卡片翻转", desc: "看英文猜中文" },
            { m: "spell" as Mode, icon: "✏️", title: "拼写测试", desc: "看中文拼英文" },
            { m: "match" as Mode, icon: "🔗", title: "中英配对", desc: "连线匹配" },
          ].map(({ m, icon, title, desc }) => (
            <button key={m} onClick={() => startLearn(m)} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-emerald-500 transition group">
              <div className="text-4xl mb-3">{icon}</div>
              <div className="font-semibold group-hover:text-emerald-400 transition">{title}</div>
              <div className="text-slate-500 text-sm mt-1">{desc}</div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  // --- Results ---
  if (showResults) {
    const total = correct + wrong;
    const pct = total ? Math.round((correct / total) * 100) : 0;
    return (
      <div className="text-center py-10">
        <div className="text-5xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold mb-2">学习完成！</h3>
        <div className="text-slate-400 mb-6">{total} 个词 · 正确 {correct} · 正确率 {pct}%</div>
        <div className="flex justify-center gap-3">
          <button onClick={endLearn} className="bg-slate-800 hover:bg-slate-700 border border-slate-700 px-6 py-2 rounded-lg transition">返回菜单</button>
          <button onClick={() => startLearn(mode)} className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition">再来一轮</button>
        </div>
      </div>
    );
  }

  const w = words[idx];

  // --- Flashcard ---
  if (mode === "flashcard" && w) {
    const bandInfo = BAND_LABELS[w.band_level] || { text: "—", cls: "bg-slate-800 border-slate-700 text-slate-400" };
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={endLearn} className="text-slate-400 hover:text-white text-sm transition">← 返回</button>
          <div className="text-sm text-slate-400">{idx + 1} / {words.length}</div>
        </div>
        <div className="flex justify-center">
          <div className="flashcard-container cursor-pointer" onClick={() => setFlipped(!flipped)}>
            <div className={`flashcard-inner ${flipped ? "flipped" : ""}`}>
              <div className="flashcard-front bg-slate-900 border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold mb-4">{w.word}</div>
                <div className="flex gap-2 flex-wrap justify-center">
                  <span className={`badge ${bandInfo.cls} text-xs`}>Band {bandInfo.text}</span>
                  {w.corpus.is_awl && <span className="badge bg-blue-900/40 border-blue-700 text-blue-300 text-xs">AWL</span>}
                </div>
                <div className="text-slate-500 text-sm mt-6">点击翻转</div>
              </div>
              <div className="flashcard-back bg-slate-900 border border-emerald-800 rounded-3xl p-10 flex flex-col items-center justify-center">
                <div className="text-2xl font-cn font-medium mb-4">{w.meaning_cn}</div>
                <div className="text-sm text-slate-400 italic max-w-md text-center mb-4">{w.example?.text || ""}</div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {(w.synonyms || []).slice(0, 4).map((s) => <span key={s} className="text-sm bg-slate-800 px-2 py-0.5 rounded">{s}</span>)}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => fcNext(false)} className="bg-red-900/50 hover:bg-red-900 border border-red-800 text-red-300 px-8 py-3 rounded-xl transition font-medium">不认识</button>
          <button onClick={() => fcNext(true)} className="bg-emerald-900/50 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 px-8 py-3 rounded-xl transition font-medium">认识</button>
        </div>
      </div>
    );
  }

  // --- Spell ---
  if (mode === "spell" && w) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={endLearn} className="text-slate-400 hover:text-white text-sm transition">← 返回</button>
          <div className="text-sm">
            <span className="text-emerald-400">{correct}</span> 对 / <span className="text-red-400">{wrong}</span> 错 · <span className="text-slate-400">{idx + 1}</span>/{words.length}
          </div>
        </div>
        <div className="max-w-lg mx-auto text-center py-10">
          <div className="text-2xl font-cn mb-2">{w.meaning_cn || "(no hint)"}</div>
          <div className="text-slate-500 text-sm mb-6">{w.word[0]}{"_".repeat(w.word.length - 1)} ({w.word.length} 个字母)</div>
          <input
            ref={inputRef}
            type="text"
            autoComplete="off"
            spellCheck={false}
            value={spInput}
            onChange={(e) => setSpInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { spFeedback ? spNext() : spCheck(); } }}
            className={`w-full bg-slate-900 border border-slate-700 rounded-xl px-5 py-4 text-2xl text-center tracking-wider focus:outline-none focus:border-emerald-500 transition ${spFeedback ? (spFeedback.ok ? "sp-correct" : "sp-wrong") : ""}`}
            autoFocus
          />
          {spFeedback && (
            <div className={`mt-4 text-lg font-medium ${spFeedback.ok ? "text-emerald-400" : "text-red-400"}`}>
              {spFeedback.ok ? "✓ 正确！" : <>✗ 正确答案：<span className="text-emerald-400">{spFeedback.answer}</span></>}
            </div>
          )}
          {!spFeedback ? (
            <button onClick={spCheck} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition">检查</button>
          ) : (
            <button onClick={spNext} className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-lg transition">下一个</button>
          )}
        </div>
      </div>
    );
  }

  // --- Match ---
  if (mode === "match") {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <button onClick={endLearn} className="text-slate-400 hover:text-white text-sm transition">← 返回</button>
          <div className="text-sm text-slate-400">已配对 <span className="text-emerald-400">{matchDone}</span> / {words.length}</div>
        </div>
        <div className="grid grid-cols-2 gap-6 max-w-3xl mx-auto">
          <div className="flex flex-col gap-2">
            {words.map((w, i) => (
              <button
                key={`l-${i}`}
                className={`match-btn bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-left text-sm font-medium ${matchStates[`left-${i}`] || ""}`}
                onClick={() => matchClick("left", w.word, i)}
              >
                {w.word}
              </button>
            ))}
          </div>
          <div className="flex flex-col gap-2">
            {shuffledRight.map((w, i) => (
              <button
                key={`r-${i}`}
                className={`match-btn bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-left text-sm font-cn ${matchStates[`right-${i}`] || ""}`}
                onClick={() => matchClick("right", w.word, i)}
              >
                {w.meaning_cn || w.word}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

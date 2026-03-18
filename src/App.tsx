import { useState, useCallback } from "react";
import { Routes, Route, NavLink, useNavigate } from "react-router-dom";
import HomeView from "./views/HomeView";
import BrowseView from "./views/BrowseView";
import FavoritesView from "./views/FavoritesView";
import LearnView from "./views/LearnView";
import WordModal from "./components/WordModal";
import { getFavs } from "./lib/favorites";

export default function App() {
  const [modalWord, setModalWord] = useState<string | null>(null);
  const [favRefresh, setFavRefresh] = useState(0);
  const [favCount, setFavCount] = useState(getFavs().length);
  const navigate = useNavigate();

  const showWord = useCallback((w: string) => setModalWord(w), []);
  const closeModal = useCallback(() => setModalWord(null), []);
  const navigateWord = useCallback((w: string) => {
    setModalWord(null);
    setTimeout(() => setModalWord(w), 50);
  }, []);

  const handleFavChange = useCallback(() => {
    setFavCount(getFavs().length);
    setFavRefresh((n) => n + 1);
  }, []);

  const navCls = ({ isActive }: { isActive: boolean }) =>
    `nav-btn px-3 py-1.5 rounded-lg text-sm hover:bg-slate-800 transition ${isActive ? "active" : ""}`;

  return (
    <>
      {/* Top Nav */}
      <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <a onClick={() => navigate("/")} className="flex items-center gap-2 text-emerald-400 font-bold text-lg tracking-tight cursor-pointer">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            IELTS 雅思数研社
          </a>
          <div className="flex items-center gap-1">
            <NavLink to="/" className={navCls} end>首页</NavLink>
            <NavLink to="/browse" className={navCls}>浏览</NavLink>
            <NavLink to="/favorites" className={navCls}>
              <span className="relative">
                收藏
                {favCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-emerald-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {favCount}
                  </span>
                )}
              </span>
            </NavLink>
            <NavLink to="/learn" className={navCls}>学习</NavLink>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<HomeView onShowWord={showWord} />} />
          <Route path="/browse" element={<BrowseView onShowWord={showWord} />} />
          <Route path="/favorites" element={<FavoritesView onShowWord={showWord} refreshKey={favRefresh} />} />
          <Route path="/learn" element={<LearnView />} />
        </Routes>
      </main>

      {/* Word Detail Modal */}
      <WordModal word={modalWord} onClose={closeModal} onNavigate={navigateWord} onFavChange={handleFavChange} />
    </>
  );
}

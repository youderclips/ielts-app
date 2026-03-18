interface Props {
  total: number;
  page: number;
  size: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ total, page, size, onPageChange }: Props) {
  const pages = Math.ceil(total / size);
  if (pages <= 1) return null;

  const start = Math.max(1, page - 3);
  const end = Math.min(pages, page + 3);

  return (
    <div className="flex gap-1">
      {page > 1 && <button className="page-btn" onClick={() => onPageChange(page - 1)}>‹</button>}
      {start > 1 && (
        <>
          <button className="page-btn" onClick={() => onPageChange(1)}>1</button>
          <span className="text-slate-600 px-1">…</span>
        </>
      )}
      {Array.from({ length: end - start + 1 }, (_, i) => start + i).map((p) => (
        <button key={p} className={`page-btn ${p === page ? "active" : ""}`} onClick={() => onPageChange(p)}>{p}</button>
      ))}
      {end < pages && (
        <>
          <span className="text-slate-600 px-1">…</span>
          <button className="page-btn" onClick={() => onPageChange(pages)}>{pages}</button>
        </>
      )}
      {page < pages && <button className="page-btn" onClick={() => onPageChange(page + 1)}>›</button>}
    </div>
  );
}

import { useEffect, useRef } from 'react';

export interface UpdateRow {
  iter: number;
  wBefore: number;
  grad: number;
  eta: number;
  wAfter: number;
  lossAfter: number;
}

interface Props {
  rows: UpdateRow[];
  selectedIdx: number | null;
  onSelectRow: (idx: number) => void;
  onClear: () => void;
}

const fmt = (v: number) => v.toFixed(4);

export default function UpdateTable({
  rows,
  selectedIdx,
  onSelectRow,
  onClear,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [rows.length]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-primary">
          Update history
        </h3>
        <button
          onClick={onClear}
          disabled={rows.length === 0}
          className={`px-3 py-1 text-xs rounded border transition-colors ${
            rows.length === 0
              ? 'border-border text-text-secondary bg-bg-secondary opacity-50 cursor-not-allowed'
              : 'border-border text-text-primary bg-bg-secondary hover:bg-border'
          }`}
        >
          Clear History
        </button>
      </div>

      <div
        ref={containerRef}
        className="border border-border rounded-lg overflow-y-auto"
        style={{ maxHeight: 300 }}
      >
        <table className="w-full text-sm">
          <thead className="bg-bg-secondary text-text-primary sticky top-0">
            <tr>
              <th className="px-3 py-2 text-left font-semibold">Iter</th>
              <th className="px-3 py-2 text-right font-semibold">w (before)</th>
              <th className="px-3 py-2 text-right font-semibold">∂E/∂w</th>
              <th className="px-3 py-2 text-right font-semibold">η</th>
              <th className="px-3 py-2 text-right font-semibold">w (after)</th>
              <th className="px-3 py-2 text-right font-semibold">Loss</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-6 text-center text-text-secondary text-xs"
                >
                  No iterations yet — click <strong>Step</strong> or{' '}
                  <strong>Run</strong>.
                </td>
              </tr>
            )}
            {rows.map((r, i) => {
              const isSel = i === selectedIdx;
              const bg = isSel
                ? 'bg-accent-light'
                : i % 2 === 0
                  ? 'bg-bg-primary'
                  : 'bg-white';
              return (
                <tr
                  key={r.iter}
                  onClick={() => onSelectRow(i)}
                  className={`${bg} cursor-pointer hover:bg-accent-light/60`}
                >
                  <td className="px-3 py-1.5 text-text-primary">{r.iter}</td>
                  <td className="px-3 py-1.5 text-right text-text-primary">
                    {fmt(r.wBefore)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-text-primary">
                    {fmt(r.grad)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-text-primary">
                    {fmt(r.eta)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-text-primary">
                    {fmt(r.wAfter)}
                  </td>
                  <td className="px-3 py-1.5 text-right text-text-primary">
                    {fmt(r.lossAfter)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
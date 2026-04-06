import { useState, useRef, useEffect, useCallback } from 'react';

/* ── layout constants ─────────────────────────────────────────── */
const NODE_R = 48;
const SVG_W = 900;
const SVG_H = 560;

const LAYER_X = [150, 450, 750];
const LAYER_Y = [
  [160, 400],       // Input  (2)
  [160, 400],       // Hidden (2)
  [160, 400],       // Output (2)
];
const LAYER_LABELS = ['Input Layer', 'Hidden Layer', 'Output Layer'];
const NODE_LABELS = [
  ['x₁', 'x₂'],
  ['a₁¹', 'a₂¹'],
  ['a₁²', 'a₂²'],
];

const NODE_NOTATION: { base: string; sub: string; sup?: string }[][] = [
  [{ base: 'x', sub: '1' }, { base: 'x', sub: '2' }],
  [{ base: 'a', sub: '1', sup: '1' }, { base: 'a', sub: '2', sup: '1' }],
  [{ base: 'a', sub: '1', sup: '2' }, { base: 'a', sub: '2', sup: '2' }],
];

/* ── types ────────────────────────────────────────────────────── */
interface Props {
  inputValues: number[];
  weights: number[][][];
  biases: number[][];
  step: number;
  animatingLayer: number | null;
  hiddenPreAct: number[] | null;
  hiddenPostAct: number[] | null;
  outputPreAct: number[] | null;
  outputPostAct: number[] | null;
  editingDisabled: boolean;
  onWeightChange: (layer: number, from: number, to: number, v: number) => void;
  onBiasChange: (layer: number, neuron: number, v: number) => void;
}

type PopupState = {
  kind: 'weight';
  layer: number;
  from: number;
  to: number;
  x: number;
  y: number;
  value: number;
} | {
  kind: 'bias';
  layer: number;   // index into biases array (0=hidden, 1=output)
  neuron: number;
  x: number;
  y: number;
  value: number;
} | null;

const inputCls =
  'bg-white border border-border rounded px-2 py-1 text-sm w-24 text-center text-text-primary focus:outline-none focus:border-accent-primary';

/* ── component ────────────────────────────────────────────────── */
export default function NetworkDiagram({
  inputValues, weights, biases,
  step, animatingLayer,
  hiddenPreAct, hiddenPostAct, outputPreAct, outputPostAct,
  editingDisabled, onWeightChange, onBiasChange,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const [popup, setPopup] = useState<PopupState>(null);

  /* close popup on outside click */
  useEffect(() => {
    if (!popup) return;
    const handler = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        setPopup(null);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [popup]);

  /* helpers */
  const pos = (layer: number, idx: number) => ({
    x: LAYER_X[layer],
    y: LAYER_Y[layer][idx],
  });

  const openPopup = useCallback(
    (e: React.MouseEvent, state: Exclude<PopupState, null>) => {
      e.stopPropagation();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setPopup({
        ...state,
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    },
    [],
  );

  /* ── connection edge points ─────────────────────────────────── */
  const edge = (from: { x: number; y: number }, to: { x: number; y: number }) => {
    const dx = to.x - from.x;
    const dy = to.y - from.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    return {
      x1: from.x + (NODE_R * dx) / d,
      y1: from.y + (NODE_R * dy) / d,
      x2: to.x - (NODE_R * dx) / d,
      y2: to.y - (NODE_R * dy) / d,
    };
  };

  /* ── neuron display values ──────────────────────────────────── */
  const neuronVals = (layer: number, idx: number) => {
    if (layer === 0 && step >= 1) return { post: inputValues[idx].toFixed(2) };
    if (layer === 1 && step >= 2 && hiddenPreAct && hiddenPostAct)
      return { pre: hiddenPreAct[idx].toFixed(2), post: hiddenPostAct[idx].toFixed(2) };
    if (layer === 2 && step >= 3 && outputPreAct && outputPostAct)
      return { pre: outputPreAct[idx].toFixed(2), post: outputPostAct[idx].toFixed(2) };
    return {};
  };

  /* ── render ─────────────────────────────────────────────────── */
  return (
    <div ref={containerRef} className="relative w-full overflow-x-auto">
      <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full min-w-[750px] max-w-[900px] mx-auto">
        {/* ── layer labels ── */}
        {LAYER_LABELS.map((label, l) => (
          <text
            key={`ll-${l}`}
            x={LAYER_X[l]}
            y={80}
            textAnchor="middle"
            fontSize="16"
            fill="#5D6D7E"
            fontWeight={600}
          >
            {label}
          </text>
        ))}

        {/* ── connections ── */}
        {[0, 1].map((lyr) =>
          LAYER_Y[lyr].flatMap((_, i) =>
            LAYER_Y[lyr + 1].map((_, j) => {
              const { x1, y1, x2, y2 } = edge(pos(lyr, i), pos(lyr + 1, j));
              const isAnim = animatingLayer === lyr;
              /* weight label: perpendicular offset so it doesn't touch the line */
              const wt = i === j ? 0.5 : (i < j ? 0.35 : 0.65);
              const wmx = x1 + (x2 - x1) * wt;
              const wmy = y1 + (y2 - y1) * wt;
              const edx = x2 - x1;
              const edy = y2 - y1;
              const elen = Math.sqrt(edx * edx + edy * edy);
              const rpx = -edy / elen;
              const rpy = edx / elen;
              const flip = rpy > 0 ? -1 : 1;
              const wLabelX = wmx + rpx * flip * 14;
              const wLabelY = wmy + rpy * flip * 14;
              return (
                <g key={`c-${lyr}-${i}-${j}`}>
                  {/* visible line */}
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke={isAnim ? '#2E86C1' : '#AAB7B8'}
                    strokeWidth={isAnim ? 2.5 : 1.5}
                    strokeDasharray={isAnim ? '12 12' : undefined}
                  >
                    {isAnim && (
                      <animate
                        attributeName="stroke-dashoffset"
                        from="24" to="0"
                        dur="0.6s"
                        repeatCount="indefinite"
                      />
                    )}
                  </line>
                  {/* wide invisible hit area */}
                  <line
                    x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="transparent"
                    strokeWidth={14}
                    style={{ cursor: 'pointer' }}
                    onClick={(e) =>
                      openPopup(e, {
                        kind: 'weight',
                        layer: lyr,
                        from: i,
                        to: j,
                        x: 0, y: 0,
                        value: weights[lyr][i][j],
                      })
                    }
                  />
                  {/* weight label offset from line */}
                  <text
                    x={wLabelX}
                    y={wLabelY}
                    textAnchor="middle"
                    fontSize="12"
                    fill="#7F8C8D"
                    style={{ pointerEvents: 'none' }}
                  >
                    {weights[lyr][i][j].toFixed(2)}
                  </text>
                </g>
              );
            }),
          ),
        )}

        {/* ── neurons ── */}
        {[0, 1, 2].map((lyr) =>
          LAYER_Y[lyr].map((ny, idx) => {
            const nx = LAYER_X[lyr];
            const vals = neuronVals(lyr, idx);
            const hasValue = vals.post !== undefined;
            const notation = NODE_NOTATION[lyr][idx];

            return (
              <g key={`n-${lyr}-${idx}`}>
                {/* circle */}
                <circle
                  cx={nx} cy={ny} r={NODE_R}
                  fill={hasValue ? '#D4E6F1' : '#D5DBDB'}
                  stroke={hasValue ? '#2E86C1' : '#AAB7B8'}
                  strokeWidth={hasValue ? 2 : 1.5}
                  style={{
                    cursor: lyr > 0 ? 'pointer' : 'default',
                    transition: 'fill 0.4s, stroke 0.4s',
                  }}
                  onClick={(e) => {
                    if (lyr === 0) return; // input layer has no bias
                    openPopup(e, {
                      kind: 'bias',
                      layer: lyr - 1,
                      neuron: idx,
                      x: 0, y: 0,
                      value: biases[lyr - 1][idx],
                    });
                  }}
                />

                {/* pre-activation (above the circle) */}
                {vals.pre && (
                  <text
                    x={nx} y={ny - NODE_R - 8}
                    textAnchor="middle"
                    fontSize="13"
                    fill="#85929E"
                  >
                    z = {vals.pre}
                  </text>
                )}

                {/* notation inside circle */}
                <foreignObject
                  x={nx - 32} y={hasValue ? ny - 22 : ny - 11}
                  width={64} height={22}
                  style={{ pointerEvents: 'none' }}
                >
                  <div style={{
                    textAlign: 'center',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#5D6D7E',
                    lineHeight: '22px',
                  }}>
                    {notation.base}
                    <sub style={{ fontSize: '9px' }}>{notation.sub}</sub>
                    {notation.sup && <sup style={{ fontSize: '9px' }}>{notation.sup}</sup>}
                  </div>
                </foreignObject>

                {/* value inside circle */}
                {hasValue && (
                  <text
                    x={nx} y={ny + 16}
                    textAnchor="middle"
                    fontSize="14"
                    fontWeight={600}
                    fill="#5D6D7E"
                  >
                    = {vals.post}
                  </text>
                )}
              </g>
            );
          }),
        )}
      </svg>

      {/* ── popup overlay ── */}
      {popup && (
        <div
          ref={popupRef}
          className="absolute bg-bg-secondary border border-border rounded-lg shadow-md p-3 z-10"
          style={{ left: popup.x + 12, top: popup.y - 24 }}
        >
          <div className="text-xs text-text-secondary mb-1.5 whitespace-nowrap">
            {popup.kind === 'weight'
              ? `Weight: ${NODE_LABELS[popup.layer][popup.from]} → ${NODE_LABELS[popup.layer + 1][popup.to]}`
              : `Bias: ${NODE_LABELS[popup.layer + 1][popup.neuron]}`}
          </div>
          <input
            type="number"
            step="0.01"
            value={popup.value}
            disabled={editingDisabled}
            onChange={(e) => {
              const v = e.target.valueAsNumber;
              if (isNaN(v)) return;
              const r = Math.round(v * 100) / 100;
              if (popup.kind === 'weight') {
                onWeightChange(popup.layer, popup.from, popup.to, r);
                setPopup({ ...popup, value: r });
              } else {
                onBiasChange(popup.layer, popup.neuron, r);
                setPopup({ ...popup, value: r });
              }
            }}
            className={`${inputCls} ${editingDisabled ? '!bg-accent-light cursor-not-allowed' : ''}`}
            autoFocus
          />
        </div>
      )}
    </div>
  );
}

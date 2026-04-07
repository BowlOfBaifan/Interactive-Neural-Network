import { useEffect, useMemo, useRef, useState } from 'react';
import { InlineMath } from 'react-katex';

export const W_MIN = -3;
export const W_MAX = 5;

export const f = (w: number) =>
  ((w - 3) ** 2 * (w + 1) ** 2) / 10 + 0.15 * (3 - w);

export const fPrime = (w: number) =>
  (2 * (w - 3) * (w + 1) ** 2 + 2 * (w + 1) * (w - 3) ** 2) / 10 - 0.15;

interface Props {
  w: number;
  onWChange: (w: number) => void;
  draggingDisabled: boolean;
  tangentVisible: boolean;
  markerW: number | null;
}

const VB_W = 560;
const VB_H = 340;
const M = { l: 56, r: 20, t: 20, b: 44 };
const PLOT_W = VB_W - M.l - M.r;
const PLOT_H = VB_H - M.t - M.b;

export default function LossCurvePlot({
  w,
  onWChange,
  draggingDisabled,
  tangentVisible,
  markerW,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [dragging, setDragging] = useState(false);

  // sample curve and compute loss range
  const { pathD, lossMin, lossMax } = useMemo(() => {
    const N = 240;
    const losses: number[] = [];
    const pts: Array<[number, number]> = [];
    for (let i = 0; i <= N; i++) {
      const wi = W_MIN + ((W_MAX - W_MIN) * i) / N;
      const li = f(wi);
      losses.push(li);
      pts.push([wi, li]);
    }
    const lMin = 0;
    const lMax = Math.max(...losses) * 1.05;
    const wToX = (wi: number) =>
      M.l + ((wi - W_MIN) / (W_MAX - W_MIN)) * PLOT_W;
    const lToY = (li: number) =>
      M.t + PLOT_H - ((li - lMin) / (lMax - lMin)) * PLOT_H;
    const d = pts
      .map(([wi, li], i) => `${i === 0 ? 'M' : 'L'}${wToX(wi).toFixed(2)},${lToY(li).toFixed(2)}`)
      .join(' ');
    return { pathD: d, lossMin: lMin, lossMax: lMax };
  }, []);

  const wToX = (wi: number) =>
    M.l + ((wi - W_MIN) / (W_MAX - W_MIN)) * PLOT_W;
  const lToY = (li: number) =>
    M.t + PLOT_H - ((li - lossMin) / (lossMax - lossMin)) * PLOT_H;

  // pointer drag
  const updateFromPointer = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const xPx = ((clientX - rect.left) / rect.width) * VB_W;
    const wi = W_MIN + ((xPx - M.l) / PLOT_W) * (W_MAX - W_MIN);
    onWChange(Math.max(W_MIN, Math.min(W_MAX, wi)));
  };

  useEffect(() => {
    if (!dragging) return;
    const move = (e: PointerEvent) => updateFromPointer(e.clientX);
    const up = () => setDragging(false);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [dragging]);

  // grid ticks
  const wTicks: number[] = [];
  for (let v = W_MIN; v <= W_MAX; v++) wTicks.push(v);
  const lTicks: number[] = [];
  const lStep = niceStep(lossMax / 5);
  for (let v = 0; v <= lossMax; v += lStep) lTicks.push(v);

  // tangent geometry
  const slope = fPrime(w);
  const dW = 0.6;
  const tx1 = wToX(w - dW);
  const ty1 = lToY(f(w) - slope * dW);
  const tx2 = wToX(w + dW);
  const ty2 = lToY(f(w) + slope * dW);

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-3">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VB_W} ${VB_H}`}
        className="w-full select-none"
        style={{ touchAction: 'none' }}
      >
        {/* grid */}
        {wTicks.map((v) => (
          <line
            key={`gx-${v}`}
            x1={wToX(v)}
            x2={wToX(v)}
            y1={M.t}
            y2={M.t + PLOT_H}
            stroke="#D5DBDB"
            strokeWidth={1}
          />
        ))}
        {lTicks.map((v) => (
          <line
            key={`gy-${v}`}
            x1={M.l}
            x2={M.l + PLOT_W}
            y1={lToY(v)}
            y2={lToY(v)}
            stroke="#D5DBDB"
            strokeWidth={1}
          />
        ))}

        {/* axes */}
        <line
          x1={M.l}
          y1={M.t}
          x2={M.l}
          y2={M.t + PLOT_H}
          stroke="#AAB7B8"
          strokeWidth={1.5}
        />
        <line
          x1={M.l}
          y1={M.t + PLOT_H}
          x2={M.l + PLOT_W}
          y2={M.t + PLOT_H}
          stroke="#AAB7B8"
          strokeWidth={1.5}
        />

        {/* tick labels */}
        {wTicks.map((v) => (
          <text
            key={`tx-${v}`}
            x={wToX(v)}
            y={M.t + PLOT_H + 16}
            textAnchor="middle"
            fontSize={11}
            fill="#85929E"
          >
            {v}
          </text>
        ))}
        {lTicks.map((v) => (
          <text
            key={`ty-${v}`}
            x={M.l - 8}
            y={lToY(v) + 4}
            textAnchor="end"
            fontSize={11}
            fill="#85929E"
          >
            {v.toFixed(1)}
          </text>
        ))}

        {/* axis labels (KaTeX via foreignObject) */}
        <foreignObject
          x={M.l + PLOT_W / 2 - 10}
          y={VB_H - 22}
          width={40}
          height={22}
        >
          <div style={{ fontSize: 14, color: '#5D6D7E', textAlign: 'center' }}>
            <InlineMath math="w" />
          </div>
        </foreignObject>
        <foreignObject x={6} y={M.t + PLOT_H / 2 - 12} width={40} height={24}>
          <div style={{ fontSize: 14, color: '#5D6D7E', textAlign: 'center' }}>
            <InlineMath math="E" />
          </div>
        </foreignObject>

        {/* curve */}
        <path d={pathD} fill="none" stroke="#5D6D7E" strokeWidth={2} />

        {/* tangent line */}
        <line
          x1={tx1}
          y1={ty1}
          x2={tx2}
          y2={ty2}
          stroke="#E67E22"
          strokeWidth={2.5}
          strokeLinecap="round"
          style={{
            opacity: tangentVisible ? 1 : 0,
            transition: tangentVisible
              ? 'opacity 100ms ease-in'
              : 'opacity 300ms ease-out',
          }}
        />

        {/* secondary marker (table-row click) */}
        {markerW !== null && (
          <circle
            cx={wToX(markerW)}
            cy={lToY(f(markerW))}
            r={6}
            fill="#27AE60"
            stroke="#FFFFFF"
            strokeWidth={1.5}
          />
        )}

        {/* current-position dot */}
        <circle
          cx={wToX(w)}
          cy={lToY(f(w))}
          r={8}
          fill="#2E86C1"
          stroke="#FFFFFF"
          strokeWidth={1.5}
          style={{
            cursor: draggingDisabled ? 'not-allowed' : 'grab',
            transition: dragging ? 'none' : 'cx 300ms ease-out, cy 300ms ease-out',
          }}
          onPointerDown={(e) => {
            if (draggingDisabled) return;
            e.preventDefault();
            setDragging(true);
            updateFromPointer(e.clientX);
          }}
        />
      </svg>
    </div>
  );
}

function niceStep(raw: number): number {
  if (raw <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(raw)));
  const n = raw / pow;
  const nice = n < 1.5 ? 1 : n < 3 ? 2 : n < 7 ? 5 : 10;
  return nice * pow;
}
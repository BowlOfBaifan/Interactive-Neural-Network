/* ── layout constants ─────────────────────────────────────────── */
const NODE_R = 34;
const SVG_W = 1080;
const SVG_H = 195;

const INPUT_X = 80;
const NODE_X = [330, 580, 830];
const Y = 125;

/* font sizes */
const FS_LABEL  = 13;  // layer labels, "Input", "Target"
const FS_WEIGHT = 15;  // w₁ w₂ w₃ on arrows
const FS_SIGMA  = 18;  // σ inside circles
const FS_NODE   = 16;  // x, t inside input/target
const FS_SO_SYM = 17;  // s / o symbol          ← disproportionately large
const FS_SO_VAL = 15;  // = 0.xxx value          ← disproportionately large
const FS_SO_SUB = 11;  // subscript on s / o

const LAYER_COLORS: Record<1 | 2 | 3, string> = {
  1: '#E67E22',
  2: '#27AE60',
  3: '#2E86C1',
};

interface ForwardVals {
  x: number;
  s: [number, number, number];
  o: [number, number, number];
}

interface Props {
  x: number;
  weights: [number, number, number];
  target: number;
  forwardDone: boolean;
  forwardVals: ForwardVals | null;
  highlightedLayers: Set<1 | 2 | 3>;
}

export default function BackpropDiagram({
  x, target,
  forwardVals, highlightedLayers,
}: Props) {
  const segment = (fromX: number, toX: number) => ({
    x1: fromX + NODE_R,
    y1: Y,
    x2: toX - NODE_R,
    y2: Y,
  });

  const layerColor = (l: 1 | 2 | 3) =>
    highlightedLayers.has(l) ? LAYER_COLORS[l] : '#AAB7B8';

  const weightColor = (l: 1 | 2 | 3) =>
    highlightedLayers.has(l) ? LAYER_COLORS[l] : '#7F8C8D';

  const connections: { layer: 1 | 2 | 3; from: number; to: number; label: string }[] = [
    { layer: 1, from: INPUT_X, to: NODE_X[0], label: 'w₁' },
    { layer: 2, from: NODE_X[0], to: NODE_X[1], label: 'w₂' },
    { layer: 3, from: NODE_X[1], to: NODE_X[2], label: 'w₃' },
  ];

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="w-full min-w-[750px] max-w-[1080px] mx-auto"
      >
        <style>{`
          @keyframes bp-label-in {
            from { opacity: 0; transform: translateY(5px); }
            to   { opacity: 1; transform: translateY(0); }
          }
        `}</style>
        {/* ── connections ── */}
        {connections.map((c) => {
          const seg = segment(c.from, c.to);
          const stroke = weightColor(c.layer);
          const isHi = highlightedLayers.has(c.layer);
          return (
            <g key={`c-${c.layer}`}>
              <line
                x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2}
                stroke={stroke}
                strokeWidth={isHi ? 3 : 1.8}
                style={{ transition: 'stroke 0.3s, stroke-width 0.3s' }}
              />
              <text
                x={(seg.x1 + seg.x2) / 2}
                y={Y - 13}
                textAnchor="middle"
                fontSize={FS_WEIGHT}
                fontWeight={600}
                fill={stroke}
                style={{ transition: 'fill 0.3s' }}
              >
                {c.label}
              </text>
            </g>
          );
        })}

        {/* ── input node ── */}
        <g>
          <circle
            cx={INPUT_X} cy={Y} r={NODE_R}
            fill="#D5DBDB" stroke="#AAB7B8" strokeWidth={1.5}
          />
          <text
            x={INPUT_X} y={Y - 4}
            textAnchor="middle" fontSize={FS_NODE} fontWeight={600} fill="#5D6D7E"
          >
            x
          </text>
          <text
            x={INPUT_X} y={Y + 14}
            textAnchor="middle" fontSize={FS_NODE - 4} fill="#5D6D7E"
          >
            = {x.toFixed(2)}
          </text>
          <text
            x={INPUT_X} y={Y - NODE_R - 10}
            textAnchor="middle" fontSize={FS_LABEL} fontWeight={600} fill="#85929E"
          >
            Input
          </text>
        </g>

        {/* ── neurons ── */}
        {([1, 2, 3] as const).map((layer, idx) => {
          const cx = NODE_X[idx];
          const stroke = layerColor(layer);
          const isHi = highlightedLayers.has(layer);
          const sVal = forwardVals?.s[idx];
          const oVal = forwardVals?.o[idx];
          const labelX  = cx - NODE_R - 10;  // right-align anchor for s
          const labelXO = cx + NODE_R + 10;  // left-align anchor for o

          return (
            <g key={`n-${layer}`}>
              {/* layer label */}
              <text
                x={cx} y={Y - NODE_R - 10}
                textAnchor="middle" fontSize={FS_LABEL} fontWeight={600}
                fill={isHi ? stroke : '#85929E'}
                style={{ transition: 'fill 0.3s' }}
              >
                {layer === 3 ? 'Output' : `Hidden ${layer}`}
              </text>

              {/* circle */}
              <circle
                cx={cx} cy={Y} r={NODE_R}
                fill={isHi ? '#FFFFFF' : '#D5DBDB'}
                stroke={stroke}
                strokeWidth={isHi ? 2.5 : 1.5}
                style={{ transition: 'fill 0.3s, stroke 0.3s' }}
              />

              {/* σ inside circle */}
              <text
                x={cx} y={Y + 6}
                textAnchor="middle" fontSize={FS_SIGMA}
                fill={isHi ? stroke : '#85929E'}
                style={{ pointerEvents: 'none', transition: 'fill 0.3s' }}
              >
                σ
              </text>

              {/* s + o labels — fade in together, staggered by layer index */}
              {(sVal !== undefined || oVal !== undefined) && (
                <g
                  key={`so-${layer}-${forwardVals ? 'shown' : 'hidden'}`}
                  style={{
                    animation: 'bp-label-in 0.35s ease forwards',
                    animationDelay: `${idx * 0.25}s`,
                    opacity: 0,
                  }}
                >
                  {sVal !== undefined && (
                    <>
                      <text
                        x={labelX} y={Y - 8}
                        textAnchor="end" fontSize={FS_SO_SYM} fontWeight={700}
                        fill={LAYER_COLORS[layer]}
                      >
                        s<tspan fontSize={FS_SO_SUB} dy="4">{layer}</tspan>
                      </text>
                      <text
                        x={labelX} y={Y + 14}
                        textAnchor="end" fontSize={FS_SO_VAL}
                        fill={LAYER_COLORS[layer]}
                      >
                        = {sVal.toFixed(3)}
                      </text>
                    </>
                  )}
                  {oVal !== undefined && (
                    <>
                      <text
                        x={labelXO} y={Y - 8}
                        textAnchor="start" fontSize={FS_SO_SYM} fontWeight={700}
                        fill={LAYER_COLORS[layer]}
                      >
                        o<tspan fontSize={FS_SO_SUB} dy="4">{layer}</tspan>
                      </text>
                      <text
                        x={labelXO} y={Y + 14}
                        textAnchor="start" fontSize={FS_SO_VAL}
                        fill={LAYER_COLORS[layer]}
                      >
                        = {oVal.toFixed(3)}
                      </text>
                    </>
                  )}
                </g>
              )}
            </g>
          );
        })}

        {/* ── target node ── */}
        <g>
          <text
            x={SVG_W - 60} y={Y - NODE_R - 10}
            textAnchor="middle" fontSize={FS_LABEL} fontWeight={600} fill="#85929E"
          >
            Target
          </text>
          <rect
            x={SVG_W - 104} y={Y - 26}
            width={88} height={52}
            rx={6} fill="#D5DBDB" stroke="#AAB7B8" strokeWidth={1.5}
          />
          <text
            x={SVG_W - 60} y={Y - 4}
            textAnchor="middle" fontSize={FS_NODE} fontWeight={600} fill="#5D6D7E"
          >
            t
          </text>
          <text
            x={SVG_W - 60} y={Y + 16}
            textAnchor="middle" fontSize={FS_NODE - 4} fill="#5D6D7E"
          >
            = {target.toFixed(2)}
          </text>
        </g>
      </svg>
    </div>
  );
}
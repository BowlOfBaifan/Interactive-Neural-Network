import { useEffect, useRef } from 'react';
import { BlockMath, InlineMath } from 'react-katex';

interface Props {
  step: number;
  inputValues: number[];
  weights: number[][][];
  biases: number[][];
  activationFn: 'sigmoid' | 'relu' | 'tanh';
  hiddenPreAct: number[] | null;
  hiddenPostAct: number[] | null;
  outputPreAct: number[] | null;
  outputPostAct: number[] | null;
}

/** Wrap negative numbers in parentheses for KaTeX */
function fmt(v: number): string {
  const s = v.toFixed(2);
  return v < 0 ? `(${s})` : s;
}

function fnSym(fn: string): string {
  switch (fn) {
    case 'sigmoid': return '\\sigma';
    case 'relu':    return '\\text{ReLU}';
    case 'tanh':    return '\\tanh';
    default:        return fn;
  }
}

/**
 * Build an aligned KaTeX block for one neuron.
 *
 *   z_j = <terms> + bias
 *       = <preAct>
 *   h_j = f(preAct) = postAct
 */
function neuronLatex(
  zLabel: string,
  aLabel: string,
  srcVals: number[],
  wVals: number[],
  bias: number,
  preAct: number,
  postAct: number,
  fSym: string,
): string {
  const n = srcVals.length;
  const terms = srcVals.map((v, i) => `${fmt(v)} \\times ${fmt(wVals[i])}`);

  // Break long expressions across two lines (>3 terms)
  let zExpr: string;
  if (n <= 3) {
    zExpr = `${zLabel} &= ${terms.join(' + ')} + ${fmt(bias)}`;
  } else {
    const half = Math.ceil(n / 2);
    zExpr =
      `${zLabel} &= ${terms.slice(0, half).join(' + ')} \\\\\n` +
      `&\\quad + ${terms.slice(half).join(' + ')} + ${fmt(bias)}`;
  }

  return [
    '\\begin{aligned}',
    `${zExpr} \\\\`,
    `&= ${preAct.toFixed(2)} \\\\[4pt]`,
    `${aLabel} &= ${fSym}(${preAct.toFixed(2)}) = ${postAct.toFixed(2)}`,
    '\\end{aligned}',
  ].join('\n');
}

export default function ForwardPassBreakdown({
  step, inputValues, weights, biases, activationFn,
  hiddenPreAct, hiddenPostAct, outputPreAct, outputPostAct,
}: Props) {
  const hiddenRef = useRef<HTMLDivElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (step === 2 && hiddenRef.current) {
      hiddenRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else if (step === 3 && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [step]);

  if (step < 2) return null;

  const f = fnSym(activationFn);

  return (
    <div className="space-y-6">
      {/* ── Hidden layer ── */}
      {step >= 2 && hiddenPreAct && hiddenPostAct && (
        <div ref={hiddenRef} className="bg-bg-secondary border border-border rounded-lg p-5">
          <h3 className="text-[15px] font-semibold text-text-primary mb-1">
            Hidden Layer Computation
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            For each hidden neuron <InlineMath math="a_j^{1}" />, compute{' '}
            <InlineMath math="z_j^{1} = \sum_{i=1}^{2} w_{ij}^{1} \cdot x_i + b_j^{1}" />,
            {' '}then{' '}
            <InlineMath math="a_j^{1} = f(z_j^{1})" />.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((j) => (
              <div key={j} className="bg-bg-primary rounded-md p-3 overflow-x-auto">
                <div className="text-sm font-semibold text-text-primary mb-2">
                  Neuron <InlineMath math={`a_{${j + 1}}^{1}`} />
                </div>
                <BlockMath
                  math={neuronLatex(
                    `z_{${j + 1}}^{1}`,
                    `a_{${j + 1}}^{1}`,
                    inputValues,
                    inputValues.map((_, i) => weights[0][i][j]),
                    biases[0][j],
                    hiddenPreAct[j],
                    hiddenPostAct[j],
                    f,
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Output layer ── */}
      {step >= 3 && hiddenPostAct && outputPreAct && outputPostAct && (
        <div ref={outputRef} className="bg-bg-secondary border border-border rounded-lg p-5">
          <h3 className="text-[15px] font-semibold text-text-primary mb-1">
            Output Layer Computation
          </h3>
          <p className="text-sm text-text-secondary mb-4">
            For each output neuron <InlineMath math="a_k^{2}" />, compute{' '}
            <InlineMath math="z_k^{2} = \sum_{j=1}^{2} w_{jk}^{2} \cdot a_j^{1} + b_k^{2}" />,
            {' '}then{' '}
            <InlineMath math="a_k^{2} = f(z_k^{2})" />.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {[0, 1].map((k) => (
              <div key={k} className="bg-bg-primary rounded-md p-3 overflow-x-auto">
                <div className="text-sm font-semibold text-text-primary mb-2">
                  Neuron <InlineMath math={`a_{${k + 1}}^{2}`} />
                </div>
                <BlockMath
                  math={neuronLatex(
                    `z_{${k + 1}}^{2}`,
                    `a_{${k + 1}}^{2}`,
                    hiddenPostAct,
                    hiddenPostAct.map((_, j) => weights[1][j][k]),
                    biases[1][k],
                    outputPreAct[k],
                    outputPostAct[k],
                    f,
                  )}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { BlockMath } from 'react-katex';

interface Props {
  inputs: number[];
  weights: number[];
  bias: number;
  products: number[];
  weightedSum: number;
  preActivation: number;
  output: number;
  activationFn: 'step' | 'sigmoid' | 'relu';
  representation: 'explicit' | 'bias-as-weight';
}

/** Wrap negative numbers in parentheses for KaTeX multiplication/addition */
function fmt(v: number): string {
  const s = v.toFixed(2);
  return v < 0 ? `(${s})` : s;
}

function activationSymbol(fn: string): string {
  switch (fn) {
    case 'step':
      return '\\text{step}';
    case 'sigmoid':
      return '\\sigma';
    case 'relu':
      return '\\text{ReLU}';
    default:
      return fn;
  }
}

export default function ComputationBreakdown({
  inputs,
  weights,
  bias,
  products,
  weightedSum,
  preActivation,
  output,
  activationFn,
  representation,
}: Props) {
  const biasAsWeight = representation === 'bias-as-weight';
  const lines: string[] = [];

  // --- Individual products ---
  if (biasAsWeight) {
    const biasProduct = (1 * bias).toFixed(2);
    lines.push(
      `x_0 \\times w_0 &= 1.00 \\times ${fmt(bias)} = ${biasProduct}`
    );
  }
  inputs.forEach((x, i) => {
    const idx = biasAsWeight ? i + 1 : i + 1;
    lines.push(
      `x_{${idx}} \\times w_{${idx}} &= ${fmt(x)} \\times ${fmt(weights[i])} = ${products[i].toFixed(2)}`
    );
  });

  // --- Weighted sum ---
  const allProducts = biasAsWeight
    ? [parseFloat((1 * bias).toFixed(2)), ...products]
    : [...products];

  const sumTerms = allProducts
    .map((p, i) => {
      if (i === 0) return p.toFixed(2);
      return p < 0 ? `+ (${p.toFixed(2)})` : `+ ${p.toFixed(2)}`;
    })
    .join(' ');

  if (biasAsWeight) {
    lines.push(
      `\\\\[6pt] \\textbf{Weighted sum} &= ${sumTerms} = ${preActivation.toFixed(2)}`
    );
  } else {
    lines.push(
      `\\\\[6pt] \\textbf{Weighted sum} &= ${sumTerms} = ${weightedSum.toFixed(2)}`
    );
    // Pre-activation: weighted sum + bias
    lines.push(
      `\\textbf{Pre-activation } z &= ${weightedSum.toFixed(2)} + ${fmt(bias)} = ${preActivation.toFixed(2)}`
    );
  }

  // --- Output ---
  const fnSym = activationSymbol(activationFn);
  lines.push(
    `\\textbf{Output } y &= ${fnSym}(${preActivation.toFixed(2)}) = ${output.toFixed(2)}`
  );

  const latex = `\\begin{aligned}\n${lines.join(' \\\\\n')}\n\\end{aligned}`;

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-5">
      <h3 className="text-[15px] font-semibold text-text-primary mb-3">
        Computation Breakdown
      </h3>
      <BlockMath math={latex} />
    </div>
  );
}

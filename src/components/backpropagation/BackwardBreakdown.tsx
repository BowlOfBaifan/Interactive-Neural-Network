import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';

/* Each clickable term in a chain rule expression */
export interface Term {
  id: string;
  /** raw KaTeX (without color) */
  latex: string;
  /** semantic layer for color coding */
  layer: 1 | 2 | 3;
  /** symbolic identity formula, e.g. "o_3 (1 - o_3)" */
  formulaLatex: string;
  /** numerical value of this individual factor */
  value: number;
}

export interface ChainStep {
  /** which weight gradient this is for, 1|2|3 */
  layer: 1 | 2 | 3;
  /** LHS, e.g. "\\frac{\\partial E}{\\partial w_3}" */
  lhsLatex: string;
  terms: Term[];
  /** numeric value of the full product */
  productValue: number;
}

const LAYER_HEX: Record<1 | 2 | 3, string> = {
  1: '#E67E22',
  2: '#27AE60',
  3: '#2E86C1',
};

interface Props {
  steps: ChainStep[];
}

interface Selection {
  stepLayer: 1 | 2 | 3;
  termId: string | 'product';
}

export default function BackwardBreakdown({ steps }: Props) {
  const [selection, setSelection] = useState<Selection | null>(null);
  const [fading, setFading] = useState(false);

  const selectTerm = (stepLayer: 1 | 2 | 3, termId: string | 'product') => {
    if (
      selection &&
      selection.stepLayer === stepLayer &&
      selection.termId === termId
    ) {
      return;
    }
    setFading(true);
    window.setTimeout(() => {
      setSelection({ stepLayer, termId });
      setFading(false);
    }, 100);
  };

  /* find current detail content */
  let detail: { titleLatex: string; formulaLatex: string; value: number } | null = null;
  if (selection) {
    const step = steps.find((s) => s.layer === selection.stepLayer);
    if (step) {
      if (selection.termId === 'product') {
        detail = {
          titleLatex: `${step.lhsLatex} = ${step.terms.map((t) => t.latex).join(' \\cdot ')}`,
          formulaLatex: step.terms.map((t) => `(${t.value.toFixed(4)})`).join(' \\cdot '),
          value: step.productValue,
        };
      } else {
        const term = step.terms.find((t) => t.id === selection.termId);
        if (term) {
          detail = {
            titleLatex: `${term.latex} = ${term.formulaLatex}`,
            formulaLatex: term.formulaLatex,
            value: term.value,
          };
        }
      }
    }
  }

  if (steps.length === 0) {
    return (
      <div className="bg-bg-secondary border border-border rounded-lg p-5 text-sm text-text-secondary">
        Click <strong>Step Backward</strong> to begin computing gradients from
        the output layer back toward the input.
      </div>
    );
  }

  return (
    <div className="bg-bg-secondary border border-border rounded-lg p-5 space-y-4">
      <div className="text-sm text-text-secondary">
        Click on any individual term to inspect its formula and value, or click
        the full product to see the final gradient value.
      </div>

      {steps.map((step) => {
        return (
          <div key={step.layer} className="space-y-1">
            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[20px]">
              <InlineMath math={`${step.lhsLatex} =`} />
              {step.terms.map((term, i) => {
                const isSelected =
                  selection?.stepLayer === step.layer &&
                  selection.termId === term.id;
                return (
                  <span key={term.id} className="flex items-center gap-1.5">
                    <span
                      onClick={() => selectTerm(step.layer, term.id)}
                      className="cursor-pointer rounded px-1 py-0.5 transition-colors"
                      style={{
                        color: LAYER_HEX[term.layer],
                        backgroundColor: isSelected
                          ? 'rgba(46,134,193,0.12)'
                          : 'transparent',
                      }}
                    >
                      <InlineMath math={term.latex} />
                    </span>
                    {i < step.terms.length - 1 && (
                      <InlineMath math="\cdot" />
                    )}
                  </span>
                );
              })}
              <span
                className="ml-2 text-sm font-semibold"
                style={{ color: LAYER_HEX[step.layer] }}
              >
                = {step.productValue.toFixed(4)}
              </span>
            </div>
          </div>
        );
      })}

      {/* detail panel */}
      {detail && (
        <div
          className="mt-4 border-t border-border pt-3 transition-opacity duration-200"
          style={{ opacity: fading ? 0 : 1 }}
        >
          <div className="text-sm text-text-secondary mb-1">Detail</div>
          <div className="mb-2">
            <BlockMath math={detail.titleLatex} />
          </div>
          <div className="text-base text-text-primary">
            Numerical value:&nbsp;
            <span className="font-semibold">
              <InlineMath math={detail.value.toFixed(4)} />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
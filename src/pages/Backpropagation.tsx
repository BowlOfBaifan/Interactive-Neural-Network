import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { InlineMath } from 'react-katex';
import BackpropDiagram from '../components/backpropagation/BackpropDiagram';
import BackwardBreakdown from '../components/backpropagation/BackwardBreakdown';
import type { ChainStep } from '../components/backpropagation/BackwardBreakdown';

/* ── helpers ──────────────────────────────────────────────────── */
const round2 = (v: number) => Math.round(v * 100) / 100;
const rand = (lo: number, hi: number) => round2(Math.random() * (hi - lo) + lo);
const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

const inputCls =
  'bg-white border border-border rounded px-2 py-1 text-sm w-20 text-center text-text-primary focus:outline-none focus:border-accent-primary';

/* ── pre-set defaults ─────────────────────────────────────────── */
const DEFAULT_X = 0.5;
const DEFAULT_T = 0.8;
const DEFAULT_W: [number, number, number] = [0.3, 0.5, 0.7];

/* ── forward computation ──────────────────────────────────────── */
interface ForwardVals {
  x: number;
  s: [number, number, number];
  o: [number, number, number];
}

function computeForward(
  x: number,
  w: [number, number, number],
): ForwardVals {
  const s1 = w[0] * x;
  const o1 = sigmoid(s1);
  const s2 = w[1] * o1;
  const o2 = sigmoid(s2);
  const s3 = w[2] * o2;
  const o3 = sigmoid(s3);
  return { x, s: [s1, s2, s3], o: [o1, o2, o3] };
}

/* ── backward gradient construction ───────────────────────────── */
function buildChainSteps(
  fv: ForwardVals,
  w: [number, number, number],
  t: number,
  numSteps: 0 | 1 | 2 | 3,
): ChainStep[] {
  if (numSteps === 0) return [];

  const [o1, o2, o3] = fv.o;
  const dE_do3 = 2 * (o3 - t);
  const do3_ds3 = o3 * (1 - o3);
  const ds3_dw3 = o2;
  const ds3_do2 = w[2];
  const do2_ds2 = o2 * (1 - o2);
  const ds2_dw2 = o1;
  const ds2_do1 = w[1];
  const do1_ds1 = o1 * (1 - o1);
  const ds1_dw1 = fv.x;

  const steps: ChainStep[] = [];

  /* Step 1: ∂E/∂w3 */
  if (numSteps >= 1) {
    const product = dE_do3 * do3_ds3 * ds3_dw3;
    steps.push({
      layer: 3,
      lhsLatex: '\\frac{\\partial E}{\\partial w_3}',
      productValue: product,
      terms: [
        {
          id: 'dE_do3',
          latex: '\\frac{\\partial E}{\\partial o_3}',
          layer: 3,
          formulaLatex: '2(o_3 - t)',
          value: dE_do3,
        },
        {
          id: 'do3_ds3',
          latex: '\\frac{\\partial o_3}{\\partial s_3}',
          layer: 3,
          formulaLatex: 'o_3 (1 - o_3)',
          value: do3_ds3,
        },
        {
          id: 'ds3_dw3',
          latex: '\\frac{\\partial s_3}{\\partial w_3}',
          layer: 3,
          formulaLatex: 'o_2',
          value: ds3_dw3,
        },
      ],
    });
  }

  /* Step 2: ∂E/∂w2 — expand ∂E/∂o2 using layer 3 components */
  if (numSteps >= 2) {
    const product = dE_do3 * do3_ds3 * ds3_do2 * do2_ds2 * ds2_dw2;
    steps.push({
      layer: 2,
      lhsLatex: '\\frac{\\partial E}{\\partial w_2}',
      productValue: product,
      terms: [
        // reused layer-3 components retain blue colour
        {
          id: 'dE_do3',
          latex: '\\frac{\\partial E}{\\partial o_3}',
          layer: 3,
          formulaLatex: '2(o_3 - t)',
          value: dE_do3,
        },
        {
          id: 'do3_ds3',
          latex: '\\frac{\\partial o_3}{\\partial s_3}',
          layer: 3,
          formulaLatex: 'o_3 (1 - o_3)',
          value: do3_ds3,
        },
        {
          id: 'ds3_do2',
          latex: '\\frac{\\partial s_3}{\\partial o_2}',
          layer: 3,
          formulaLatex: 'w_3',
          value: ds3_do2,
        },
        {
          id: 'do2_ds2',
          latex: '\\frac{\\partial o_2}{\\partial s_2}',
          layer: 2,
          formulaLatex: 'o_2 (1 - o_2)',
          value: do2_ds2,
        },
        {
          id: 'ds2_dw2',
          latex: '\\frac{\\partial s_2}{\\partial w_2}',
          layer: 2,
          formulaLatex: 'o_1',
          value: ds2_dw2,
        },
      ],
    });
  }

  /* Step 3: ∂E/∂w1 — expand all the way back */
  if (numSteps >= 3) {
    const product =
      dE_do3 * do3_ds3 * ds3_do2 * do2_ds2 * ds2_do1 * do1_ds1 * ds1_dw1;
    steps.push({
      layer: 1,
      lhsLatex: '\\frac{\\partial E}{\\partial w_1}',
      productValue: product,
      terms: [
        {
          id: 'dE_do3',
          latex: '\\frac{\\partial E}{\\partial o_3}',
          layer: 3,
          formulaLatex: '2(o_3 - t)',
          value: dE_do3,
        },
        {
          id: 'do3_ds3',
          latex: '\\frac{\\partial o_3}{\\partial s_3}',
          layer: 3,
          formulaLatex: 'o_3 (1 - o_3)',
          value: do3_ds3,
        },
        {
          id: 'ds3_do2',
          latex: '\\frac{\\partial s_3}{\\partial o_2}',
          layer: 3,
          formulaLatex: 'w_3',
          value: ds3_do2,
        },
        {
          id: 'do2_ds2',
          latex: '\\frac{\\partial o_2}{\\partial s_2}',
          layer: 2,
          formulaLatex: 'o_2 (1 - o_2)',
          value: do2_ds2,
        },
        {
          id: 'ds2_do1',
          latex: '\\frac{\\partial s_2}{\\partial o_1}',
          layer: 2,
          formulaLatex: 'w_2',
          value: ds2_do1,
        },
        {
          id: 'do1_ds1',
          latex: '\\frac{\\partial o_1}{\\partial s_1}',
          layer: 1,
          formulaLatex: 'o_1 (1 - o_1)',
          value: do1_ds1,
        },
        {
          id: 'ds1_dw1',
          latex: '\\frac{\\partial s_1}{\\partial w_1}',
          layer: 1,
          formulaLatex: 'x',
          value: ds1_dw1,
        },
      ],
    });
  }

  return steps;
}

/* ── component ────────────────────────────────────────────────── */
export default function Backpropagation() {
  /* editable state */
  const [xVal, setXVal] = useState(DEFAULT_X);
  const [target, setTarget] = useState(DEFAULT_T);
  const [weights, setWeights] = useState<[number, number, number]>(DEFAULT_W);

  /* phase: 'edit' | 'forward' | 'backward' */
  const [forwardDone, setForwardDone] = useState(false);
  const [forwardAnimating, setForwardAnimating] = useState(false);
  const [backwardSteps, setBackwardSteps] = useState(0); // 0..3
  const timer = useRef<number | null>(null);
  const breakdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  useEffect(() => {
    if (backwardSteps > 0) {
      breakdownRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [backwardSteps]);

  const editingDisabled = forwardDone || forwardAnimating;

  const forwardVals = useMemo<ForwardVals | null>(
    () => (forwardDone ? computeForward(xVal, weights) : null),
    [forwardDone, xVal, weights],
  );

  const lossValue = useMemo(() => {
    if (!forwardVals) return null;
    return Math.pow(forwardVals.o[2] - target, 2);
  }, [forwardVals, target]);

  const chainSteps: ChainStep[] = useMemo(() => {
    if (!forwardVals) return [];
    return buildChainSteps(
      forwardVals,
      weights,
      target,
      backwardSteps as 0 | 1 | 2 | 3,
    );
  }, [forwardVals, weights, target, backwardSteps]);

  /* highlighted layers in diagram = layers visited so far */
  const highlightedLayers = useMemo<Set<1 | 2 | 3>>(() => {
    const s = new Set<1 | 2 | 3>();
    if (backwardSteps >= 1) s.add(3);
    if (backwardSteps >= 2) s.add(2);
    if (backwardSteps >= 3) s.add(1);
    return s;
  }, [backwardSteps]);

  /* ── handlers ───────────────────────────────────────────────── */
  const handleForwardPass = useCallback(() => {
    if (forwardDone || forwardAnimating) return;
    setForwardAnimating(true);
    timer.current = window.setTimeout(() => {
      setForwardDone(true);
      setForwardAnimating(false);
    }, 1200);
  }, [forwardDone, forwardAnimating]);

  const handleStepBackward = useCallback(() => {
    if (!forwardDone) return;
    setBackwardSteps((s) => Math.min(3, s + 1));
  }, [forwardDone]);

  const handleResetBackward = useCallback(() => {
    setBackwardSteps(0);
  }, []);

  const handleResetAll = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setForwardDone(false);
    setForwardAnimating(false);
    setBackwardSteps(0);
  }, []);

  const randomizeAll = () => {
    setXVal(rand(-1, 1));
    setTarget(rand(0, 1));
    setWeights([rand(-1, 1), rand(-1, 1), rand(-1, 1)]);
  };

  const updateWeight = (i: number, v: number) =>
    setWeights((p) => {
      const n = [...p] as [number, number, number];
      n[i] = v;
      return n;
    });

  const disabledInput = editingDisabled ? 'bg-accent-light cursor-not-allowed' : '';

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="space-y-10">
      {/* ═══════ Descriptive Text ═══════ */}
      <section className="space-y-5 max-w-[840px]">
        <h1 className="text-[24px] font-semibold text-text-primary">
          Backpropagation
        </h1>

        <p>
          Once a network has produced an output via forward propagation, it
          needs to know <em>how</em> to improve. By <em>improving</em>, we 
          mean to adjust all the weights such that the total error <InlineMath math="E" /> is minimised.
          {' '}<strong>Backpropagation</strong> is the algorithm that computes 
          how much each weight contributed to the network's error — that is, the 
          gradient{' '} <InlineMath math="\partial E / \partial w" /> for every 
          weight in the network.
        </p>

        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            The Chain Rule
          </h2>
          <p>
            Our goal is to compute <InlineMath math="\partial E / \partial w" /> for
            every weight in the network. However, this cannot be done through 
            direct computation — there is no direct expression that links a
            weight deep in the network straight to the final error.
          </p>
          <p className="mt-3">
            Consider a weight in a middle layer, say <InlineMath math="w_2" />.
            The error <InlineMath math="E" /> does not depend on{' '}
            <InlineMath math="w_2" /> directly — it depends on{' '}
            <InlineMath math="w_2" /> only through the neuron outputs that come{' '}
            <em>after</em> it. To find <InlineMath math="\partial E / \partial w_2" />,
            we must first understand how the error changes with respect to those
            later-layer outputs, then trace that influence backward to{' '}
            <InlineMath math="w_2" />. This is why the algorithm is called{' '}
            <strong>back</strong>propagation — computation flows from the output
            layer back toward the input.
          </p>
          <p className="mt-3">
            The tool that makes this tractable is the{' '}
            <a
              href="https://mathsathome.com/chain-rule-differentiation/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-primary hover:text-accent-hover underline"
            >
              chain rule
            </a>{' '}
            from calculus. It lets us break a complicated derivative — one we
            cannot compute directly — into a product of simpler derivatives
            that are each straightforward to evaluate (see later):
          </p>

          {/* symbol diagram */}
          <div className="my-6 overflow-x-auto">
            <svg
              viewBox="0 0 680 220"
              className="w-full max-w-[680px] mx-auto"
              style={{ minWidth: 440 }}
            >
              <defs>
                <marker id="arr-bp" markerWidth={7} markerHeight={7} refX={4} refY={3.5} orient="auto">
                  <polygon points="0 0, 7 3.5, 0 7" fill="#AAB7B8" />
                </marker>
              </defs>

              {/* ── nodes ── */}
              {/* o1 node */}
              <circle cx={75} cy={125} r={36} fill="#D5DBDB" stroke="#AAB7B8" strokeWidth={1.5} />
              <text x={75} y={121} textAnchor="middle" fontSize={14} fontWeight={600} fill="#5D6D7E">o</text>
              <text x={83} y={127} textAnchor="middle" fontSize={9} fill="#5D6D7E">1</text>

              {/* main neuron — empty interior */}
              <circle cx={340} cy={125} r={44} fill="#FFFFFF" stroke="#27AE60" strokeWidth={2} />

              {/* E box */}
              <rect x={568} y={103} width={56} height={44} rx={6} fill="#D5DBDB" stroke="#AAB7B8" strokeWidth={1.5} />
              <text x={596} y={131} textAnchor="middle" fontSize={18} fontWeight={700} fill="#5D6D7E">E</text>

              {/* ── arrows ── */}
              <line x1={112} y1={125} x2={294} y2={125} stroke="#AAB7B8" strokeWidth={1.8} markerEnd="url(#arr-bp)" />
              <line x1={385} y1={125} x2={566} y2={125} stroke="#AAB7B8" strokeWidth={1.8} markerEnd="url(#arr-bp)" />

              {/* ── w2 label: on incoming arrow, above line ── */}
              <text x={185} y={115} textAnchor="middle" fontSize={15} fontWeight={700} fill="#E67E22">w</text>
              <text x={193} y={121} textAnchor="middle" fontSize={9} fill="#E67E22">2</text>

              {/* ── s2 label: left of circle, above arrow ── */}
              <text x={271} y={112} textAnchor="middle" fontSize={15} fontWeight={700} fill="#27AE60">s</text>
              <text x={279} y={118} textAnchor="middle" fontSize={9} fill="#27AE60">2</text>

              {/* ── o2 label: right of circle, above arrow ── */}
              <text x={403} y={112} textAnchor="middle" fontSize={15} fontWeight={700} fill="#27AE60">o</text>
              <text x={411} y={118} textAnchor="middle" fontSize={9} fill="#27AE60">2</text>

              {/* ── annotation callouts ── */}
              {/* o1 → "output from previous layer" */}
              <line x1={75} y1={88} x2={75} y2={44} stroke="#AAB7B8" strokeWidth={1} strokeDasharray="3 3" />
              <text x={75} y={34} textAnchor="middle" fontSize={11} fill="#85929E">output from</text>
              <text x={75} y={46} textAnchor="middle" fontSize={11} fill="#85929E">previous layer</text>

              {/* w2 → "weight" (below) */}
              <line x1={185} y1={133} x2={185} y2={183} stroke="#E67E22" strokeWidth={1} strokeDasharray="3 3" />
              <text x={185} y={197} textAnchor="middle" fontSize={11} fontWeight={600} fill="#E67E22">weight</text>

              {/* s2 → "pre-activation (weighted sum + bias)" */}
              <line x1={271} y1={103} x2={271} y2={50} stroke="#27AE60" strokeWidth={1} strokeDasharray="3 3" />
              <text x={271} y={40} textAnchor="middle" fontSize={11} fontWeight={600} fill="#27AE60">pre-activation</text>
              <text x={271} y={52} textAnchor="middle" fontSize={11} fill="#27AE60">(weighted sum)</text>

              {/* o2 → "post-activation output" */}
              <line x1={405} y1={103} x2={405} y2={50} stroke="#27AE60" strokeWidth={1} strokeDasharray="3 3" />
              <text x={405} y={40} textAnchor="middle" fontSize={11} fontWeight={600} fill="#27AE60">post-activation</text>
              <text x={405} y={52} textAnchor="middle" fontSize={11} fill="#27AE60">output</text>

              {/* E → "loss / error" */}
              <line x1={596} y1={102} x2={596} y2={50} stroke="#AAB7B8" strokeWidth={1} strokeDasharray="3 3" />
              <text x={596} y={40} textAnchor="middle" fontSize={11} fill="#85929E">loss /</text>
              <text x={596} y={52} textAnchor="middle" fontSize={11} fill="#85929E">error</text>

              {/* E annotation */}
              <line x1={594} y1={82} x2={594} y2={32} stroke="#AAB7B8" strokeWidth={1} strokeDasharray="3 3" />
              <text x={594} y={22} textAnchor="middle" fontSize={11} fill="#85929E">loss / error</text>
            </svg>
          </div>

          {/* annotated formula */}
          <div className="my-6 flex flex-wrap items-start gap-x-4 gap-y-4 justify-center">
            {/* LHS: the hard part */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[17px]">
                <InlineMath math="\dfrac{\partial E}{\partial w_2}" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-layer-1 leading-none">↑</span>
                <span className="text-xs text-center text-layer-1 font-medium mt-0.5 max-w-[110px]">
                  difficult to compute directly
                </span>
              </div>
            </div>

            {/* equals */}
            <div className="text-xl text-text-primary mt-2">=</div>

            {/* RHS: the chain rule expansion */}
            <div className="flex flex-col items-center gap-2">
              <div className="text-[17px]">
                <InlineMath math="\dfrac{\partial E}{\partial o_2} \cdot \dfrac{\partial o_2}{\partial s_2} \cdot \dfrac{\partial s_2}{\partial w_2}" />
              </div>
              <div className="flex flex-col items-center">
                <span className="text-layer-2 leading-none">↑</span>
                <span className="text-xs text-center text-layer-2 font-medium mt-0.5 max-w-[260px]">
                  easy to compute — each factor is a local derivative
                </span>
              </div>
            </div>
          </div>

          <p>
            The first factor, <InlineMath math="\partial E / \partial o_2" />,
            is the error signal arriving from the next layer and this is something we
            have already computed when processing the layers after{' '}
            <InlineMath math="w_2" />. The remaining factors <InlineMath math="\partial o_2 / \partial s_2" /> 
            {' '}and <InlineMath math="\partial s_2 / \partial w_2" /> are purely local and 
            each of these is a simple formula. Multiplied together, they 
            give us the full gradient.
          </p>
        </div>
      </section>

      {/* ═══════ Key Formulas ═══════ */}
      <section className="space-y-5 max-w-[840px]">
        <h2 className="text-[18px] font-semibold text-text-primary">
          Key Formulas
        </h2>
        <p className="text-text-secondary text-sm">
          Before stepping through the interactive demo, here are the three
          building-block formulas that every gradient calculation below is
          assembled from.
        </p>

        {/* ── Loss function ── */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-text-primary">
            1. Loss function and its derivative
          </h3>
          <p className="text-sm">
            We measure how wrong the network's output denoted by{' '}
            <InlineMath math="o_3" /> is compared to the true target{' '}
            <InlineMath math="t" /> using the <strong>squared error</strong>:
          </p>
          <div className="text-center">
            <InlineMath math="E = (o_3 - t)^2" />
          </div>
          <p className="text-sm">
            To find how the error changes as the output changes, we differentiate
            with respect to <InlineMath math="o_3" />:
          </p>
          <div className="text-center">
            <InlineMath math="\dfrac{\partial E}{\partial o_3} = 2(o_3 - t)" />
          </div>
          <p className="text-sm text-text-secondary">
            Positive value = increasing output increases error = decrease output to reduce error. 
            <br />
            Negative value = increasing output decreases error = increase output to reduce error.
          </p>
        </div>

        {/* ── Sigmoid ── */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-text-primary">
            2. Sigmoid activation and its derivative
          </h3>
          <p className="text-sm">
            Every neuron in this network applies the{' '}
            <strong>sigmoid</strong> function to its pre-activation value{' '}
            <InlineMath math="s" /> to produce its output{' '}
            <InlineMath math="o" />:
          </p>
          <div className="text-center">
            <InlineMath math="\sigma(s) = \dfrac{1}{1 + e^{-s}}, \qquad o = \sigma(s)" />
          </div>
          <p className="text-sm">
            The derivative of sigmoid with respect to its input <InlineMath math="s" /> is:
          </p>
          <div className="text-center">
            <InlineMath math="\dfrac{\partial o}{\partial s} = \sigma(s)\,(1 - \sigma(s)) = o\,(1 - o)" />
          </div>
        </div>

        {/* ── ∂s/∂w ── */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4 space-y-2">
          <h3 className="font-semibold text-text-primary">
            3. How the pre-activation depends on the weight
          </h3>
          <p className="text-sm">
            The pre-activation <InlineMath math="s" /> of a neuron is a linear
            function of the incoming weight and the output from the previous layer:
          </p>
          <div className="text-center">
            <InlineMath math="s = w \cdot o_{\text{prev}}" />
          </div>
          <p className="text-sm">
            Differentiating with respect to <InlineMath math="w" /> — while
            treating <InlineMath math="o_{\text{prev}}" /> as a constant — gives:
          </p>
          <div className="text-center">
            <InlineMath math="\dfrac{\partial s}{\partial w} = o_{\text{prev}}" />
          </div>
        </div>
      </section>

      {/* ═══════ Interactive Section ═══════ */}
      <section className="space-y-6">
        <h2 className="text-[18px] font-semibold text-text-primary">
          Interactive Backpropagation
        </h2>

        <p className="text-sm text-text-secondary max-w-[840px]">
          A simple chain network with a single input, two hidden neurons, and
          one output, all using sigmoid activation. The loss is the squared
          error&nbsp;
          <InlineMath math="E = (o_3 - t)^2" />. Run the forward pass first,
          then click <strong>Step Backward</strong> repeatedly to compute
          gradients layer by layer from the output back to the input.
        </p>

        {/* ── input controls ── */}
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-secondary">Input</span>
            <InlineMath math="x" />
            <input
              type="number"
              step="0.01"
              value={xVal}
              disabled={editingDisabled}
              onChange={(e) => {
                const n = e.target.valueAsNumber;
                if (!isNaN(n)) setXVal(round2(n));
              }}
              className={`${inputCls} ${disabledInput}`}
            />
          </div>

          <div className="flex flex-col items-center gap-1">
            <span className="text-xs text-text-secondary">Target</span>
            <InlineMath math="t" />
            <input
              type="number"
              step="0.01"
              value={target}
              disabled={editingDisabled}
              onChange={(e) => {
                const n = e.target.valueAsNumber;
                if (!isNaN(n)) setTarget(round2(n));
              }}
              className={`${inputCls} ${disabledInput}`}
            />
          </div>

          {/* weights */}
          <div className="space-y-1.5">
            <span className="text-xs text-text-secondary">Weights</span>
            <div className="flex gap-3">
              {weights.map((w, i) => (
                <div key={`w-${i}`} className="flex flex-col items-center gap-1">
                  <InlineMath math={`w_${i + 1}`} />
                  <input
                    type="number"
                    step="0.01"
                    value={w}
                    disabled={editingDisabled}
                    onChange={(e) => {
                      const n = e.target.valueAsNumber;
                      if (!isNaN(n)) updateWeight(i, round2(n));
                    }}
                    className={`${inputCls} ${disabledInput}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={randomizeAll}
            disabled={editingDisabled}
            className={`px-4 py-1.5 text-sm rounded transition-colors ${
              editingDisabled
                ? 'bg-accent-light text-text-secondary cursor-not-allowed'
                : 'bg-accent-primary hover:bg-accent-hover text-white'
            }`}
          >
            Randomize All
          </button>
        </div>

        {/* ── network diagram ── */}
        <BackpropDiagram
          x={xVal}
          weights={weights}
          target={target}
          forwardDone={forwardDone}
          forwardVals={forwardVals}
          highlightedLayers={highlightedLayers}
        />

        {forwardDone && forwardVals && lossValue !== null && (
          <div className="text-sm text-red-500">
            Network output{' '}
            <InlineMath math={`o_3 = ${forwardVals.o[2].toFixed(4)}`} />
            , loss{' '}
            <InlineMath math={`E = (o_3 - t)^2 = (${forwardVals.o[2].toFixed(4)} - ${target.toFixed(4)})^2 = ${lossValue.toFixed(4)}`} />.
          </div>
        )}

        {/* ── action buttons ── */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleForwardPass}
            disabled={forwardDone || forwardAnimating}
            className={`px-5 py-2 text-sm rounded font-medium transition-colors ${
              forwardDone || forwardAnimating
                ? 'bg-accent-light text-text-secondary cursor-not-allowed'
                : 'bg-accent-primary hover:bg-accent-hover text-white'
            }`}
          >
            {forwardAnimating ? 'Running…' : 'Forward Pass'}
          </button>

          <button
            onClick={handleStepBackward}
            disabled={!forwardDone || backwardSteps >= 3}
            className={`px-5 py-2 text-sm rounded font-medium transition-colors ${
              !forwardDone || backwardSteps >= 3
                ? 'bg-accent-light text-text-secondary cursor-not-allowed'
                : 'bg-accent-primary hover:bg-accent-hover text-white'
            }`}
          >
            Step Backward
          </button>

          <button
            onClick={handleResetBackward}
            disabled={backwardSteps === 0}
            className={`px-5 py-2 text-sm rounded font-medium border transition-colors ${
              backwardSteps === 0
                ? 'border-border text-text-secondary bg-bg-secondary opacity-50 cursor-not-allowed'
                : 'border-border text-text-primary bg-bg-secondary hover:bg-border'
            }`}
          >
            Reset
          </button>

          <button
            onClick={handleResetAll}
            disabled={!forwardDone && backwardSteps === 0 && !forwardAnimating}
            className={`px-5 py-2 text-sm rounded font-medium border transition-colors ${
              !forwardDone && backwardSteps === 0 && !forwardAnimating
                ? 'border-border text-text-secondary bg-bg-secondary opacity-50 cursor-not-allowed'
                : 'border-border text-text-primary bg-bg-secondary hover:bg-border'
            }`}
          >
            Reset All
          </button>
        </div>

        {/* ── backward breakdown ── */}
        <div ref={breakdownRef} className="pb-24">
          <BackwardBreakdown steps={chainSteps} />
        </div>
      </section>
    </div>
  );
}
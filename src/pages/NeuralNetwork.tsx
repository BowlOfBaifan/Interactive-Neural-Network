import { useState, useRef, useCallback, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import NetworkDiagram from '../components/neural-network/NetworkDiagram';
import ForwardPassBreakdown from '../components/neural-network/ForwardPassBreakdown';

/* ── helpers ──────────────────────────────────────────────────── */
type ActivationFn = 'sigmoid' | 'relu' | 'tanh';

const round2 = (v: number) => Math.round(v * 100) / 100;
const rand = (lo: number, hi: number) => round2(Math.random() * (hi - lo) + lo);

function activate(z: number, fn: ActivationFn): number {
  switch (fn) {
    case 'sigmoid': return 1 / (1 + Math.exp(-z));
    case 'relu':    return Math.max(0, z);
    case 'tanh':    return Math.tanh(z);
  }
}

const inputCls =
  'bg-white border border-border rounded px-2 py-1 text-sm w-20 text-center text-text-primary focus:outline-none focus:border-accent-primary';

/* ── default network values ───────────────────────────────────── */
const INIT_INPUTS = [0.5, -0.3];

const INIT_WEIGHTS: number[][][] = [
  // input → hidden (2×2)
  [[ 0.15, -0.35],
   [-0.22,  0.48]],
  // hidden → output (2×2)
  [[ 0.33, -0.18],
   [-0.26,  0.44]],
];

const INIT_BIASES: number[][] = [
  [ 0.10, -0.15],   // hidden
  [ 0.12, -0.08],   // output
];

/* ── component ────────────────────────────────────────────────── */
export default function NeuralNetwork() {
  /* editable state */
  const [inputValues, setInputValues] = useState(INIT_INPUTS);
  const [weights, setWeights]         = useState(INIT_WEIGHTS);
  const [biases, setBiases]           = useState(INIT_BIASES);
  const [activationFn, setActivationFn] = useState<ActivationFn>('sigmoid');

  /* forward-pass state */
  const [step, setStep]                     = useState(0);   // 0-3
  const [animatingLayer, setAnimatingLayer] = useState<number | null>(null);
  const [editingDisabled, setEditingDisabled] = useState(false);

  const [hiddenPreAct, setHiddenPreAct]   = useState<number[] | null>(null);
  const [hiddenPostAct, setHiddenPostAct] = useState<number[] | null>(null);
  const [outputPreAct, setOutputPreAct]   = useState<number[] | null>(null);
  const [outputPostAct, setOutputPostAct] = useState<number[] | null>(null);

  const timer = useRef<number | null>(null);

  /* cleanup on unmount */
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  /* ── forward-pass step logic ────────────────────────────────── */
  const handleStepForward = useCallback(() => {
    if (animatingLayer !== null || step >= 3) return;

    if (step === 0) {
      setEditingDisabled(true);
      setStep(1);
      return;
    }

    if (step === 1) {
      // animate input → hidden, then compute hidden values
      setAnimatingLayer(0);
      timer.current = window.setTimeout(() => {
        const pre: number[] = [];
        const post: number[] = [];
        for (let j = 0; j < 2; j++) {
          let s = biases[0][j];
          for (let i = 0; i < 2; i++) s += inputValues[i] * weights[0][i][j];
          const z = round2(s);
          pre.push(z);
          post.push(round2(activate(z, activationFn)));
        }
        setHiddenPreAct(pre);
        setHiddenPostAct(post);
        setAnimatingLayer(null);
        setStep(2);
      }, 2000);
      return;
    }

    if (step === 2) {
      // animate hidden → output, then compute output values
      setAnimatingLayer(1);
      timer.current = window.setTimeout(() => {
        const pre: number[] = [];
        const post: number[] = [];
        for (let k = 0; k < 2; k++) {
          let s = biases[1][k];
          for (let j = 0; j < 2; j++) s += hiddenPostAct![j] * weights[1][j][k];
          const z = round2(s);
          pre.push(z);
          post.push(round2(activate(z, activationFn)));
        }
        setOutputPreAct(pre);
        setOutputPostAct(post);
        setAnimatingLayer(null);
        setStep(3);
      }, 2000);
    }
  }, [step, animatingLayer, inputValues, weights, biases, activationFn, hiddenPostAct]);

  /* ── reset ──────────────────────────────────────────────────── */
  const handleReset = useCallback(() => {
    if (timer.current) { clearTimeout(timer.current); timer.current = null; }
    setStep(0);
    setAnimatingLayer(null);
    setEditingDisabled(false);
    setHiddenPreAct(null);
    setHiddenPostAct(null);
    setOutputPreAct(null);
    setOutputPostAct(null);
  }, []);

  /* ── randomize ──────────────────────────────────────────────── */
  const randomizeAll = () => {
    setInputValues([rand(-1, 1), rand(-1, 1)]);
    setWeights([
      Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => rand(-1, 1))),
      Array.from({ length: 2 }, () => Array.from({ length: 2 }, () => rand(-1, 1))),
    ]);
    setBiases([
      Array.from({ length: 2 }, () => rand(-0.5, 0.5)),
      Array.from({ length: 2 }, () => rand(-0.5, 0.5)),
    ]);
  };

  /* ── weight / bias updaters (stable refs) ───────────────────── */
  const updateWeight = useCallback(
    (layer: number, from: number, to: number, v: number) =>
      setWeights((prev) => {
        const next = prev.map((l) => l.map((r) => [...r]));
        next[layer][from][to] = v;
        return next;
      }),
    [],
  );

  const updateBias = useCallback(
    (layer: number, neuron: number, v: number) =>
      setBiases((prev) => {
        const next = prev.map((l) => [...l]);
        next[layer][neuron] = v;
        return next;
      }),
    [],
  );

  const updateInput = (i: number, v: number) =>
    setInputValues((prev) => prev.map((old, j) => (j === i ? v : old)));

  const disabledInput = editingDisabled ? 'bg-accent-light cursor-not-allowed' : '';

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="space-y-10">
      {/* ═══════ Descriptive Text ═══════ */}
      <section className="space-y-5 max-w-[840px]">
        <h1 className="text-[24px] font-semibold text-text-primary">
          Neural Network Structure
        </h1>

        <p>
          A neural network is a collection of interconnected artificial neurons
          (perceptrons) organized into layers. By connecting many simple neurons
          together, a network can learn to model complex, non-linear patterns
          that a single perceptron cannot.
        </p>

        {/* -- Architecture -- */}
        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Network Architecture
          </h2>
          <p>A neural network is organized into three types of layers:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Input layer</strong> — receives the raw input data. Each
              neuron represents one feature. The input layer performs no
              computation; it simply passes values to the next layer.
            </li>
            <li>
              <strong>Hidden layer(s)</strong> — intermediate layers between
              input and output layer. Each neuron computes a weighted sum of its
              inputs, adds a bias, and applies an activation function <i>(as seen 
              in the Perceptron section)</i>. 
            </li>
            <li>
              <strong>Output layer</strong> — produces the network's final
              result using the same weighted-sum-plus-activation computation.
            </li>
          </ul>
          <p className="mt-3">
            In a <strong>fully connected</strong> (dense) architecture, every
            neuron in one layer connects to every neuron in the next. Each
            connection carries a weight{' '}
            <InlineMath math="w_{ij}" /> that determines the strength and
            direction of its influence.
          </p>
        </div>

        {/* -- Intuitive Understanding -- */}
        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Intuitive Understanding
          </h2>
          <p>
            Think of a neural network like an assembly line of detectives working 
            together to solve a puzzle. Instead of trying to guess the whole picture 
            at once, the puzzle is passed through a series of "hidden layers" where 
            each layer uncovers a specific pattern. The first layer only looks for the most 
            basic patterns, like simple edges, lines, or colors.
          </p>
          <p className="mt-3">
            They pass what they find to the next layer, who piece those basic patterns 
            together to form more complex patterns. This step-by-step teamwork 
            continues, with each layer building on the work of the last, until the 
            final layer looks at all the assembled patterns to confidently make the 
            final decision about what the complete picture shows.
          </p>
        </div>

        {/* -- Forward propagation -- */}
        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Forward Propagation
          </h2>
          <p>
            <strong>Forward propagation</strong> is the process of data flowing
            from the input layer through the hidden layer(s) to the output
            layer. At each neuron, the computation follows the same pattern
            learned in the Perceptron section:
          </p>
          <BlockMath math="z_j^{l} = \sum_{i} w_{ij}^{l}\, a_i^{l-1} + b_j^{l}, \qquad a_j^{l} = f(z_j^{l})" />
          <p>Where:</p>
          <ul className="list-disc pl-6 space-y-1 mt-2 mb-3">
            <li>
              <InlineMath math="z_j^{l}" />: The pre-activation value for neuron <InlineMath math="j" /> in the current layer <InlineMath math="l" />.
            </li>
            <li>
              <InlineMath math="w_{ij}^{l}" />: The weight connecting neuron <InlineMath math="i" /> in the previous layer <InlineMath math="l-1" /> to neuron <InlineMath math="j" /> in the current layer <InlineMath math="l" />.
            </li>
            <li>
              <InlineMath math="a_i^{l-1}" />: The incoming activation value from neuron <InlineMath math="i" /> in the previous layer <InlineMath math="l-1" />. (Note: For the first hidden layer, this is the input <InlineMath math="x_i" />).
            </li>
            <li>
              <InlineMath math="b_j^{l}" />: The bias added to the weighted sum of neuron <InlineMath math="j" /> in the current layer <InlineMath math="l" />.
            </li>
            <li>
              <InlineMath math="a_j^{l}" />: The post-activation value of neuron <InlineMath math="j" /> in the current layer <InlineMath math="l" /> after applying the activation function <InlineMath math="f" /> to the pre-activation <InlineMath math="z_j^{l}" />.
            </li>
          </ul>
          <p>
            The outputs of one layer become the inputs to the next, repeating until the output
            layer produces the network's final prediction.
          </p>
        </div>

        {/* -- Note -- */}
        <div className="bg-bg-secondary border border-border rounded-lg p-4 text-sm">
          <strong>Note:</strong> Real-world neural networks can have varying
          numbers of hidden layers and different numbers of neurons per layer.
          The fixed <InlineMath math="2 \to 2 \to 2" /> architecture shown
          here is simplified for learning purposes.
        </div>
      </section>

      {/* ═══════ Interactive Section ═══════ */}
      <section className="space-y-6">
        <h2 className="text-[18px] font-semibold text-text-primary">
          Interactive Forward Propagation
        </h2>

        {/* ── controls row ── */}
        <div className="flex flex-wrap items-end gap-6">
          {/* input values */}
          <div className="space-y-1.5">
            <span className="text-sm text-text-secondary">Input Values</span>
            <div className="flex gap-3">
              {inputValues.map((v, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <InlineMath math={`x_{${i + 1}}`} />
                  <input
                    type="number"
                    step="0.01"
                    value={v}
                    disabled={editingDisabled}
                    onChange={(e) => {
                      const n = e.target.valueAsNumber;
                      if (!isNaN(n)) updateInput(i, round2(n));
                    }}
                    className={`${inputCls} ${disabledInput}`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* activation */}
          <div className="flex flex-col gap-1">
            <span className="text-sm text-text-secondary">Activation</span>
            <select
              value={activationFn}
              disabled={editingDisabled}
              onChange={(e) => setActivationFn(e.target.value as ActivationFn)}
              className={`bg-white border border-border rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-primary ${disabledInput}`}
            >
              <option value="sigmoid">Sigmoid</option>
              <option value="relu">ReLU</option>
              <option value="tanh">Tanh</option>
            </select>
          </div>

          {/* randomize */}
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

        {/* ── hint ── */}
        <p className="text-sm text-red-400">
          Click on any connection to view or edit its weight.
          Click on any hidden or output neuron to view or edit its bias.
        </p>

        {/* ── network diagram ── */}
        <NetworkDiagram
          inputValues={inputValues}
          weights={weights}
          biases={biases}
          step={step}
          animatingLayer={animatingLayer}
          hiddenPreAct={hiddenPreAct}
          hiddenPostAct={hiddenPostAct}
          outputPreAct={outputPreAct}
          outputPostAct={outputPostAct}
          editingDisabled={editingDisabled}
          onWeightChange={updateWeight}
          onBiasChange={updateBias}
        />

        {/* ── action buttons ── */}
        <div className="flex gap-3">
          <button
            onClick={handleStepForward}
            disabled={animatingLayer !== null || step >= 3}
            title={step >= 3 ? 'Forward pass complete' : undefined}
            className={`px-5 py-2 text-sm rounded font-medium transition-colors ${
              animatingLayer !== null || step >= 3
                ? 'bg-accent-light text-text-secondary cursor-not-allowed'
                : 'bg-accent-primary hover:bg-accent-hover text-white'
            }`}
          >
            Step Forward
          </button>

          <button
            onClick={handleReset}
            disabled={step === 0}
            className={`px-5 py-2 text-sm rounded font-medium border transition-colors ${
              step === 0
                ? 'border-border text-text-secondary bg-bg-secondary opacity-50 cursor-not-allowed'
                : 'border-border text-text-primary bg-bg-secondary hover:bg-border'
            }`}
          >
            Reset
          </button>
        </div>

        {/* ── computation breakdown ── */}
        <ForwardPassBreakdown
          step={step}
          inputValues={inputValues}
          weights={weights}
          biases={biases}
          activationFn={activationFn}
          hiddenPreAct={hiddenPreAct}
          hiddenPostAct={hiddenPostAct}
          outputPreAct={outputPreAct}
          outputPostAct={outputPostAct}
        />
      </section>

      {/* ═══════ Supplementary ═══════ */}
      <section className="text-sm text-text-secondary max-w-[840px]">
        <p>
          To learn more about activation functions and their role, see the{' '}
          <a
            href="https://cs231n.github.io/neural-networks-1/#actfun"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-hover underline"
          >
            Stanford CS231n notes on activation functions
          </a>
          . For a comparison of sigmoid and ReLU, see{' '}
          <a
            href="https://machinelearningmastery.com/rectified-linear-activation-function-for-deep-learning-neural-networks/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-hover underline"
          >
            Machine Learning Mastery — ReLU introduction
          </a>
          .
        </p>
      </section>
    </div>
  );
}

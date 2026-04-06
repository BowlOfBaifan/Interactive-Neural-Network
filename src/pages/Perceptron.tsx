import { useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import PerceptronDiagram from '../components/perceptron/PerceptronDiagram';
import ComputationBreakdown from '../components/perceptron/ComputationBreakdown';

type Representation = 'explicit' | 'bias-as-weight';
type ActivationFn = 'step' | 'sigmoid' | 'relu';

const round2 = (v: number) => Math.round(v * 100) / 100;

const randomInRange = (min: number, max: number) =>
  round2(Math.random() * (max - min) + min);

function activate(z: number, fn: ActivationFn): number {
  switch (fn) {
    case 'step':
      return z >= 0 ? 1 : 0;
    case 'sigmoid':
      return 1 / (1 + Math.exp(-z));
    case 'relu':
      return Math.max(0, z);
  }
}

const inputClass =
  'bg-white border border-border rounded px-2 py-1 text-sm w-20 text-center text-text-primary focus:outline-none focus:border-accent-primary';

export default function Perceptron() {
  const [representation, setRepresentation] =
    useState<Representation>('explicit');
  const [inputs, setInputs] = useState([1.0, 0.5, -0.5]);
  const [weights, setWeights] = useState([0.5, -0.3, 0.8]);
  const [bias, setBias] = useState(0.2);
  const [activationFn, setActivationFn] = useState<ActivationFn>('step');

  // Derived computations
  const products = inputs.map((x, i) => round2(x * weights[i]));
  const weightedSum = round2(products.reduce((a, b) => a + b, 0));
  const preActivation = round2(weightedSum + bias);
  const output = round2(activate(preActivation, activationFn));

  // --- Handlers ---
  const updateInput = (i: number, v: number) =>
    setInputs((prev) => prev.map((old, j) => (j === i ? v : old)));
  const updateWeight = (i: number, v: number) =>
    setWeights((prev) => prev.map((old, j) => (j === i ? v : old)));

  const addInput = () => {
    if (inputs.length >= 5) return;
    setInputs((p) => [...p, 0]);
    setWeights((p) => [...p, 0]);
  };
  const removeInput = () => {
    if (inputs.length <= 1) return;
    setInputs((p) => p.slice(0, -1));
    setWeights((p) => p.slice(0, -1));
  };

  const randomizeAll = () => {
    setInputs((p) => p.map(() => randomInRange(-5, 5)));
    setWeights((p) => p.map(() => randomInRange(-2, 2)));
    setBias(randomInRange(-2, 2));
  };

  return (
    <div className="space-y-10">
      {/* ===== Descriptive Text ===== */}
      <section className="space-y-5 max-w-[840px]">
        <h1 className="text-[24px] font-semibold text-text-primary">
          Perceptron
        </h1>

        <p>
          A perceptron is the simplest form of an artificial neuron — the
          fundamental building block of neural networks. It takes multiple
          numerical inputs, computes a weighted combination, and produces a
          single output through an activation function.
        </p>

        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Core Computation
          </h2>
          <p>
            There can be multiple inputs, say from <InlineMath math="x_1" /> to <InlineMath math="x_n" />. 
            Each input <InlineMath math="x_i" /> is multiplied by a
            corresponding weight <InlineMath math="w_i" />. The products are
            summed and a bias term <InlineMath math="b" /> is added to produce 
            a the pre-activation value denoted by <InlineMath math="z" />. 
            This <InlineMath math="z" /> value is then fed into an activation 
            function <InlineMath math="f" /> to produce the final output of the neuron <InlineMath math="y" />:
          </p>
          <BlockMath math="y = f(z) = f\!\left(\sum_{i=1}^{n} w_i\, x_i + b\right)" />
          <ul className="list-disc pl-6 space-y-1 mt-2">
            <li>
              <strong>Weights</strong> (<InlineMath math="w_i" />) control how
              much influence each input has on the output.
            </li>
            <li>
              <strong>Bias</strong> (<InlineMath math="b" />) shifts the
              activation threshold, allowing the neuron to activate even when
              all inputs are zero.
            </li>
            <li>
              <strong>
                <a 
                  href="https://www.geeksforgeeks.org/machine-learning/activation-functions-neural-networks/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent-primary hover:text-accent-hover underline"
                >
                  Activation function
                </a>
              </strong>{' '}
              (<InlineMath math="f" />) determines the form of the output.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Common Activation Functions
          </h2>
          <p>
            The activation function <InlineMath math="f" /> transforms the
            pre-activation value <InlineMath math="z" /> into the neuron's
            output. Here are three common choices:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-4">
            {/* Step */}
            <div className="space-y-2">
              <h3 className="text-[15px] font-semibold text-text-primary">Step</h3>
              <BlockMath math="f(z)=\begin{cases}1 & z \ge 0\\0 & z < 0\end{cases}" />
              <svg viewBox="0 0 160 120" className="w-full max-w-[160px]">
                {/* axes */}
                <line x1="20" y1="60" x2="150" y2="60" stroke="#AAB7B8" strokeWidth="1" />
                <line x1="80" y1="10" x2="80" y2="110" stroke="#AAB7B8" strokeWidth="1" />
                {/* axis labels */}
                <text x="150" y="55" fontSize="10" fill="#85929E">z</text>
                <text x="85" y="16" fontSize="10" fill="#85929E">f(z)</text>
                {/* tick marks */}
                <text x="75" y="30" fontSize="9" fill="#85929E" textAnchor="end">1</text>
                <line x1="78" y1="25" x2="82" y2="25" stroke="#AAB7B8" strokeWidth="0.8" />
                {/* function */}
                <line x1="20" y1="95" x2="80" y2="95" stroke="#2E86C1" strokeWidth="2" />
                <line x1="80" y1="25" x2="145" y2="25" stroke="#2E86C1" strokeWidth="2" />
                <circle cx="80" cy="25" r="3" fill="#2E86C1" />
                <circle cx="80" cy="95" r="3" fill="white" stroke="#2E86C1" strokeWidth="1.5" />
              </svg>
            </div>

            {/* Sigmoid */}
            <div className="space-y-2">
              <h3 className="text-[15px] font-semibold text-text-primary">Sigmoid</h3>
              <BlockMath math="f(z)=\frac{1}{1+e^{-z}}" />
              <svg viewBox="0 0 160 120" className="w-full max-w-[160px]">
                <line x1="20" y1="60" x2="150" y2="60" stroke="#AAB7B8" strokeWidth="1" />
                <line x1="80" y1="10" x2="80" y2="110" stroke="#AAB7B8" strokeWidth="1" />
                <text x="150" y="55" fontSize="10" fill="#85929E">z</text>
                <text x="85" y="16" fontSize="10" fill="#85929E">f(z)</text>
                <text x="75" y="30" fontSize="9" fill="#85929E" textAnchor="end">1</text>
                <line x1="78" y1="25" x2="82" y2="25" stroke="#AAB7B8" strokeWidth="0.8" />
                {/* sigmoid curve as polyline — sampled from z = -5 to 5 */}
                <polyline
                  fill="none"
                  stroke="#2E86C1"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  points="20,94 30,93 38,91 44,88 50,84 56,78 62,70 68,60 74,49 80,40 86,33 92,28 98,26 104,25 110,24 120,24 145,24"
                />
              </svg>
            </div>

            {/* ReLU */}
            <div className="space-y-2">
              <h3 className="text-[15px] font-semibold text-text-primary">ReLU</h3>
              <BlockMath math="f(z)=\max(0,\,z)" />
              <svg viewBox="0 0 160 120" className="w-full max-w-[160px]">
                <line x1="20" y1="60" x2="150" y2="60" stroke="#AAB7B8" strokeWidth="1" />
                <line x1="80" y1="10" x2="80" y2="110" stroke="#AAB7B8" strokeWidth="1" />
                <text x="150" y="55" fontSize="10" fill="#85929E">z</text>
                <text x="85" y="16" fontSize="10" fill="#85929E">f(z)</text>
                {/* function: flat at 0 for z<0, linear for z>=0 */}
                <line x1="20" y1="60" x2="80" y2="60" stroke="#2E86C1" strokeWidth="2" />
                <line x1="80" y1="60" x2="140" y2="10" stroke="#2E86C1" strokeWidth="2" />
                <circle cx="80" cy="60" r="3" fill="#2E86C1" />
              </svg>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Two Representations
          </h2>
          <p>The bias can be expressed in two equivalent ways:</p>
          <ol className="list-decimal pl-6 space-y-3 mt-2">
            <li>
              <strong>Explicit bias</strong> — the bias{' '}
              <InlineMath math="b" /> appears as a separate additive term:
              <BlockMath math="y = f\!\left(\sum_{\textcolor{red}{i=1}}^{n} w_i\, x_i + b\right)" />
            </li>
            <li>
              <strong>Bias as weight</strong> — the bias is absorbed into the
              weight vector as <InlineMath math="w_0" /> with a fixed input{' '}
              <InlineMath math="x_0 = 1" />:
              <BlockMath math="y = f\!\left(\sum_{\textcolor{red}{i=0}}^{n} w_i\, x_i\right)" />
            </li>
          </ol>
          <p className="mt-2">
            Both forms are mathematically identical. The bias-as-weight
            representation is sometimes preferred because it unifies all
            parameters into a single summation.
          </p>
        </div>


      </section>

      {/* ===== Interactive Section ===== */}
      <section className="space-y-6">
        <h2 className="text-[18px] font-semibold text-text-primary">
          Interactive Perceptron
        </h2>

        {/* Representation toggle */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setRepresentation('explicit')}
            className={`px-4 py-1.5 text-sm rounded-l-md border transition-colors ${
              representation === 'explicit'
                ? 'bg-accent-primary text-white border-accent-primary'
                : 'bg-bg-secondary text-text-secondary border-border hover:text-text-primary'
            }`}
          >
            Explicit Bias
          </button>
          <button
            onClick={() => setRepresentation('bias-as-weight')}
            className={`px-4 py-1.5 text-sm rounded-r-md border transition-colors ${
              representation === 'bias-as-weight'
                ? 'bg-accent-primary text-white border-accent-primary'
                : 'bg-bg-secondary text-text-secondary border-border hover:text-text-primary'
            }`}
          >
            Bias as Weight
          </button>
        </div>

        {/* Controls row */}
        <div className="flex flex-wrap items-center gap-6">
          {/* Input count */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">No. of Inputs:</span>
            <button
              onClick={removeInput}
              disabled={inputs.length <= 1}
              className="w-7 h-7 flex items-center justify-center rounded border border-border bg-bg-secondary text-text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
            >
              −
            </button>
            <span className="text-sm font-medium w-4 text-center">
              {inputs.length}
            </span>
            <button
              onClick={addInput}
              disabled={inputs.length >= 5}
              className="w-7 h-7 flex items-center justify-center rounded border border-border bg-bg-secondary text-text-primary hover:bg-accent-light disabled:opacity-40 disabled:cursor-not-allowed text-sm font-medium"
            >
              +
            </button>
          </div>

          {/* Activation function */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-secondary">Activation:</span>
            <select
              value={activationFn}
              onChange={(e) => setActivationFn(e.target.value as ActivationFn)}
              className="bg-white border border-border rounded px-3 py-1 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
            >
              <option value="step">Step</option>
              <option value="sigmoid">Sigmoid</option>
              <option value="relu">ReLU</option>
            </select>
          </div>

          {/* Randomize */}
          <button
            onClick={randomizeAll}
            className="px-4 py-1.5 text-sm rounded bg-accent-primary hover:bg-accent-hover text-white transition-colors"
          >
            Randomize All
          </button>
        </div>

        {/* Input / weight fields + diagram */}
        <div className="flex gap-8 items-start flex-wrap lg:flex-nowrap">
          {/* Fields column */}
          <div className="space-y-2 shrink-0">
            {/* Bias-as-weight: show x₀ row first */}
            {representation === 'bias-as-weight' && (
              <div className="flex items-center gap-3">
                <span className="w-10 text-right">
                  <InlineMath math="x_0" />
                </span>
                <input
                  type="number"
                  value={1}
                  disabled
                  className={`${inputClass} bg-accent-light cursor-not-allowed`}
                />
                <span className="w-10 text-right">
                  <InlineMath math="w_0" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={bias}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    if (!isNaN(v)) setBias(round2(v));
                  }}
                  className={inputClass}
                />
              </div>
            )}

            {/* Regular inputs */}
            {inputs.map((x, i) => {
              const idx = i + 1;
              return (
                <div key={i} className="flex items-center gap-3">
                  <span className="w-10 text-right">
                    <InlineMath math={`x_{${idx}}`} />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={x}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      if (!isNaN(v)) updateInput(i, round2(v));
                    }}
                    className={inputClass}
                  />
                  <span className="w-10 text-right">
                    <InlineMath math={`w_{${idx}}`} />
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={weights[i]}
                    onChange={(e) => {
                      const v = e.target.valueAsNumber;
                      if (!isNaN(v)) updateWeight(i, round2(v));
                    }}
                    className={inputClass}
                  />
                </div>
              );
            })}

            {/* Explicit bias field */}
            {representation === 'explicit' && (
              <div className="flex items-center gap-3 mt-1 pt-2 border-t border-border">
                <span className="w-10 text-right">
                  <InlineMath math="b" />
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={bias}
                  onChange={(e) => {
                    const v = e.target.valueAsNumber;
                    if (!isNaN(v)) setBias(round2(v));
                  }}
                  className={inputClass}
                />
              </div>
            )}
          </div>

          {/* Diagram */}
          <div className="flex-1 min-w-[400px]">
            <PerceptronDiagram
              inputs={inputs}
              weights={weights}
              bias={bias}
              representation={representation}
              preActivation={preActivation}
              output={output}
              activationFn={activationFn}
            />
          </div>
        </div>

        {/* Computation breakdown */}
        <ComputationBreakdown
          inputs={inputs}
          weights={weights}
          bias={bias}
          products={products}
          weightedSum={weightedSum}
          preActivation={preActivation}
          output={output}
          activationFn={activationFn}
          representation={representation}
        />
      </section>

      {/* ===== Supplementary ===== */}
      <section className="text-sm text-text-secondary max-w-[840px]">
        <p>
          A single perceptron can only classify linearly separable data — it
          cannot solve the XOR problem. To learn more, see{' '}
          <a
            href="https://towardsdatascience.com/how-neural-networks-solve-the-xor-problem-59763136bdd7/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-hover underline"
          >
            How Neural Networks Solve the XOR Problem
          </a>
          .
        </p>
      </section>
    </div>
  );
}

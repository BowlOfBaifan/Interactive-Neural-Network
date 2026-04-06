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
            Each input <InlineMath math="x_i" /> is multiplied by a
            corresponding weight <InlineMath math="w_i" />. The products are
            summed, a bias term <InlineMath math="b" /> is added to produce the
            pre-activation value <InlineMath math="z" />, and an activation
            function <InlineMath math="f" /> is applied to produce the output:
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
              <strong>Activation function</strong> (<InlineMath math="f" />)
              determines the form of the output.
            </li>
          </ul>
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
              <BlockMath math="y = f\!\left(\sum_{i=1}^{n} w_i\, x_i + b\right)" />
            </li>
            <li>
              <strong>Bias as weight</strong> — the bias is absorbed into the
              weight vector as <InlineMath math="w_0" /> with a fixed input{' '}
              <InlineMath math="x_0 = 1" />:
              <BlockMath math="y = f\!\left(\sum_{i=0}^{n} w_i\, x_i\right)" />
            </li>
          </ol>
          <p className="mt-2">
            Both forms are mathematically identical. The bias-as-weight
            representation is sometimes preferred because it unifies all
            parameters into a single summation.
          </p>
        </div>

        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            Decision Boundary
          </h2>
          <p>
            With a step activation function, the perceptron acts as a binary
            classifier. The equation{' '}
            <InlineMath math="\sum w_i x_i + b = 0" /> defines a linear
            decision boundary (hyperplane) in the input space, separating the
            two output classes.
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
            <span className="text-sm text-text-secondary">Inputs:</span>
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

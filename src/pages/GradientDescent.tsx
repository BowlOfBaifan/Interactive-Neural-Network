import { useCallback, useEffect, useRef, useState } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import LossCurvePlot, {
  W_MIN,
  W_MAX,
  f,
  fPrime,
} from '../components/gradient-descent/LossCurvePlot';
import UpdateTable, {
  type UpdateRow,
} from '../components/gradient-descent/UpdateTable';

const INITIAL_W = -2;
const INITIAL_ETA = 0.1;
const CONVERGENCE_EPS = 1e-4;
const RUN_INTERVAL_MS = 500;
const TANGENT_HOLD_MS = 600;

const round2 = (v: number) => Math.round(v * 100) / 100;
const clampW = (v: number) => Math.max(W_MIN, Math.min(W_MAX, v));

export default function GradientDescent() {
  const [w, setW] = useState(INITIAL_W);
  const [eta, setEta] = useState(INITIAL_ETA);
  const [history, setHistory] = useState<UpdateRow[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [tangentVisible, setTangentVisible] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<{
    wBefore: number;
    grad: number;
    eta: number;
    wAfter: number;
  } | null>(null);

  const wRef = useRef(w);
  const etaRef = useRef(eta);
  const iterRef = useRef(0);
  const runIntervalRef = useRef<number | null>(null);
  const tangentTimers = useRef<number[]>([]);

  useEffect(() => {
    wRef.current = w;
  }, [w]);
  useEffect(() => {
    etaRef.current = eta;
  }, [eta]);

  // cleanup on unmount
  useEffect(
    () => () => {
      if (runIntervalRef.current) clearInterval(runIntervalRef.current);
      tangentTimers.current.forEach((t) => clearTimeout(t));
    },
    [],
  );

  const showTangent = useCallback(() => {
    tangentTimers.current.forEach((t) => clearTimeout(t));
    tangentTimers.current = [];
    setTangentVisible(true);
    const t1 = window.setTimeout(() => {
      setTangentVisible(false);
    }, 100 + TANGENT_HOLD_MS);
    tangentTimers.current.push(t1);
  }, []);

  const stopRunning = useCallback(() => {
    if (runIntervalRef.current) {
      clearInterval(runIntervalRef.current);
      runIntervalRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const doStep = useCallback(() => {
    const wBefore = wRef.current;
    const grad = fPrime(wBefore);
    const etaNow = etaRef.current;
    const wAfter = clampW(wBefore - etaNow * grad);

    showTangent();

    iterRef.current += 1;
    const row: UpdateRow = {
      iter: iterRef.current,
      wBefore,
      grad,
      eta: etaNow,
      wAfter,
      lossAfter: f(wAfter),
    };
    setHistory((h) => [...h, row]);
    setLastUpdate({ wBefore, grad, eta: etaNow, wAfter });
    setSelectedIdx(null);
    setW(wAfter);

    return Math.abs(grad);
  }, [showTangent]);

  const handleStep = useCallback(() => {
    if (isRunning) return;
    doStep();
  }, [doStep, isRunning]);

  const handleRunToggle = useCallback(() => {
    if (isRunning) {
      stopRunning();
      return;
    }
    setIsRunning(true);
    runIntervalRef.current = window.setInterval(() => {
      const gMag = doStep();
      if (gMag < CONVERGENCE_EPS) {
        // auto-pause on convergence
        if (runIntervalRef.current) {
          clearInterval(runIntervalRef.current);
          runIntervalRef.current = null;
        }
        setIsRunning(false);
      }
    }, RUN_INTERVAL_MS);
  }, [isRunning, doStep, stopRunning]);

  const handleClearHistory = useCallback(() => {
    setHistory([]);
    setSelectedIdx(null);
    setLastUpdate(null);
    iterRef.current = 0;
  }, []);

  const handleWChange = useCallback(
    (newW: number) => {
      if (isRunning) return;
      setW(round2(newW));
      setSelectedIdx(null);
    },
    [isRunning],
  );

  const handleSelectRow = useCallback((idx: number) => {
    setSelectedIdx(idx);
  }, []);

  const markerW =
    selectedIdx !== null && history[selectedIdx]
      ? history[selectedIdx].wBefore
      : null;

  const currentLoss = f(w);

  return (
    <div className="space-y-10">
      {/* ═══════ Descriptive Text ═══════ */}
      <section className="space-y-5 max-w-[840px]">
        <h1 className="text-[24px] font-semibold text-text-primary">
          Gradient Descent
        </h1>

        <p>
          Backpropagation tells us the gradient{' '}
          <InlineMath math="\partial E / \partial w" /> for every weight in
          the network i.e. how the error responds to a small change in
          each weight. <strong>Gradient descent</strong> is the algorithm that
          uses these gradients to actually update the weights to reduce the
          error.
        </p>

        <div>
          <h2 className="text-[18px] font-semibold text-text-primary mb-2">
            The Update Rule
          </h2>
          <p>
            For every weight in the network, we apply the same simple rule:
          </p>
          <BlockMath math="w \leftarrow w - \eta \cdot \dfrac{\partial E}{\partial w}" />
          <p>
            To see why the minus sign does the right thing, consider both
            possible signs of the gradient:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-2 text-sm">
            <li>
              If <InlineMath math="\partial E / \partial w > 0" />, then
              increasing <InlineMath math="w" /> increases the error{' '}
              <InlineMath math="E" />. So to reduce the error, we need to{' '}
              <em>decrease</em> <InlineMath math="w" /> through subtracting a positive value. 
              <br />
              E.g. with <InlineMath math="\eta = 0.1" /> and{' '}
              <InlineMath math="\partial E / \partial w = 2" />:{' '}
              <InlineMath math="w \leftarrow w - 0.1 \cdot (2) = w - 0.2" />.
            </li>
            <li>
              If <InlineMath math="\partial E / \partial w < 0" />, then
              increasing <InlineMath math="w" /> decreases the error{' '}
              <InlineMath math="E" />. So to reduce the error, we need to{' '}
              <em>increase</em> <InlineMath math="w" /> — done through subtracting a negative value. 
              <br />
              E.g. with <InlineMath math="\eta = 0.1" /> and{' '}
              <InlineMath math="\partial E / \partial w = -2" />:{' '}
              <InlineMath math="w \leftarrow w - 0.1 \cdot (-2) = w + 0.2" />.
            </li>
          </ul>
          <p className="mt-4">
            <InlineMath math="\eta" /> (eta) is the{' '}
            <strong>learning rate</strong>. It controls how much we update the weights by each time.
            Choosing a good value for <InlineMath math="\eta" /> is critical:
          </p>
          <ul className="list-disc pl-6 mt-3 space-y-1 text-sm">
            <li>
              <strong>Too large:</strong> the update overshoots the minimum and
              may bounce around or diverge entirely.
            </li>
            <li>
              <strong>Too small:</strong> convergence is reliable but painfully
              slow, possibly requiring thousands of iterations.
            </li>
            <li>
              <strong>Just right:</strong> a smooth descent into the minimal error.
            </li>
          </ul>
        </div>
      </section>

      {/* ═══════ Interactive Section ═══════ */}
      <section className="space-y-6">
        <h2 className="text-[18px] font-semibold text-text-primary">
          Interactive Gradient Descent
        </h2>

        <p className="max-w-[840px]">
          Below is a one-dimensional loss landscape{' '}
          <InlineMath math="E(w) = \dfrac{(w - 3)^2 (w + 1)^2}{10}" />, which
          has a global minimum near <InlineMath math="w = 3" /> and a local
          minimum near <InlineMath math="w = -1" />. 
          <br />
          <br />
          <strong>How to use:</strong> 
          <br />
          Drag the blue dot to choose a starting weight, adjust the learning rate, 
          and click{' '}<strong>Step</strong> to perform one update — or{' '}
          <strong>Run</strong> to watch the descent unfold.
        </p>

        <div className="max-w-[840px]">
          <p className="font-semibold text-text-primary mb-2">
            Key observations to make:
          </p>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              Pick a starting weight, set a low learning rate, and click{' '}
              <strong>Run</strong>. Note the number of iterations needed to
              reach the minimum. Now reset to the same starting weight, nudge
              the learning rate slightly higher, and run again — you should see
              it reach the minimum in fewer iterations.
            </li>
            <li>
              Crank the learning rate up to its maximum and run. Watch how the
              weight overshoots the minimum on every step and bounces around
              the curve, never settling.
            </li>
            <li>
              Try starting the weight near <InlineMath math="w = -2" /> with a
              small learning rate. Gradient descent only follows the slope
              downhill from where it starts, so depending on the starting
              weight it may converge to a local minimum and never find the
              global one — a fundamental limitation of the algorithm.
            </li>
          </ol>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_260px] gap-6 items-start">
          {/* plot + breakdown */}
          <div className="space-y-4">
            <LossCurvePlot
              w={w}
              onWChange={handleWChange}
              draggingDisabled={isRunning}
              tangentVisible={tangentVisible}
              markerW={markerW}
            />

            {/* Step breakdown */}
            <div className="bg-bg-secondary border border-border rounded-lg p-4 min-h-[80px]">
              {lastUpdate ? (
                <div className="space-y-2 text-sm">
                  <div className="font-semibold text-text-primary">
                    Iteration {history.length}
                  </div>
                  <BlockMath
                    math={`w_{\\text{new}} = ${lastUpdate.wBefore.toFixed(
                      4,
                    )} - ${lastUpdate.eta.toFixed(
                      4,
                    )} \\cdot (${lastUpdate.grad.toFixed(
                      4,
                    )}) = ${lastUpdate.wAfter.toFixed(4)}`}
                  />
                </div>
              ) : (
                <p className="text-sm text-text-secondary">
                  Click <strong>Step</strong> to perform a gradient descent
                  update. The breakdown of each iteration's computation will
                  appear here.
                </p>
              )}
            </div>
          </div>

          {/* controls panel */}
          <div className="space-y-5 bg-bg-secondary border border-border rounded-lg p-4">
            <div>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm text-text-primary font-medium">
                  Learning rate <InlineMath math="\eta" />
                </span>
                <span className="text-sm text-text-primary tabular-nums">
                  {eta.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min={0.01}
                max={1.0}
                step={0.01}
                value={eta}
                onChange={(e) => setEta(parseFloat(e.target.value))}
                className="w-full accent-accent-primary"
              />
            </div>

            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-text-secondary">Current w</span>
                <span className="text-text-primary tabular-nums">
                  {w.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Current loss</span>
                <span className="text-text-primary tabular-nums">
                  {currentLoss.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Iterations</span>
                <span className="text-text-primary tabular-nums">
                  {history.length}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handleStep}
                disabled={isRunning}
                className={`px-4 py-2 text-sm rounded font-medium transition-colors ${
                  isRunning
                    ? 'bg-accent-light text-text-secondary cursor-not-allowed'
                    : 'bg-accent-primary hover:bg-accent-hover text-white'
                }`}
              >
                Step
              </button>
              <button
                onClick={handleRunToggle}
                className={`px-4 py-2 text-sm rounded font-medium transition-colors ${
                  isRunning
                    ? 'bg-accent-hover hover:bg-accent-primary text-white'
                    : 'bg-accent-primary hover:bg-accent-hover text-white'
                }`}
              >
                {isRunning ? 'Pause' : 'Run'}
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Tip: drag the blue dot to choose a starting position. Try
              starting near <InlineMath math="w = -2" /> with a small learning
              rate to see the descent get stuck in the local minimum.
            </p>
          </div>
        </div>

        <UpdateTable
          rows={history}
          selectedIdx={selectedIdx}
          onSelectRow={handleSelectRow}
          onClear={handleClearHistory}
        />
      </section>

      {/* ═══════ Supplementary ═══════ */}
      <section className="max-w-[840px]">
        <h2 className="text-[18px] font-semibold text-text-primary mb-2">
          Going further
        </h2>
        <p className="text-sm">
          In practice, gradient descent has many variants that differ in how
          much data is used per update — batch, stochastic, and mini-batch
          gradient descent — as well as more advanced optimizers like
          momentum, RMSProp, and Adam. For an excellent overview, see the{' '}
          <a
            href="https://cs231n.github.io/optimization-1/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent-primary hover:text-accent-hover underline"
          >
            Stanford CS231n notes on optimization
          </a>
          .
        </p>
      </section>
    </div>
  );
}
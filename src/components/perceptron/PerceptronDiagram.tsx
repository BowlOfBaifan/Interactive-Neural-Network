const SUB = ['₀', '₁', '₂', '₃', '₄', '₅'];

interface VisualInput {
  value: number;
  weight: number;
  label: string;
  wLabel: string;
}

interface Props {
  inputs: number[];
  weights: number[];
  bias: number;
  representation: 'explicit' | 'bias-as-weight';
  preActivation: number;
  output: number;
  activationFn: string;
}

function getThickness(w: number) {
  return 1 + 2.5 * Math.min(Math.abs(w), 2);
}

function getColor(w: number) {
  return w >= 0 ? '#2E86C1' : '#E67E22';
}

export default function PerceptronDiagram({
  inputs,
  weights,
  bias,
  representation,
  preActivation,
  output,
  activationFn,
}: Props) {
  const biasAsWeight = representation === 'bias-as-weight';

  const visualInputs: VisualInput[] = biasAsWeight
    ? [
        { value: 1, weight: bias, label: `x${SUB[0]}`, wLabel: `w${SUB[0]}` },
        ...inputs.map((v, i) => ({
          value: v,
          weight: weights[i],
          label: `x${SUB[i + 1]}`,
          wLabel: `w${SUB[i + 1]}`,
        })),
      ]
    : inputs.map((v, i) => ({
        value: v,
        weight: weights[i],
        label: `x${SUB[i + 1]}`,
        wLabel: `w${SUB[i + 1]}`,
      }));

  const n = visualInputs.length;
  const svgH = 350;
  const centerY = svgH / 2;
  const spacing = n > 1 ? Math.min(60, 280 / (n - 1)) : 0;
  const startY = centerY - ((n - 1) * spacing) / 2;

  const inputX = 80;
  const inputR = 24;
  const neuronX = 400;
  const neuronY = centerY;
  const neuronR = 40;
  const outputX = 570;

  const activationLabel: Record<string, string> = {
    step: 'Step',
    sigmoid: 'Sigmoid',
    relu: 'ReLU',
  };

  return (
    <svg
      viewBox={`0 0 640 ${svgH}`}
      className="w-full max-w-[640px]"
      role="img"
      aria-label="Perceptron diagram"
    >
      <defs>
        <marker
          id="arrowOut"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="8"
          markerHeight="8"
          orient="auto"
        >
          <path d="M0 0 L10 5 L0 10z" fill="#AAB7B8" />
        </marker>
      </defs>

      {/* Connection lines */}
      {visualInputs.map((inp, i) => {
        const iy = startY + i * spacing;
        const dx = neuronX - inputX;
        const dy = neuronY - iy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const x1 = inputX + (inputR * dx) / dist;
        const y1 = iy + (inputR * dy) / dist;
        const x2 = neuronX - (neuronR * dx) / dist;
        const y2 = neuronY - (neuronR * dy) / dist;
        const midX = (x1 + x2) / 2;
        const midY = (y1 + y2) / 2;
        const angle = Math.atan2(dy, dx);
        const labelX = midX - Math.sin(angle) * 15;
        const labelY = midY + Math.cos(angle) * 15;

        return (
          <g key={i}>
            <line
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={getColor(inp.weight)}
              strokeWidth={getThickness(inp.weight)}
              strokeLinecap="round"
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fill="#5D6D7E"
              stroke="#EAEDED"
              strokeWidth={3}
              paintOrder="stroke"
            >
              {inp.wLabel} = {inp.weight.toFixed(2)}
            </text>
          </g>
        );
      })}

      {/* Bias label (explicit mode) */}
      {!biasAsWeight && (
        <g>
          <line
            x1={neuronX}
            y1={neuronY - neuronR - 30}
            x2={neuronX}
            y2={neuronY - neuronR - 2}
            stroke="#AAB7B8"
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
          <text
            x={neuronX}
            y={neuronY - neuronR - 40}
            textAnchor="middle"
            fontSize="13"
            fill="#5D6D7E"
          >
            b = {bias.toFixed(2)}
          </text>
        </g>
      )}

      {/* Input nodes */}
      {visualInputs.map((inp, i) => {
        const iy = startY + i * spacing;
        return (
          <g key={`node-${i}`}>
            <circle
              cx={inputX}
              cy={iy}
              r={inputR}
              fill="#D5DBDB"
              stroke="#AAB7B8"
              strokeWidth={1.5}
            />
            <text
              x={inputX}
              y={iy}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="13"
              fill="#5D6D7E"
              fontWeight={500}
            >
              {inp.value.toFixed(2)}
            </text>
            <text
              x={inputX - inputR - 10}
              y={iy}
              textAnchor="end"
              dominantBaseline="central"
              fontSize="13"
              fill="#85929E"
            >
              {inp.label}
            </text>
          </g>
        );
      })}

      {/* Neuron */}
      <circle
        cx={neuronX}
        cy={neuronY}
        r={neuronR}
        fill="#D5DBDB"
        stroke="#AAB7B8"
        strokeWidth={2}
      />
      <text
        x={neuronX}
        y={neuronY - 8}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="11"
        fill="#85929E"
      >
        {activationLabel[activationFn]}
      </text>
      <text
        x={neuronX}
        y={neuronY + 12}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize="13"
        fontWeight={600}
        fill="#5D6D7E"
      >
        z = {preActivation.toFixed(2)}
      </text>

      {/* Output arrow */}
      <line
        x1={neuronX + neuronR}
        y1={neuronY}
        x2={outputX}
        y2={neuronY}
        stroke="#AAB7B8"
        strokeWidth={2}
        markerEnd="url(#arrowOut)"
      />
      <text
        x={outputX + 14}
        y={neuronY}
        textAnchor="start"
        dominantBaseline="central"
        fontSize="14"
        fill="#5D6D7E"
      >
        y = {output.toFixed(2)}
      </text>
    </svg>
  );
}

import { Link } from 'react-router-dom';

const topics = [
  {
    name: 'Perceptron',
    summary:
      'Explore how a single artificial neuron computes an output from weighted inputs.',
    to: '/perceptron',
  },
  {
    name: 'Neural Network Structure',
    summary:
      'See how connecting neurons into layers enables data transformation through forward propagation.',
    to: '/neural-network',
  },
  {
    name: 'Backpropagation',
    summary:
      'Trace how the network computes gradients by applying the chain rule backward through layers.',
    to: '/backpropagation',
  },
  {
    name: 'Gradient Descent',
    summary:
      'Watch how the network updates its weights step by step to minimize error.',
    to: '/gradient-descent',
  },
] as const;

export default function Home() {
  return (
    <div className="space-y-10">
      {/* Welcome Section */}
      <section>
        <h1 className="text-[24px] font-semibold text-text-primary">
          Neural Network Foundations
        </h1>
        <p className="text-[18px] text-text-secondary mt-1">
          An interactive learning tool for undergraduate computing students.
        </p>
        <p className="mt-4 max-w-[800px]">
          This tool covers four foundational concepts that together explain how a
          neural network learns: what a single neuron computes, how neurons
          connect to form a network, how the network identifies its mistakes, and
          how it corrects them.
        </p>
      </section>

      {/* Topic Overview Section */}
      <section>
        <div className="grid grid-cols-4 gap-5">
          {topics.map(({ name, summary, to }) => (
            <div
              key={to}
              className="flex flex-col bg-bg-secondary border border-border rounded-lg p-5 shadow-sm"
            >
              <h2 className="text-[18px] font-semibold text-text-primary">
                {name}
              </h2>
              <p className="mt-2 text-[15px] flex-1">{summary}</p>
              <Link
                to={to}
                className="mt-4 inline-block text-center bg-accent-primary hover:bg-accent-hover text-white text-[15px] font-medium py-2 px-4 rounded transition-colors"
              >
                Explore
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* How to Use Section */}
      <section>
        <h2 className="text-[18px] font-semibold text-text-primary">
          How to Use
        </h2>
        <p className="mt-2 max-w-[800px]">
          Each topic page has two parts — a descriptive text section to read the
          theory, and an interactive section to experiment hands-on. We encourage
          you to go through the topics in order, as each builds on the previous
          one. Supplementary links are provided for deeper reading on selected
          topics.
        </p>
      </section>
    </div>
  );
}
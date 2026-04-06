import { NavLink } from 'react-router-dom';

const tabs = [
  { label: 'Home', to: '/' },
  { label: 'Perceptron', to: '/perceptron' },
  { label: 'Neural Network Structure', to: '/neural-network' },
  { label: 'Backpropagation', to: '/backpropagation' },
  { label: 'Gradient Descent', to: '/gradient-descent' },
] as const;

export default function TabNav() {
  return (
    <nav className="sticky top-0 z-50 flex bg-bg-secondary border-b border-border">
      {tabs.map(({ label, to }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            [
              'px-5 py-3 text-[15px] font-medium transition-colors',
              isActive
                ? 'text-accent-primary border-b-[3px] border-accent-primary'
                : 'text-text-secondary hover:text-text-primary border-b-[3px] border-transparent',
            ].join(' ')
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
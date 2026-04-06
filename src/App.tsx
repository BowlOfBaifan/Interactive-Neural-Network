import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import Perceptron from './pages/Perceptron';
import NeuralNetwork from './pages/NeuralNetwork';
import Backpropagation from './pages/Backpropagation';
import GradientDescent from './pages/GradientDescent';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="perceptron" element={<Perceptron />} />
        <Route path="neural-network" element={<NeuralNetwork />} />
        <Route path="backpropagation" element={<Backpropagation />} />
        <Route path="gradient-descent" element={<GradientDescent />} />
      </Route>
    </Routes>
  );
}
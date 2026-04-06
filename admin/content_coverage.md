# 1. Content Coverage

**1. Perceptron**

* *Important:* What it does — inputs, weights, bias, activation function, output
* *Important:* Two equivalent representations (explicit bias vs. bias-as-weight with constant input 1)
* *Important:* Step function for binary classification — the perceptron draws a decision boundary
* *Supplementary:* XOR limitation and why it motivates multi-layer networks

**2. Neural Network Structure**

* *Important:* Layers: input, hidden, output — role of each
* *Important:* Fully connected architecture: every neuron connects to every neuron in the next layer
* *Important:* Forward propagation: data flows input → hidden → output, each neuron computes weighted sum → activation
* *Supplementary:* Why activation functions matter — without nonlinearity, stacking layers collapses to a single linear transformation
* *Supplementary:* Brief comparison of common activations (sigmoid vs. ReLU)

**3. Backpropagation**

* *Important:* The goal — compute ∂E/∂w for every weight to know how to adjust it
* *Important:* Chain rule as the core mechanism — decompose complex derivatives into products of local derivatives
* *Important:* Work backward from output layer to input layer
* *Important:* Intuition of "distributing blame" — each layer's error signal reflects its contribution to the final error
* *Important:* Gradient at each weight depends on three things: error signal from the next layer, derivative of the activation function, output of the previous layer

**4. Gradient Descent**

* *Important:* Weight update rule: w ← w − η · ∂E/∂w
* *Important:* Learning rate η — too large overshoots, too small converges slowly
* *Important:* Visual intuition — walking downhill on a loss surface, gradient points in the steepest direction
* *Supplementary:* Variants: batch, stochastic, mini-batch

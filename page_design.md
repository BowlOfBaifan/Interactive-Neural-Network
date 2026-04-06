
# Webpage Design

## Project Setup

* **Tech stack:** React single-page application (Vite as build tool)
* **Routing:** React Router v6 (hash router — `HashRouter`) for tab navigation. Hash routing avoids server-side configuration for SPA fallback, reducing deployment issues
* **Styling:** Tailwind CSS for utility-based styling. Scalable, avoids CSS specificity conflicts, and pairs well with component-based architecture. Use `tailwind.config.js` to define the custom colour palette as design tokens
* **Target platform:** Desktop only. Minimum viewport width: 1024px. No responsive/mobile layout required
* **Math rendering:** KaTeX via `react-katex` package. All mathematical formulas, variable names, equations, and symbolic expressions — both in descriptive text and interactive sections — must be rendered using KaTeX for visual consistency. This includes inline references such as wᵢ, ∂E/∂w, η, σ(z), etc.
* **Decimal precision:** All computed values rounded to 2 decimal places unless otherwise specified
* **Component structure:** Each page is its own top-level component. Shared UI elements (tab bar, buttons, popups) are extracted into a `components/common/` directory. Page-specific sub-components live in `components/<page-name>/`

---

## Colour Palette and Theming

**Base palette (serene workspace):**

| Token              | Hex         | Usage                                      |
| ------------------ | ----------- | ------------------------------------------ |
| `bg-primary`     | `#EAEDED` | Page background                            |
| `bg-secondary`   | `#D5DBDB` | Card backgrounds, panels, input fields     |
| `border`         | `#AAB7B8` | Borders, dividers, inactive tab underlines |
| `text-secondary` | `#85929E` | Secondary text, labels, placeholders       |
| `text-primary`   | `#5D6D7E` | Primary body text, headings                |

**Interactive accent colours:**

| Token              | Hex         | Usage                                              |
| ------------------ | ----------- | -------------------------------------------------- |
| `accent-primary` | `#2E86C1` | Buttons, active tab indicator, links, slider thumb |
| `accent-hover`   | `#1A5276` | Button hover/active states, link hover             |
| `accent-light`   | `#D4E6F1` | Button disabled state, subtle highlights           |

**Semantic layer colours (Backpropagation page only):**

| Token       | Hex         | Usage                                                   |
| ----------- | ----------- | ------------------------------------------------------- |
| `layer-3` | `#2E86C1` | Layer 3 (output) — symbols, node/connection highlights |
| `layer-2` | `#27AE60` | Layer 2 — symbols, node/connection highlights          |
| `layer-1` | `#E67E22` | Layer 1 — symbols, node/connection highlights          |

**Typography:**

* Font family: `Inter` (sans-serif), loaded via Google Fonts
* Heading size: 24px (page titles), 18px (section titles)
* Body text: 15px
* KaTeX inline math: inherits surrounding font size
* KaTeX display math: 17px
* Line height: 1.6 for body text

---

## Tab Navigation

* 5 tabs arranged horizontally at the top of the page in a fixed header bar
* Tab order: **Home** | **Perceptron** | **Neural Network Structure** | **Backpropagation** | **Gradient Descent**
* Active tab: `accent-primary` bottom border (3px), text colour `accent-primary`
* Inactive tabs: text colour `text-secondary`, no bottom border
* Hover on inactive tab: text colour `text-primary`
* Tab bar background: `bg-secondary`
* Tabs are implemented as `<NavLink>` components from React Router, mapping to routes: `/`, `/perceptron`, `/neural-network`, `/backpropagation`, `/gradient-descent`

---

## Home Page Design

The Home page serves as the landing page and user guide.

**Welcome Section:** A title "Neural Network Foundations" with a subtitle "An interactive learning tool for undergraduate computing students." A brief paragraph explaining that this tool covers four foundational concepts that together explain how a neural network learns: what a single neuron computes, how neurons connect to form a network, how the network identifies its mistakes, and how it corrects them.

**Topic Overview Section:** Four cards arranged horizontally, one for each topic in sequence. Each card has background `bg-secondary`, a 1px `border` colour border, and subtle box shadow. Each card contains:

* The topic name as a heading
* A one-sentence summary:
  * **Perceptron:** "Explore how a single artificial neuron computes an output from weighted inputs."
  * **Neural Network Structure:** "See how connecting neurons into layers enables data transformation through forward propagation."
  * **Backpropagation:** "Trace how the network computes gradients by applying the chain rule backward through layers."
  * **Gradient Descent:** "Watch how the network updates its weights step by step to minimize error."
* A button (styled with `accent-primary` background, white text) linking to the corresponding page

**How to Use Section:** A short paragraph explaining that each topic page has two parts — a descriptive text section to read the theory, and an interactive section to experiment hands-on. Encourages users to go through the topics in order as each builds on the previous one. Notes that supplementary links are provided for deeper reading on selected topics.

---

## Perceptron Page Design

The page is divided into two main sections.

**Descriptive Text Section:** Explains what a perceptron is, what it does, and how it works. Covers the core computation (inputs × weights, add bias, apply activation function), and introduces the two equivalent representations — explicit bias term versus treating bias as a weight (w₀) with constant input 1. Explains that the perceptron defines a linear decision boundary for binary classification. All formulas rendered with KaTeX.

**Interactive Section:** Contains the following elements in order:

* A toggle to switch between the two perceptron representations (explicit bias vs. bias-as-weight)
* Add (+) and remove (−) buttons to control the number of inputs (default 3, minimum 1, maximum 5)
* For each input: a field for the input value and a field for the corresponding weight
* A bias field (displayed as a standalone field in explicit bias mode, or as w₀ paired with the constant input 1 in the bias-as-weight mode)
* A "Randomize All" button that populates all inputs, weights, and bias with random values within their respective ranges
* **Random value ranges:** Inputs between −5 and 5, weights between −2 and 2, bias between −2 and 2. All values rounded to 2 decimal places
* A dropdown to select the activation function (step, sigmoid, ReLU). Step function threshold is 0: output is 1 if pre-activation ≥ 0, else 0
* A dynamic perceptron diagram (rendered with SVG) that visually reflects the current configuration:
  * Number of input arrows matches the number of inputs
  * Arrow thickness scales linearly with the absolute value of the weight: minimum thickness 1px (weight magnitude 0), maximum thickness 6px (weight magnitude ≥ 2). Values between 0 and 2 interpolate linearly
  * Positive weights are coloured `accent-primary`, negative weights are coloured `layer-1` (orange)
  * Node values update live as inputs change
* A computation breakdown panel showing the intermediate steps using KaTeX: the individual products (xᵢ × wᵢ), the weighted sum, the pre-activation value (sum + bias), and the final post-activation output

All values update in real-time as users modify inputs, weights, bias, or activation function.

**Supplementary Section:** A short sentence noting the XOR limitation of a single perceptron, with a clickable link to the external article: [How Neural Networks Solve the XOR Problem](https://towardsdatascience.com/how-neural-networks-solve-the-xor-problem-59763136bdd7/).

---

## Neural Network Structure Page Design

The page is divided into two main sections.

**Descriptive Text Section:** Explains what a neural network is — a collection of interconnected perceptrons organized into layers. Covers the three types of layers (input, hidden, output) and their roles. Describes the fully connected architecture where every neuron in one layer connects to every neuron in the next. Introduces forward propagation as the process of data flowing from input to output, where each neuron computes a weighted sum of its inputs, adds a bias, and applies an activation function. A note informs users that real-world neural networks can have varying numbers of hidden layers and different numbers of neurons per layer — the fixed architecture shown here is for learning purposes. All formulas rendered with KaTeX.

**Interactive Section:** Contains the following elements:

* A fixed network architecture: 3 input neurons → 4 hidden neurons → 2 output neurons
* Input fields for the 3 input values, with a "Randomize All" button that populates all inputs, weights, and biases randomly
* **Random value ranges:** Inputs between −1 and 1, weights between −1 and 1, biases between −0.5 and 0.5. All values rounded to 2 decimal places
* A dropdown to select the global activation function (sigmoid, ReLU, tanh)
* A network diagram (rendered with SVG) displaying all neurons and connections:
  * Default connection line thickness: 1.5px, colour `border`
  * **Editable popup behaviour:** Clicking on a connection line opens a small popup positioned adjacent to the click point, showing the weight value in an editable input field. Clicking on a neuron opens a similar popup showing its bias value. Only one popup is open at a time — opening a new popup closes the previous one. Clicking anywhere outside the popup dismisses it. Popup has `bg-secondary` background with `border` colour border and a subtle drop shadow
  * Neurons are rendered as circles with `bg-secondary` fill and `border` stroke
* A "Step Forward" button that animates the forward propagation one layer at a time with 2 seconds per step. The animation includes a brief highlight/pulse (colour `accent-primary`) on connections as data flows through them, then neuron values appear at the end of each step:
  * On the first click, the input values appear at the input layer nodes
  * On the second click, data flows to the hidden layer — connection lines animate to show data movement, and each hidden neuron displays two values: the pre-activation value (weighted sum + bias) and the post-activation value (after activation function)
  * On the third click, data flows to the output layer with the same display
* Once the forward pass begins (after the first "Step Forward" click), editing of inputs, weights, biases, and activation function is disabled (fields greyed out with `accent-light` background). The user must click "Reset" to re-enable editing
* A "Reset" button that returns the visualization to its initial state and re-enables editing
* During each step, a computation breakdown panel below the diagram shows the detailed calculations (rendered with KaTeX) for the current layer being computed — listing the weighted sums, bias additions, and activation function applications for each neuron in that layer

**Supplementary Section:** Two short sentences with clickable links:

* Why activation functions matter: link to [Stanford CS231n notes on activation functions](https://cs231n.github.io/neural-networks-1/#actfun)
* Sigmoid vs. ReLU comparison: link to [Machine Learning Mastery — ReLU introduction](https://machinelearningmastery.com/rectified-linear-activation-function-for-deep-learning-neural-networks/)

---

## Backpropagation Page Design

The page is divided into two main sections.

**Descriptive Text Section:** Explains the goal of backpropagation — computing ∂E/∂w for every weight so the network knows how to adjust them. Introduces the chain rule as the core mechanism: a complex derivative is decomposed into a product of simpler local derivatives. Explains that computation proceeds backward from the output layer, and why this is efficient — intermediate derivatives computed at later layers are reused when computing gradients for earlier layers. Covers the intuition of "distributing blame" and that each weight's gradient depends on three components: the error signal from the next layer, the derivative of the activation function, and the output of the previous layer. All formulas rendered with KaTeX.

**Interactive Section:** Contains the following elements:

* A fixed single-chain architecture: 1 input → 1 hidden → 1 hidden → 1 output, using sigmoid activation and squared error loss E = (y − t)², where y is the network's single output
* **Layer numbering:** Layer 1 = first hidden layer (closest to input), layer 2 = second hidden layer, layer 3 = output layer. The input itself is not numbered as a layer. w₁ connects input to layer 1, w₂ connects layer 1 to layer 2, w₃ connects layer 2 to layer 3
* **Pre-set defaults:** Target t = 0.8. Input x = 0.5. Weights: w₁ = 0.3, w₂ = 0.5, w₃ = 0.7. Biases: b₁ = 0.1, b₂ = 0.2, b₃ = 0.1
* A pre-set target value t displayed alongside the network
* Input fields for the single input value and each weight (one per connection, 3 total) and each bias (one per neuron, 3 total), with a "Randomize All" button
* **Random value ranges:** Weights between −1 and 1, biases between −0.5 and 0.5, input between −1 and 1, target between 0 and 1. All values rounded to 2 decimal places
* A "Forward Pass" button that animates data flowing forward through the chain, populating each neuron with its pre-activation (s) and post-activation (o) values. This must complete before the backward pass is available. Once the forward pass begins, editing of inputs, weights, and biases is disabled (fields greyed out)
* A network diagram (rendered with SVG) showing the chain with labeled nodes (s and o at each neuron) and labeled connections (w). After the forward pass, each node displays its symbolic label (e.g., s₁, o₁) rendered with KaTeX. Clicking on any node reveals a small panel (same popup style as Neural Network page) showing its numerical value
* A "Step Backward" button that progresses one layer at a time from output toward input. At each step:
  * The symbolic chain rule expression for ∂E/∂w at the current layer appears below the diagram, rendered with KaTeX (e.g., ∂E/∂w₃ = ∂E/∂o₃ · ∂o₃/∂s₃ · ∂s₃/∂w₃)
  * Each symbol is color-coded by its layer using the semantic layer colours: all symbols from layer 3 (o₃, s₃, w₃) in `layer-3` blue, layer 2 (o₂, s₂, w₂) in `layer-2` green, layer 1 (o₁, s₁, w₁) in `layer-1` orange. This color assignment is consistent throughout the entire backward pass
  * The corresponding connections and nodes on the network diagram are highlighted with their matching layer colour to show which parts of the network each derivative refers to
  * **Clickable symbolic terms:** Clicking on any individual symbolic term (e.g., ∂o₃/∂s₃) opens a detail panel below the chain rule expression. The panel shows the formula used (e.g., o₃(1 − o₃) for sigmoid derivative) and its computed numerical value, both rendered with KaTeX. Clicking a different term replaces the current panel content with a smooth crossfade transition (200ms). Only one detail panel is visible at a time
  * Clicking on the full product expression shows the final numerical gradient value in the same detail panel
  * As the backward pass reaches earlier layers, the chain rule expression for ∂E/∂o at the current layer must be expanded using derivatives from the next layer. For example, when computing ∂E/∂w₂, the term ∂E/∂o₂ expands to include ∂E/∂o₃ · ∂o₃/∂s₃ · ∂s₃/∂o₂ — these reused components retain their `layer-3` blue colour within the layer 2 expression, visually demonstrating that backpropagation reuses previously computed derivatives from later layers
* A "Reset" button that clears only the backward pass and returns to the post-forward-pass state (forward pass values remain visible, editing remains disabled). To fully reset and re-enable editing, a separate "Reset All" button returns to the initial pre-forward-pass state
* There is no supplementary content for this page

---

## Gradient Descent Page Design

The page is divided into two main sections.

**Descriptive Text Section:** Explains that once backpropagation computes the gradient ∂E/∂w for each weight, gradient descent uses these gradients to update the weights and reduce the error. Introduces the weight update rule w ← w − η · ∂E/∂w. Explains the learning rate η as a hyperparameter that controls step size — too large causes overshooting past the minimum, too small causes painfully slow convergence. Provides the visual intuition: imagine standing on a hilly landscape where elevation represents error. The gradient tells you which direction is steepest uphill, so you step in the opposite direction. Repeated steps eventually bring you to a valley (minimum error). All formulas rendered with KaTeX.

**Interactive Section:** Contains two linked components.

**Component 1 — Loss Curve Visualization:**

* Displays a 2D plot (rendered with SVG) of loss (E) on the vertical axis versus a single weight (w) on the horizontal axis. Axes are labelled using KaTeX
* **Loss curve function:** f(w) = (w − 3)² · (w + 1)² / 10. This is a quartic polynomial with a global minimum near w = 3 and a local minimum near w = −1
* **Weight axis range:** w from −3 to 5. Loss axis scales automatically to the function's range within the weight axis bounds
* Plot line colour: `text-primary`. Axis colour: `border`. Grid lines (subtle): `bg-secondary`
* A draggable dot (`accent-primary` fill, 8px radius) on the curve represents the current weight value. Users can drag this dot along the curve to set the starting position. The dot is constrained to move along the curve — its y-value is always determined by f(w). **Dragging is disabled while Run mode is active** — the user must click Pause first
* A learning rate slider from 0.01 to 1.0 that allows users to adjust η continuously. Slider track colour: `border`. Slider thumb: `accent-primary`
* A "Step" button that executes one gradient descent update. On each click:
  * A tangent line briefly appears (fade in 100ms, hold 600ms, fade out 300ms) at the current position on the curve, coloured `layer-1` (orange), visually representing the gradient (slope) at that point
  * The dot animates along the curve (300ms ease-out) to its new position according to w ← w − η · ∂E/∂w
  * If the updated weight falls outside the visible range (−3 to 5), it is clamped to the nearest boundary and the dot stays at the edge of the plot
  * Below the plot, the current iteration's computation is displayed using KaTeX: the current weight value, the gradient value at that point, the learning rate, and the resulting new weight value
* A "Run" button that auto-steps continuously at one step every 0.5 seconds so users can watch convergence in real-time. While running, the "Run" button changes to a "Pause" button. Pausing stops auto-stepping and re-enables dot dragging
* An iteration counter and current loss value displayed alongside the plot
* Observable behaviors the user can discover:
  * Small η: dot takes tiny steps, many iterations to converge
  * Large η: dot overshoots, bouncing back and forth across the minimum or diverging entirely
  * Appropriate η: smooth convergence to the minimum
  * Starting position near local minimum: dot may get trapped there instead of reaching the global minimum

**Component 2 — Weight Update Table:**

* A scrollable table (max height 300px) that logs each iteration's details: iteration number, weight before update, gradient, learning rate, weight after update, and loss after update
* Table header: `bg-secondary` background, `text-primary` text. Alternating row backgrounds: `bg-primary` and white
* All values displayed to 4 decimal places
* Rows are appended with each step, giving students a numerical record that complements the visual plot. Table auto-scrolls to the latest row
* A "Clear History" button to reset the table and the iteration counter

**Linking between components:** The loss curve and table stay synchronized — clicking a row in the table highlights that row (background `accent-light`) and places a secondary marker dot (`layer-2` green, 6px radius) at the corresponding position on the curve, allowing students to jump back and review any step. Clicking a different row moves the marker. The marker is distinct from the current-position dot.

**Supplementary Section:** A short sentence noting that in practice, gradient descent has variants that differ in how much data is used per update, with a clickable link to [Stanford CS231n notes on optimization](https://cs231n.github.io/optimization-1/).

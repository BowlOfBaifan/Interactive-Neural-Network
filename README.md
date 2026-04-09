# BT3017 Interactive Neural Network

An interactive educational website that walks learners through the fundamentals of neural networks — from the single perceptron, to full network structures, to how they learn via backpropagation and gradient descent. Each page combines written explanations, mathematical formulas, and hands-on interactive visualizations so concepts can be explored rather than just read.

## Tech stack

- React + TypeScript
- Vite
- Tailwind CSS
- KaTeX (math rendering)

## Prerequisites

- [Node.js](https://nodejs.org/) 18 or later (includes `npm`)

## Setup

1. Clone or download this repository.
2. From the project root, install dependencies:
   ```bash
   npm install
   ```

## Running the website locally

Start the development server:

```bash
npm run dev
```

Vite will print a local URL (typically `http://localhost:5173`). Open it in your browser to view and interact with the website. The dev server supports hot reload — edits to source files appear instantly.

## Building for production

To generate a static build in the `dist/` folder:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```
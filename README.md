# Binary Classifier Explorer

An interactive web application for exploring binary classification metrics and visualizing how different parameters affect classifier performance.

## Features

- Interactive visualization of binary classification distributions
- Real-time confusion matrix updates
- Comprehensive performance metrics (sensitivity, specificity, PPV, NPV, accuracy)
- Adjustable parameters for prevalence and distribution characteristics
- Modern React-based architecture with responsive design

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Technology Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **UI Components**: Radix UI (Slider)
- **Code Quality**: ESLint

## Usage

1. Adjust the prevalence slider to change the proportion of positive cases
2. Modify the distribution parameters (mean and standard deviation) for both populations
3. Move the operating point to see how it affects classification metrics
4. Observe real-time updates to the confusion matrix and performance metrics
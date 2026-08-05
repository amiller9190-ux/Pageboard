# Pageboard
### [🚀 Live Demo](https://pageboard.vercel.app)


**A storybook planner & outliner for children's book authors — by [The Nomadic Nymph & Co.](https://thenomadicnymph.com)**

Pageboard is a local-first web application that helps authors plan, outline, and manage children's storybook projects page by page. Everything saves automatically to your browser — no accounts, no servers, no cost.
## 🛠️ Technical Stack & Systems Design

Pageboard is engineered as a highly performant, local-first client application. It minimizes latency and infrastructure costs by offloading data persistence and processing directly to the browser runtime.

### Core Architecture Decisions

*   **Local-First Architecture:** By using browser `localStorage` under a unified project key, the application provides an instantaneous user experience. Data mutation bypasses traditional network latency entirely, working seamlessly offline with zero infrastructure server dependencies.
*   **Component-Driven UI:** Built using **React 18** to manage complex, nested form states across individual storybook pages. The dynamic layout relies on efficient state scheduling to sync real-time word metrics and illustration workflows without layout thrashing.
*   **Optimized Compilation & Build Tooling:** Implements **Vite** as the module bundler instead of heavy legacy frameworks. Vite leverages native ES modules during development for instant Hot Module Replacement (HMR) and relies on Rollup for highly optimized, tree-shaken static production bundles.
*   **Utility-First Design System:** Configured using **Tailwind CSS 3** to enforce a strict design token layout. Responsive grids, dynamic status badges, and strict visual state rules are applied through native utility primitives to guarantee layout scalability across varying client screen dimensions.




## Features

- **📝 Editor** — Page-by-page storyboard with text/rhyme and visual description fields. Live word counts and illustration status tracking per page.
- **✅ Checklist** — Illustration status overview with summary badges, progress bar, and one-click status cycling (Not Started → Sketching → Finalizing → Complete).
- **🔍 Validator** — KDP & IngramSpark formatting assistant that checks trim size, bleed settings, word counts, page counts, illustration completeness, and empty pages.
- **⚙️ Settings** — Configure your book's metadata: title, author, trim size, bleed, and target word count.
- **📋 Production Timeline** — Track milestones for both your children's book and a companion oracle deck project with persistent checklists and progress bars.

## Tech Stack

- React 18
- Vite
- Tailwind CSS 3
- localStorage (no backend required)

## Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Build for production
npm run build
```

The app runs on `http://localhost:5173` by default. All data is stored in your browser's localStorage under the key `pagecraft_project`.

## Creator

Built with ❤️ by [The Nomadic Nymph & Co.](https://thenomadicnymph.com)

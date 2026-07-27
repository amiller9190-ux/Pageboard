# Pageboard

**A storybook planner & outliner for children's book authors — by [The Nomadic Nymph & Co.](https://thenomadicnymph.com)**

Pageboard is a local-first web application that helps authors plan, outline, and manage children's storybook projects page by page. Everything saves automatically to your browser — no accounts, no servers, no cost.

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

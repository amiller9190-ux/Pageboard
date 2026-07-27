import { useState } from 'react';
import {
  ILLUSTRATION_STATUSES,
  ILLUSTRATION_STATUS_LABELS,
  ILLUSTRATION_STATUS_COLORS,
  PAGE_TYPE_LABELS,
} from '../lib/constants';

function getWordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export default function Workspace({ page, onUpdate }) {
  if (!page) {
    return (
      <main className="flex-1 flex items-center justify-center bg-brand-obsidian">
        <div className="text-center px-6">
          <div className="text-4xl mb-3">📖</div>
          <h2 className="text-xl font-semibold text-brand-gold mb-2">
            Welcome to PageCraft
          </h2>
          <p className="text-gray-500 max-w-md">
            Select a page from the sidebar or add a new one to begin writing
            your children's book.
          </p>
        </div>
      </main>
    );
  }

  const currentStatusIndex = ILLUSTRATION_STATUSES.indexOf(page.illustrationStatus);
  const statusColor = ILLUSTRATION_STATUS_COLORS[page.illustrationStatus] || 'bg-gray-500';
  const textWordCount = getWordCount(page.textContent);
  const visualWordCount = getWordCount(page.visualDescription);

  const cycleStatus = () => {
    const nextIndex = (currentStatusIndex + 1) % ILLUSTRATION_STATUSES.length;
    onUpdate({ illustrationStatus: ILLUSTRATION_STATUSES[nextIndex] });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-brand-obsidian">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Top bar: Page title + status badge */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <h1 className="text-xl font-bold text-brand-gold">
            Page {page.pageNumber}
          </h1>
          <button
            onClick={cycleStatus}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ${statusColor} text-white`}
            title="Click to cycle illustration status"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white" />
            {ILLUSTRATION_STATUS_LABELS[page.illustrationStatus]}
          </button>
          <span className="text-xs text-gray-500 ml-auto">
            {PAGE_TYPE_LABELS[page.pageType] || page.pageType}
          </span>
        </div>

        {/* Text Content */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Page Text / Rhymes
          </label>
          <textarea
            value={page.textContent}
            onChange={(e) => onUpdate({ textContent: e.target.value })}
            placeholder="Record your nomadic musings or celestial book rhymes here..."
            rows={8}
            className="w-full p-5 bg-brand-charcoal text-white rounded-lg border border-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none resize-y placeholder-gray-500 transition-colors duration-200"
            style={{ minHeight: '200px' }}
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {textWordCount} {textWordCount === 1 ? 'word' : 'words'}
          </p>
        </div>

        {/* Visual Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Visual Description &amp; Illustration Notes
          </label>
          <textarea
            value={page.visualDescription}
            onChange={(e) => onUpdate({ visualDescription: e.target.value })}
            placeholder="Describe the scene, characters, color palette, composition, and any illustration direction..."
            rows={6}
            className="w-full p-5 bg-brand-charcoal text-white rounded-lg border border-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none resize-y placeholder-gray-500 transition-colors duration-200"
            style={{ minHeight: '160px' }}
          />
          <p className="mt-1 text-xs text-gray-500 text-right">
            {visualWordCount} {visualWordCount === 1 ? 'word' : 'words'}
          </p>
        </div>
      </div>
    </main>
  );
}

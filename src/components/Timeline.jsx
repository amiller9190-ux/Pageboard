import { useState } from 'react';

const BOOK_MILESTONES = [
  { key: 'manuscriptDraft', label: 'Manuscript draft complete' },
  { key: 'storyboardPlanned', label: 'Storyboard pages planned' },
  { key: 'illustrationsSketched', label: 'Illustrations sketched' },
  { key: 'illustrationsFinalized', label: 'Illustrations finalized' },
  { key: 'readyForUpload', label: 'Ready for KDP/IngramSpark upload' },
];

const ORACLE_MILESTONES = [
  { key: 'cardConceptsDefined', label: 'Card concepts defined' },
  { key: 'preliminarySketchesDone', label: 'Preliminary sketches done' },
  { key: 'cardDescriptionsWritten', label: 'Card descriptions written' },
  { key: 'finalArtworkComplete', label: 'Final artwork complete' },
  { key: 'guidebookDrafted', label: 'Guidebook drafted' },
  { key: 'readyForPrint', label: 'Ready for print' },
];

function ProgressBar({ current, total, label }) {
  const pct = total > 0 ? Math.min(Math.round((current / total) * 100), 100) : 0;

  return (
    <div className="mb-3">
      <div className="flex justify-between text-xs text-gray-400 mb-1">
        <span>{label}</span>
        <span>
          {current}/{total} ({pct}%)
        </span>
      </div>
      <div className="w-full h-2 bg-brand-obsidian rounded-full overflow-hidden">
        <div
          className="h-full bg-brand-gold rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function MilestoneChecklist({ milestones, items, onToggle }) {
  return (
    <ul className="space-y-1.5">
      {items.map(({ key, label }) => {
        const checked = milestones[key] || false;
        return (
          <li key={key}>
            <label className="flex items-start gap-2 cursor-pointer group">
              <input
                type="checkbox"
                checked={checked}
                onChange={() => onToggle(key)}
                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-brand-obsidian text-brand-gold focus:ring-brand-gold focus:ring-1 cursor-pointer"
              />
              <span
                className={`text-sm transition-colors duration-200 ${
                  checked
                    ? 'text-gray-500 line-through'
                    : 'text-gray-300 group-hover:text-white'
                }`}
              >
                {checked && (
                  <span className="text-brand-gold mr-1">✓</span>
                )}
                {label}
              </span>
            </label>
          </li>
        );
      })}
    </ul>
  );
}

export default function Timeline({
  project,
  onToggleBookMilestone,
  onToggleOracleMilestone,
  onUpdateOracleTargetCards,
}) {
  const [bookOpen, setBookOpen] = useState(true);
  const [oracleOpen, setOracleOpen] = useState(true);

  const { metadata, pages } = project;
  const milestones = metadata.milestones || { book: {}, oracleDeck: {} };
  const oracleTargetCards = metadata.oracleTargetCards ?? 44;

  // Progress calculations
  const storyPages = pages.filter((p) => p.pageType === 'story');
  const completedIllustrations = storyPages.filter(
    (p) => p.illustrationStatus === 'complete'
  ).length;
  const totalStoryPages = storyPages.length;

  // Book milestones completed count
  const bookMilestoneKeys = BOOK_MILESTONES.map((m) => m.key);
  const bookCompleted = bookMilestoneKeys.filter(
    (k) => milestones.book?.[k]
  ).length;

  // Oracle milestones completed count
  const oracleMilestoneKeys = ORACLE_MILESTONES.map((m) => m.key);
  const oracleCompleted = oracleMilestoneKeys.filter(
    (k) => milestones.oracleDeck?.[k]
  ).length;

  return (
    <aside className="w-full lg:w-72 flex-shrink-0 bg-brand-charcoal border-l border-brand-obsidian overflow-y-auto">
      <div className="px-4 py-4">
        <h2 className="text-lg font-semibold text-brand-gold mb-4">
          Production Timeline
        </h2>

        {/* Section 1: Children's Book */}
        <div className="mb-4">
          <button
            onClick={() => setBookOpen((o) => !o)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-200 hover:text-white transition-colors duration-200 mb-2"
          >
            <span>📘 Children's Book</span>
            <span className="text-gray-500 text-xs">{bookOpen ? '▼' : '▶'}</span>
          </button>

          {bookOpen && (
            <div className="pl-1">
              <ProgressBar
                current={completedIllustrations}
                total={totalStoryPages}
                label="Illustrations Complete"
              />
              <MilestoneChecklist
                milestones={milestones.book || {}}
                items={BOOK_MILESTONES}
                onToggle={onToggleBookMilestone}
              />
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="border-t border-brand-obsidian my-4" />

        {/* Section 2: Oracle Deck */}
        <div>
          <button
            onClick={() => setOracleOpen((o) => !o)}
            className="w-full flex items-center justify-between text-sm font-medium text-gray-200 hover:text-white transition-colors duration-200 mb-2"
          >
            <span>🔮 Oracle Deck</span>
            <span className="text-gray-500 text-xs">{oracleOpen ? '▼' : '▶'}</span>
          </button>

          {oracleOpen && (
            <div className="pl-1">
              {/* Target cards input */}
              <div className="mb-3">
                <label className="block text-xs text-gray-400 mb-1">
                  Target cards
                </label>
                <input
                  type="number"
                  min={1}
                  max={200}
                  value={oracleTargetCards}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    if (!isNaN(val) && val > 0) {
                      onUpdateOracleTargetCards(val);
                    }
                  }}
                  className="w-full px-2.5 py-1.5 text-sm bg-brand-obsidian text-white rounded-md border border-gray-700 focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none transition-colors duration-200"
                />
              </div>

              <ProgressBar
                current={oracleCompleted}
                total={oracleMilestoneKeys.length}
                label="Milestones"
              />

              <MilestoneChecklist
                milestones={milestones.oracleDeck || {}}
                items={ORACLE_MILESTONES}
                onToggle={onToggleOracleMilestone}
              />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

import { useState } from 'react';
import { PAGE_TYPES, PAGE_TYPE_LABELS } from '../lib/constants';

const TEMPLATES = [
  {
    id: 'full-bleed',
    name: 'Full Bleed',
    emoji: '🖼️',
    description:
      'Illustration fills the entire page, text may overlay in a designated area',
    guidance: `Visual Description: Full-bleed illustration covering entire page. Focus: [subject]. Background: [setting]. Color palette: warm/cool/neutral. Text placement: [top overlay / bottom bar / center window].`,
  },
  {
    id: 'spot',
    name: 'Spot Illustration',
    emoji: '🎯',
    description:
      'A single focused illustration occupying ~40% of the page with text block beside/below',
    guidance: `Visual Description: Single illustration occupying left/top 40% of page. Subject: [character/object]. Action: [what's happening]. Text block: right/below illustration, approximately 3–4 lines of rhyme.`,
  },
  {
    id: 'vignette',
    name: 'Vignette Page',
    emoji: '🌿',
    description:
      'Small decorative illustration or border elements framing the main text',
    guidance: `Visual Description: Small decorative illustration in [corner/center/border]. Elements: [leaves, stars, swirls, character silhouette]. The illustration frames rather than dominates the text.`,
  },
  {
    id: 'two-page-spread',
    name: 'Two-Page Spread',
    emoji: '📖',
    description:
      'One continuous illustration spanning pages N and N+1 (creates TWO pages)',
    guidance: `Visual Description: Continuous landscape illustration spanning pages [N] and [N+1]. Panoramic view of [setting]. [Character] positioned at [left/center/right]. Creates one uninterrupted scene across the spread.`,
  },
  {
    id: 'silhouette',
    name: 'Silhouette',
    emoji: '🌑',
    description:
      'Dark silhouette illustration against a warm gradient background',
    guidance: `Visual Description: Dark silhouette of [subject] against a warm gradient background (sunset gold to deep purple). Minimal detail — shape and posture tell the story. Negative space used for emotional impact.`,
  },
];

export default function StoryTemplateWizard({ onAddPageWithData, onNavigateToEditor }) {
  const [step, setStep] = useState(1);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [pageType, setPageType] = useState('story');
  const [pageCount, setPageCount] = useState(1);

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setPageCount(template.id === 'two-page-spread' ? 2 : 1);
    setStep(2);
  };

  const handleBack = () => {
    setStep(1);
    setSelectedTemplate(null);
  };

  const handleCreate = () => {
    if (!selectedTemplate) return;

    const count = selectedTemplate.id === 'two-page-spread' ? 2 : pageCount;

    for (let i = 0; i < count; i++) {
      const suffix = count > 1 && i === 1 ? ' (continued)' : '';
      onAddPageWithData({
        visualDescription: selectedTemplate.guidance + suffix,
        pageType,
        textContent: '',
      });
    }

    // Navigate to editor
    if (onNavigateToEditor) {
      onNavigateToEditor();
    }

    // Reset wizard
    setStep(1);
    setSelectedTemplate(null);
    setPageCount(1);
  };

  return (
    <main className="flex-1 overflow-y-auto bg-brand-obsidian">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-brand-gold">Story Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            Start a new page with pre-filled structural guidance for your
            illustrator.
          </p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              step === 1
                ? 'bg-brand-gold text-brand-obsidian'
                : 'bg-brand-charcoal text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-brand-obsidian/30 flex items-center justify-center text-xs">
              1
            </span>
            Choose Layout
          </div>
          <div className="w-8 h-px bg-gray-600" />
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
              step === 2
                ? 'bg-brand-gold text-brand-obsidian'
                : 'bg-brand-charcoal text-gray-400'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-brand-obsidian/30 flex items-center justify-center text-xs">
              2
            </span>
            Customize & Create
          </div>
        </div>

        {/* Step 1: Choose Layout */}
        {step === 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => handleSelectTemplate(template)}
                className="text-left p-5 bg-brand-charcoal rounded-lg border border-transparent hover:border-brand-gold hover:bg-[#222233] transition-all duration-200 group"
              >
                <span className="text-3xl block mb-3">{template.emoji}</span>
                <h3 className="text-sm font-semibold text-brand-gold mb-1 group-hover:text-brand-gold">
                  {template.name}
                </h3>
                <p className="text-xs text-gray-400 leading-relaxed">
                  {template.description}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Customize & Create */}
        {step === 2 && selectedTemplate && (
          <div className="space-y-6">
            {/* Selected template info */}
            <div className="flex items-center gap-3 p-4 bg-brand-charcoal rounded-lg">
              <span className="text-2xl">{selectedTemplate.emoji}</span>
              <div>
                <h3 className="text-sm font-semibold text-brand-gold">
                  {selectedTemplate.name}
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedTemplate.description}
                </p>
              </div>
            </div>

            {/* Pre-filled guidance (read-only) */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Template Guidance (auto-inserted into Visual Description)
              </label>
              <textarea
                readOnly
                value={selectedTemplate.guidance}
                rows={5}
                className="w-full p-4 bg-brand-charcoal text-gray-400 rounded-lg border border-[#2a2a3a] outline-none resize-none text-sm italic cursor-default"
              />
            </div>

            {/* Page count */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Number of pages to create
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={pageCount}
                disabled={selectedTemplate.id === 'two-page-spread'}
                onChange={(e) =>
                  setPageCount(
                    Math.max(1, parseInt(e.target.value, 10) || 1)
                  )
                }
                className={`w-24 p-2.5 bg-brand-charcoal text-white rounded-lg border text-center text-sm ${
                  selectedTemplate.id === 'two-page-spread'
                    ? 'border-[#2a2a3a] text-gray-500 cursor-not-allowed'
                    : 'border-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none'
                }`}
              />
              {selectedTemplate.id === 'two-page-spread' && (
                <p className="text-xs text-gray-500 mt-1">
                  Two-Page Spread always creates exactly 2 pages.
                </p>
              )}
            </div>

            {/* Page Type */}
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-2">
                Page Type
              </label>
              <select
                value={pageType}
                onChange={(e) => setPageType(e.target.value)}
                className="p-2.5 bg-brand-charcoal text-white rounded-lg border border-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none text-sm"
              >
                {PAGE_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {PAGE_TYPE_LABELS[pt] || pt}
                  </option>
                ))}
              </select>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleBack}
                className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors duration-200"
              >
                ← Back
              </button>
              <button
                onClick={handleCreate}
                className="px-6 py-2.5 text-sm font-semibold bg-brand-gold text-brand-obsidian rounded-lg hover:bg-[#e0b830] transition-colors duration-200"
              >
                Create{' '}
                {selectedTemplate.id === 'two-page-spread'
                  ? '2'
                  : pageCount}{' '}
                Page{selectedTemplate.id === 'two-page-spread' || pageCount > 1
                  ? 's'
                  : ''}
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

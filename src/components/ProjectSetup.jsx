import { VALID_TRIM_SIZES } from '../lib/constants';

const inputClass =
  'w-full p-3 bg-brand-charcoal text-white rounded-lg border border-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none placeholder-gray-500 transition-colors duration-200';

const labelClass = 'block text-sm font-medium text-gray-400 mb-1.5';

export default function ProjectSetup({ metadata, onUpdateMetadata }) {
  return (
    <main className="flex-1 overflow-y-auto bg-brand-obsidian">
      <div className="max-w-2xl mx-auto px-6 py-6">
        <h2 className="text-xl font-bold text-brand-gold mb-6">
          Project Settings
        </h2>

        <div className="bg-brand-charcoal rounded-lg p-6 space-y-5">
          {/* Title */}
          <div>
            <label htmlFor="setup-title" className={labelClass}>
              Book Title
            </label>
            <input
              id="setup-title"
              type="text"
              value={metadata.title || ''}
              onChange={(e) => onUpdateMetadata({ title: e.target.value })}
              placeholder="Your Book Title"
              className={inputClass}
            />
          </div>

          {/* Author */}
          <div>
            <label htmlFor="setup-author" className={labelClass}>
              Author Name
            </label>
            <input
              id="setup-author"
              type="text"
              value={metadata.author || ''}
              onChange={(e) => onUpdateMetadata({ author: e.target.value })}
              placeholder="Author Name"
              className={inputClass}
            />
          </div>

          {/* Trim Size */}
          <div>
            <label htmlFor="setup-trim" className={labelClass}>
              Trim Size
            </label>
            <select
              id="setup-trim"
              value={metadata.trimSize || '8.5x8.5'}
              onChange={(e) => onUpdateMetadata({ trimSize: e.target.value })}
              className={inputClass}
            >
              {VALID_TRIM_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}"
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">
              KDP &amp; IngramSpark compatible sizes
            </p>
          </div>

          {/* Bleed Toggle */}
          <div>
            <label className="flex items-center gap-3 cursor-pointer">
              <button
                type="button"
                role="switch"
                aria-checked={metadata.hasBleed || false}
                onClick={() =>
                  onUpdateMetadata({ hasBleed: !metadata.hasBleed })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                  metadata.hasBleed ? 'bg-brand-gold' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white transition-transform duration-200 ${
                    metadata.hasBleed ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className="text-sm text-gray-300">
                Include bleed (0.125" recommended for KDP)
              </span>
            </label>
          </div>

          {/* Target Word Count */}
          <div>
            <label htmlFor="setup-target-words" className={labelClass}>
              Target Word Count
            </label>
            <input
              id="setup-target-words"
              type="number"
              min={0}
              value={metadata.targetWordCount ?? ''}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                onUpdateMetadata({
                  targetWordCount: isNaN(val) ? 0 : Math.max(0, val),
                });
              }}
              placeholder="500"
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </main>
  );
}

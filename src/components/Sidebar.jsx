import { ILLUSTRATION_STATUS_COLORS } from '../lib/constants';

export default function Sidebar({
  pages,
  currentPageId,
  onSelectPage,
  onAddPage,
  onDeletePage,
}) {
  return (
    <aside className="w-full lg:w-64 flex-shrink-0 bg-brand-charcoal flex flex-col border-r border-brand-obsidian">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-brand-obsidian">
        <h2 className="text-lg font-semibold text-brand-gold">Pages</h2>
        <button
          onClick={onAddPage}
          className="px-3 py-1 text-sm font-medium border border-brand-gold text-brand-gold rounded-md hover:bg-brand-gold hover:text-brand-obsidian transition-colors duration-200"
          title="Add a new page"
        >
          + Add Page
        </button>
      </div>

      {/* Page list */}
      <nav className="flex-1 overflow-y-auto">
        {pages.length === 0 ? (
          <p className="px-4 py-8 text-sm text-gray-500 text-center">
            No pages yet. Click "+ Add Page" to begin.
          </p>
        ) : (
          <ul className="py-1">
            {pages.map((page) => {
              const isActive = page.id === currentPageId;
              const preview = page.textContent
                ? page.textContent.slice(0, 40)
                : '';
              const statusColor = ILLUSTRATION_STATUS_COLORS[page.illustrationStatus] || 'bg-gray-500';

              return (
                <li key={page.id} className="relative group">
                  <button
                    onClick={() => onSelectPage(page.id)}
                    className={`w-full text-left px-4 py-3 border-l-4 transition-colors duration-200 ${
                      isActive
                        ? 'border-l-brand-gold bg-[#222233]'
                        : 'border-l-transparent hover:bg-[#222233]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-block w-2.5 h-2.5 rounded-full flex-shrink-0 ${statusColor}`}
                        title={page.illustrationStatus}
                      />
                      <span className="text-sm font-medium text-white">
                        Page {page.pageNumber}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-gray-500 truncate">
                      {preview || 'Empty page'}
                    </p>
                  </button>

                  {/* Delete button — visible on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeletePage(page.id);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                    title="Delete page"
                  >
                    ×
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </nav>
                <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50 rounded-xl m-2 text-center">
        <p className="text-xs text-slate-400 mb-2 font-medium">Your creative journey of a thousand stories begins here</p>
        <a 
          href="https://lemonsqueezy.com" 
          className="lemonsqueezy-button block w-full bg-amber-500 hover:bg-amber-600 text-black text-center text-xs font-bold py-2 px-3 rounded-lg shadow-md transition-colors"
        >
          🚀 Upgrade to Premium
        </a>
      </div>

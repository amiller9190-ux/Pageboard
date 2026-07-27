import {
  ILLUSTRATION_STATUSES,
  ILLUSTRATION_STATUS_LABELS,
  ILLUSTRATION_STATUS_COLORS,
} from '../lib/constants';

function truncate(text, maxLen) {
  if (!text) return '';
  return text.length > maxLen ? text.slice(0, maxLen) + '...' : text;
}

export default function IllustrationChecklist({ pages, onUpdatePage }) {
  const storyPages = pages.filter((p) => p.pageType === 'story');
  const totalStory = storyPages.length;
  const completed = storyPages.filter(
    (p) => p.illustrationStatus === 'complete'
  ).length;

  // Count badges
  const counts = ILLUSTRATION_STATUSES.reduce((acc, status) => {
    acc[status] = pages.filter((p) => p.illustrationStatus === status).length;
    return acc;
  }, {});

  const cycleStatus = (page) => {
    const currentIdx = ILLUSTRATION_STATUSES.indexOf(page.illustrationStatus);
    const nextIdx = (currentIdx + 1) % ILLUSTRATION_STATUSES.length;
    onUpdatePage(page.id, { illustrationStatus: ILLUSTRATION_STATUSES[nextIdx] });
  };

  if (pages.length === 0) {
    return (
      <main className="flex-1 overflow-y-auto bg-brand-obsidian">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            Illustration Checklist
          </h2>
          <div className="bg-brand-charcoal rounded-lg p-8 text-center">
            <p className="text-gray-500">
              No pages yet. Add pages in the Editor tab.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 overflow-y-auto bg-brand-obsidian">
      <div className="max-w-3xl mx-auto px-6 py-6">
        <h2 className="text-xl font-bold text-brand-gold mb-4">
          Illustration Checklist
        </h2>

        {/* Summary badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {ILLUSTRATION_STATUSES.map((status) => {
            const color = ILLUSTRATION_STATUS_COLORS[status] || 'bg-gray-500';
            return (
              <span
                key={status}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${color} text-white`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {counts[status]} {ILLUSTRATION_STATUS_LABELS[status]}
              </span>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Illustrations Complete</span>
            <span>
              {completed}/{totalStory} (
              {totalStory > 0
                ? Math.round((completed / totalStory) * 100)
                : 0}
              %)
            </span>
          </div>
          <div className="w-full h-2.5 bg-brand-obsidian rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold rounded-full transition-all duration-300"
              style={{
                width: `${totalStory > 0 ? (completed / totalStory) * 100 : 0}%`,
              }}
            />
          </div>
        </div>

        {/* Table */}
        <div className="bg-brand-charcoal rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-brand-obsidian">
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-gold">
                    Page #
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-gold">
                    Type
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-gold">
                    Status
                  </th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-brand-gold">
                    Visual Description
                  </th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => {
                  const statusColor =
                    ILLUSTRATION_STATUS_COLORS[page.illustrationStatus] ||
                    'bg-gray-500';
                  return (
                    <tr
                      key={page.id}
                      className="border-b border-brand-obsidian hover:bg-[#222233] transition-colors duration-200"
                    >
                      <td className="px-4 py-3 text-sm text-white">
                        {page.pageNumber}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-400">
                        {page.pageType === 'story'
                          ? 'Story'
                          : page.pageType.charAt(0).toUpperCase() +
                            page.pageType.slice(1)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => cycleStatus(page)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium cursor-pointer transition-colors duration-200 ${statusColor} text-white hover:opacity-80`}
                          title="Click to cycle status"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          {ILLUSTRATION_STATUS_LABELS[page.illustrationStatus]}
                        </button>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500 max-w-[200px] truncate">
                        {truncate(page.visualDescription, 60) || (
                          <span className="italic text-gray-600">
                            No description
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}

import { useMemo } from 'react';
import { validateProject } from '../lib/validator';
import { ILLUSTRATION_STATUSES } from '../lib/constants';

function getWordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

export default function StagingBuildMonitor({ project }) {
  const stats = useMemo(() => {
    if (!project) return null;

    const pages = project.pages || [];
    const storyPages = pages.filter((p) => p.pageType === 'story');
    const totalPages = pages.length;
    const completedIllustrations = storyPages.filter(
      (p) => p.illustrationStatus === 'complete'
    ).length;
    const totalWords = pages.reduce(
      (sum, p) => sum + getWordCount(p.textContent),
      0
    );
    const results = validateProject(project);
    const passedChecks = results.filter((r) => r.passed).length;
    const totalChecks = results.length;
    const hasErrors = results.some(
      (r) => r.severity === 'error' && !r.passed
    );

    // Readiness score: weighted across illustrations, formatting, content
    const illustrationScore =
      storyPages.length > 0
        ? (completedIllustrations / storyPages.length) * 40
        : 0;
    const formatScore = (passedChecks / totalChecks) * 35;
    const contentScore = totalPages > 0 ? Math.min(totalWords / 10, 25) : 0;
    const readiness = Math.round(illustrationScore + formatScore + contentScore);

    return {
      totalPages,
      storyPages: storyPages.length,
      completedIllustrations,
      totalWords,
      passedChecks,
      totalChecks,
      hasErrors,
      readiness,
    };
  }, [project]);

  if (!stats) return null;

  const readinessColor =
    stats.readiness >= 80
      ? 'bg-green-500'
      : stats.readiness >= 50
        ? 'bg-brand-gold'
        : 'bg-red-500';

  return (
    <div className="mt-6 bg-brand-charcoal rounded-lg p-5 border border-[#242F3D]">
      <h3 className="text-sm font-semibold text-brand-gold uppercase tracking-wide mb-4">
        📊 Staging Build Monitor
      </h3>

      {/* Readiness score */}
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Project Readiness</span>
          <span>{stats.readiness}%</span>
        </div>
        <div className="w-full h-3 bg-brand-obsidian rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${readinessColor}`}
            style={{ width: `${Math.min(stats.readiness, 100)}%` }}
          />
        </div>
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-brand-obsidian rounded-md p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.totalPages}</div>
          <div className="text-xs text-gray-500">Total Pages</div>
        </div>
        <div className="bg-brand-obsidian rounded-md p-3 text-center">
          <div className="text-lg font-bold text-green-400">
            {stats.completedIllustrations}/{stats.storyPages}
          </div>
          <div className="text-xs text-gray-500">Illustrations</div>
        </div>
        <div className="bg-brand-obsidian rounded-md p-3 text-center">
          <div className="text-lg font-bold text-white">{stats.totalWords}</div>
          <div className="text-xs text-gray-500">Total Words</div>
        </div>
        <div className="bg-brand-obsidian rounded-md p-3 text-center">
          <div
            className={`text-lg font-bold ${
              stats.hasErrors ? 'text-red-400' : 'text-green-400'
            }`}
          >
            {stats.passedChecks}/{stats.totalChecks}
          </div>
          <div className="text-xs text-gray-500">Checks Passed</div>
        </div>
      </div>
    </div>
  );
}

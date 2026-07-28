import { useMemo } from 'react';
import { validateProject } from '../lib/validator';
import StagingBuildMonitor from './StagingBuildMonitor';

const severityOrder = { error: 0, warning: 1, info: 2 };

const severityBadgeColors = {
  error: 'bg-red-500/20 text-red-400 border-red-500/30',
  warning: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  info: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

export default function FormattingValidator({ project }) {
  const results = useMemo(() => {
    if (!project) return [];
    return validateProject(project);
  }, [project]);

  const sorted = useMemo(() => {
    return [...results].sort(
      (a, b) => severityOrder[a.severity] - severityOrder[b.severity]
    );
  }, [results]);

  const errors = results.filter((r) => r.severity === 'error' && !r.passed);
  const warnings = results.filter((r) => r.severity === 'warning' && !r.passed);
  const infos = results.filter((r) => r.severity === 'info' && !r.passed);
  const hasIssues = errors.length + warnings.length + infos.length > 0;

  const summaryParts = [];
  if (errors.length > 0) summaryParts.push(`${errors.length} error${errors.length > 1 ? 's' : ''}`);
  if (warnings.length > 0) summaryParts.push(`${warnings.length} warning${warnings.length > 1 ? 's' : ''}`);
  if (infos.length > 0) summaryParts.push(`${infos.length} info`);

  if (!project) {
    return (
      <main className="flex-1 overflow-y-auto bg-brand-obsidian">
        <div className="max-w-3xl mx-auto px-6 py-6">
          <h2 className="text-xl font-bold text-brand-gold mb-6">
            Formatting Validator
          </h2>
          <div className="bg-brand-charcoal rounded-lg p-8 text-center">
            <p className="text-gray-500">
              Add content in the Editor to see validation results.
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
          Formatting Validator
        </h2>

        {/* Summary bar */}
        <div
          className={`rounded-lg px-4 py-3 mb-4 text-sm font-medium ${
            hasIssues
              ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
              : 'bg-green-500/10 text-green-400 border border-green-500/30'
          }`}
        >
          {hasIssues ? (
            <>
              <span className="mr-1">⚠</span>
              {summaryParts.join(' · ')}
            </>
          ) : (
            <>
              <span className="mr-1">✓</span>
              All checks passed
            </>
          )}
        </div>

        {/* Results list */}
        <div className="space-y-2">
          {sorted.map((result) => (
            <div
              key={result.id}
              className={`flex items-start gap-3 bg-brand-charcoal rounded-lg px-4 py-3 border border-transparent ${
                !result.passed && result.severity === 'error'
                  ? 'border-red-500/20'
                  : ''
              }`}
            >
              {/* Icon */}
              <span className="flex-shrink-0 mt-0.5 text-base">
                {result.passed ? (
                  <span className="text-green-400">✓</span>
                ) : result.severity === 'error' ? (
                  <span className="text-red-400">✗</span>
                ) : (
                  <span className="text-brand-gold">⚠</span>
                )}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 leading-relaxed">
                  {result.message}
                </p>
              </div>

              {/* Severity badge — green "passed" when check passes */}
              {result.passed ? (
                <span className="flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium border bg-green-500/20 text-green-400 border-green-500/30">
                  passed
                </span>
              ) : (
                <span
                  className={`flex-shrink-0 px-2 py-0.5 rounded text-xs font-medium border ${
                    severityBadgeColors[result.severity] ||
                    'bg-gray-500/20 text-gray-400 border-gray-500/30'
                  }`}
                >
                  {result.severity}
                </span>
              )}
            </div>
          ))}
        </div>

        {/* Staging Build Monitor — project readiness dashboard */}
        <StagingBuildMonitor project={project} />
      </div>
    </main>
  );
}

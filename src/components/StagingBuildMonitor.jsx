import { useState, useEffect } from 'react';

export default function StagingBuildMonitor() {
  const [timestamp, setTimestamp] = useState(
    new Date().toLocaleTimeString()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimestamp(new Date().toLocaleTimeString());
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mt-6 bg-brand-charcoal border border-[#242F3D] rounded-lg p-5">
      {/* Header row */}
      <div className="flex justify-between items-center mb-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand-gold-dim">
          SiteLab Live Compilation Engine
        </span>
        <span className="px-2 py-1 rounded text-[0.7rem] font-bold bg-green-500/15 text-green-400">
          ● PIPELINE ACTIVE
        </span>
      </div>

      {/* Log lines */}
      <div className="space-y-0">
        <div className="text-sm text-gray-500 font-mono py-1.5 border-b border-[#1F2833]">
          [info] Shared repository state loaded safely.
        </div>
        <div className="text-sm text-gray-500 font-mono py-1.5 border-b border-[#1F2833]">
          [info] Sync loop target verified at master branch.
        </div>
        <div className="text-sm text-brand-gold-dim font-mono py-1.5">
          [sync] Last layout recompile check processed at: {timestamp}
        </div>
      </div>
    </div>
  );
}

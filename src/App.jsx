import { useState } from 'react';
import { useProject } from './hooks/useProject';
import Sidebar from './components/Sidebar';
import Workspace from './components/Workspace';
import Timeline from './components/Timeline';
import IllustrationChecklist from './components/IllustrationChecklist';
import FormattingValidator from './components/FormattingValidator';
import ProjectSetup from './components/ProjectSetup';
import StoryTemplateWizard from './components/StoryTemplateWizard';
import CharacterManager from './components/CharacterManager';
import InteractiveAudioEngine from './components/InteractiveAudioEngine';
import ParentalSecurityGate from './components/ParentalSecurityGate';

const TABS = [
  { key: 'editor', label: 'Editor' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'templates', label: 'Templates' },
  { key: 'validator', label: 'Validator', gated: true },
  { key: 'audio', label: 'Audio' },
  { key: 'characters', label: 'Characters' },
  { key: 'settings', label: 'Settings', gated: true },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('editor');
  const [gatePassed, setGatePassed] = useState(false);
  const [pendingGatedTab, setPendingGatedTab] = useState(null);

  const {
    project,
    currentPage,
    currentPageId,
    selectPage,
    updateCurrentPage,
    updatePageById,
    addNewPage,
    addPageWithData,
    deletePage,
    updateMetadata,
    toggleBookMilestone,
    toggleOracleMilestone,
    updateOracleTargetCards,
    addCharacter,
    updateCharacter,
    deleteCharacter,
    loading,
  } = useProject();

  if (loading || !project) {
    return (
      <div className="min-h-screen bg-brand-obsidian flex items-center justify-center">
        <p className="text-brand-gold text-lg">Loading Pageboard...</p>
      </div>
    );
  }

  const handleTabClick = (tab) => {
    if (tab.gated && !gatePassed) {
      setPendingGatedTab(tab.key);
    } else {
      setActiveTab(tab.key);
    }
  };

  const handleGatePass = () => {
    setGatePassed(true);
    setActiveTab(pendingGatedTab);
    setPendingGatedTab(null);
  };

  const handleGateCancel = () => {
    setPendingGatedTab(null);
  };

  const renderTabContent = () => {
    // Hard gate check: if viewing a gated tab without passing the challenge, block render
    const activeTabDef = TABS.find((t) => t.key === activeTab);
    if (activeTabDef?.gated && !gatePassed) {
      return (
        <main className="flex-1 flex items-center justify-center bg-brand-obsidian">
          <div className="text-center px-6">
            <div className="text-4xl mb-3">🔒</div>
            <h2 className="text-xl font-semibold text-brand-gold mb-2">
              Admin Area Locked
            </h2>
            <p className="text-gray-500 max-w-md">
              This section requires adult verification. Click the tab again to
              unlock.
            </p>
          </div>
        </main>
      );
    }

    switch (activeTab) {
      case 'editor':
        return (
          <Workspace page={currentPage} onUpdate={updateCurrentPage} />
        );
      case 'checklist':
        return (
          <IllustrationChecklist
            pages={project.pages}
            onUpdatePage={updatePageById}
          />
        );
      case 'templates':
        return (
          <StoryTemplateWizard
            onAddPageWithData={addPageWithData}
            onNavigateToEditor={() => setActiveTab('editor')}
          />
        );
      case 'validator':
        return <FormattingValidator project={project} />;
      case 'audio':
        return <InteractiveAudioEngine />;
      case 'characters':
        return (
          <CharacterManager
            characters={project.characters}
            onAddCharacter={addCharacter}
            onUpdateCharacter={updateCharacter}
            onDeleteCharacter={deleteCharacter}
          />
        );
      case 'settings':
        return (
          <ProjectSetup
            metadata={project.metadata}
            onUpdateMetadata={updateMetadata}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-obsidian">
      {/* Header bar */}
      <header className="flex items-center justify-between px-4 py-2 bg-brand-charcoal border-b border-brand-obsidian flex-shrink-0">
        <h1 className="text-brand-gold font-bold text-sm tracking-wide">Pageboard</h1>
        <span className="text-gray-500 text-xs">by The Nomadic Nymph &amp; Co.</span>
      </header>

      {/* Main 3-column layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar — left column on desktop, top row on mobile */}
        <Sidebar
          pages={project.pages}
          currentPageId={currentPageId}
          onSelectPage={selectPage}
          onAddPage={addNewPage}
          onDeletePage={deletePage}
        />

        {/* Center column: tab bar + content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Tab bar */}
          <div className="flex border-b border-brand-charcoal bg-brand-obsidian px-4 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab)}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-brand-gold border-brand-gold'
                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                }`}
              >
                {tab.label}
                {tab.gated && !gatePassed && (
                  <span className="ml-1 text-xs opacity-50">🔒</span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          {renderTabContent()}
        </div>

        {/* Timeline — right column on desktop, below on mobile */}
        <Timeline
          project={project}
          onToggleBookMilestone={toggleBookMilestone}
          onToggleOracleMilestone={toggleOracleMilestone}
          onUpdateOracleTargetCards={updateOracleTargetCards}
        />
      </div>

      {/* Parental Security Gate — blocks gated tabs until math challenge passed */}
      {pendingGatedTab && (
        <ParentalSecurityGate onGatePass={handleGatePass} />
      )}
    </div>
  );
}

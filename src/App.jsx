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

const TABS = [
  { key: 'editor', label: 'Editor' },
  { key: 'checklist', label: 'Checklist' },
  { key: 'templates', label: 'Templates' },
  { key: 'validator', label: 'Validator' },
  { key: 'audio', label: 'Audio' },
  { key: 'characters', label: 'Characters' },
  { key: 'settings', label: 'Settings' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('editor');

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

  const renderTabContent = () => {
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
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-3 text-sm font-medium transition-colors duration-200 border-b-2 whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-brand-gold border-brand-gold'
                    : 'text-gray-500 hover:text-gray-300 border-transparent'
                }`}
              >
                {tab.label}
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
    </div>
  );
}

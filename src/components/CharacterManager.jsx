import { useState } from 'react';
import { CHARACTER_ROLES } from '../lib/constants';

const inputClasses =
  'w-full p-2.5 bg-brand-obsidian text-white rounded-lg border border-transparent focus:border-brand-gold focus:ring-1 focus:ring-brand-gold outline-none placeholder-gray-600 transition-colors duration-200 text-sm';

const labelClasses = 'block text-xs font-medium text-gray-400 mb-1';

export default function CharacterManager({
  characters,
  onAddCharacter,
  onUpdateCharacter,
  onDeleteCharacter,
}) {
  const [expandedId, setExpandedId] = useState(null);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleFieldChange = (characterId, field, value) => {
    onUpdateCharacter(characterId, { [field]: value });
  };

  return (
    <main className="flex-1 overflow-y-auto bg-brand-obsidian">
      <div className="max-w-3xl mx-auto px-6 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-brand-gold">Characters</h1>
            <p className="text-sm text-gray-500 mt-1">
              Track the personalities that bring your story to life.
            </p>
          </div>
          <button
            onClick={onAddCharacter}
            className="px-4 py-2 text-sm font-medium border border-brand-gold text-brand-gold rounded-lg hover:bg-brand-gold hover:text-brand-obsidian transition-colors duration-200"
          >
            + Add Character
          </button>
        </div>

        {/* Empty state */}
        {characters.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🦊</div>
            <h3 className="text-lg font-medium text-gray-400 mb-2">
              No characters yet.
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Add your first character to enrich your story with memorable
              personalities.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((character) => {
              const isExpanded = expandedId === character.id;
              const name = character.name || 'Unnamed Character';
              const role = character.role || 'Supporting';
              const snippet = character.personality
                ? character.personality.slice(0, 60) +
                  (character.personality.length > 60 ? '…' : '')
                : 'No personality defined';

              return (
                <div
                  key={character.id}
                  className="bg-brand-charcoal rounded-lg border border-transparent hover:border-[#2a2a3a] transition-colors duration-200"
                >
                  {/* Card header — always visible */}
                  <button
                    onClick={() => toggleExpand(character.id)}
                    className="w-full text-left px-5 py-4 flex items-center gap-4 group relative"
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-brand-gold truncate">
                        {name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="inline-block px-2 py-0.5 text-xs rounded-full bg-[#222233] text-gray-400">
                          {role}
                        </span>
                        <span className="text-xs text-gray-500 truncate">
                          {snippet}
                        </span>
                      </div>
                    </div>

                    {/* Expand indicator */}
                    <svg
                      className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>

                    {/* Delete button — visible on hover */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCharacter(character.id);
                      }}
                      className="absolute right-12 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-500 hover:text-red-400 hover:bg-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                      title="Delete character"
                    >
                      ×
                    </button>
                  </button>

                  {/* Expanded edit fields */}
                  {isExpanded && (
                    <div className="px-5 pb-5 space-y-4 border-t border-brand-obsidian pt-4">
                      {/* Name */}
                      <div>
                        <label className={labelClasses}>Name</label>
                        <input
                          type="text"
                          value={character.name}
                          onChange={(e) =>
                            handleFieldChange(character.id, 'name', e.target.value)
                          }
                          placeholder='e.g. "Luna the Fox"'
                          className={inputClasses}
                        />
                      </div>

                      {/* Role */}
                      <div>
                        <label className={labelClasses}>Role</label>
                        <select
                          value={character.role}
                          onChange={(e) =>
                            handleFieldChange(character.id, 'role', e.target.value)
                          }
                          className={inputClasses}
                        >
                          {CHARACTER_ROLES.map((r) => (
                            <option key={r} value={r}>
                              {r}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Personality */}
                      <div>
                        <label className={labelClasses}>Personality</label>
                        <input
                          type="text"
                          value={character.personality}
                          onChange={(e) =>
                            handleFieldChange(
                              character.id,
                              'personality',
                              e.target.value
                            )
                          }
                          placeholder='e.g. "Curious, brave, slightly mischievous"'
                          className={inputClasses}
                        />
                      </div>

                      {/* Visual Description */}
                      <div>
                        <label className={labelClasses}>
                          Visual Description
                        </label>
                        <textarea
                          value={character.visualDescription}
                          onChange={(e) =>
                            handleFieldChange(
                              character.id,
                              'visualDescription',
                              e.target.value
                            )
                          }
                          placeholder='e.g. "Small red fox with oversized ears and a white-tipped tail"'
                          rows={2}
                          className={inputClasses + ' resize-y'}
                        />
                      </div>

                      {/* Voice Notes */}
                      <div>
                        <label className={labelClasses}>Voice Notes</label>
                        <textarea
                          value={character.voiceNotes}
                          onChange={(e) =>
                            handleFieldChange(
                              character.id,
                              'voiceNotes',
                              e.target.value
                            )
                          }
                          placeholder='e.g. "Soft, whispery voice with occasional squeaks"'
                          rows={2}
                          className={inputClasses + ' resize-y'}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}

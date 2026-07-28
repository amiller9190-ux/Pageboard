import { useState, useMemo } from 'react';

/**
 * Predefined character voices — fallback when no project characters exist.
 * Maps to the character metadata system from Phase 2.
 */
const FALLBACK_VOICES = {
  ch1: {
    name: '🧚 Fairy',
    greeting: '"Look at this glowing seed!"',
    reply: '"We must keep it safe."',
  },
  ch2: {
    name: '🦊 Fox',
    greeting: '"I smell magic nearby!"',
    reply: '"Follow me down the trail!"',
  },
  ch3: {
    name: '🦉 Owl',
    greeting: '"Who flies through my night?"',
    reply: '"Wisdom sleeps in the roots."',
  },
  ch4: {
    name: '👾 Sprite',
    greeting: '"Hehe! Catch me if you can!"',
    reply: '"Hide behind the mushrooms!"',
  },
};

/**
 * Counts words in a string. Returns 0 for empty/falsy input.
 */
function getWordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

/**
 * DynamicDialogueScript — child-friendly dialogue interaction scripting.
 *
 * Select two characters and cycle through short dialogue variants
 * that respect per-page word count budgets. Each generated snippet
 * is guaranteed under the WORD_COUNT_THRESHOLDS.MAX_PER_PAGE limit.
 *
 * Props:
 *   characters  — array of character objects from useProject (optional; falls back to FALLBACK_VOICES)
 *   onInsert    — callback(dialogueText) to insert dialogue into the current page
 *   maxWords    — per-snippet word budget (default 30, comfortably under the 50-word page limit)
 */
export default function DynamicDialogueScript({
  characters = null,
  onInsert = null,
  maxWords = 30,
}) {
  const [charA, setCharA] = useState('ch1');
  const [charB, setCharB] = useState('ch2');
  const [variant, setVariant] = useState(0);

  // Use project characters if available, otherwise fall back to predefined voices
  const voices = useMemo(() => {
    if (characters && characters.length >= 2) {
      const map = {};
      characters.forEach((c, i) => {
        const key = c.id || `ch${i + 1}`;
        map[key] = {
          name: `${c.emoji || '📖'} ${c.name || 'Character'}`,
          greeting: c.voiceNotes
            ? `"${c.voiceNotes.split('.')[0].trim()}!"`
            : `"Hello from ${c.name}!"`,
          reply: c.personality
            ? `"${c.personality.split(',')[0].trim()} — that's what I always say!"`
            : `"Let us journey together!"`,
        };
      });
      return map;
    }
    return FALLBACK_VOICES;
  }, [characters]);

  const voiceA = voices[charA] || Object.values(voices)[0];
  const voiceB = voices[charB] || Object.values(voices)[1];

  const lineA =
    variant === 0 ? voiceA.greeting : voiceA.reply;
  const lineB =
    variant === 0 ? voiceB.reply : voiceB.greeting;

  const fullDialogue = `${voiceA.name}: ${lineA}\n${voiceB.name}: ${lineB}`;
  const dialogueWordCount = getWordCount(fullDialogue);
  const withinBudget = dialogueWordCount <= maxWords;

  const cycleVariant = () => {
    setVariant((prev) => (prev + 1) % 2);
  };

  const handleInsert = () => {
    if (onInsert && withinBudget) {
      onInsert(`"${lineA.replace(/^"|"$/g, '')}" — ${voiceA.name}\n"${lineB.replace(/^"|"$/g, '')}" — ${voiceB.name}`);
    }
  };

  return (
    <div className="p-5 bg-brand-charcoal border border-[#242F3D] rounded-lg mt-5">
      {/* Label */}
      <label className="block text-xs font-semibold uppercase tracking-wider text-brand-gold-dim mb-4">
        Child-Friendly Dialogue Interaction Scripting
      </label>

      {/* Character selectors */}
      <div className="flex items-center gap-3 mb-4">
        <select
          value={charA}
          onChange={(e) => setCharA(e.target.value)}
          className="flex-1 p-2.5 bg-[#1F2833] border border-[#242F3D] text-white rounded-md outline-none focus:border-brand-gold transition-colors duration-200"
        >
          {Object.keys(voices).map((key) => (
            <option key={key} value={key}>
              {voices[key].name}
            </option>
          ))}
        </select>
        <span className="text-gray-500 text-sm flex-shrink-0">talks to</span>
        <select
          value={charB}
          onChange={(e) => setCharB(e.target.value)}
          className="flex-1 p-2.5 bg-[#1F2833] border border-[#242F3D] text-white rounded-md outline-none focus:border-brand-gold transition-colors duration-200"
        >
          {Object.keys(voices).map((key) => (
            <option key={key} value={key}>
              {voices[key].name}
            </option>
          ))}
        </select>
      </div>

      {/* Cycle button */}
      <button
        onClick={cycleVariant}
        className="w-full bg-brand-gold text-brand-obsidian py-2.5 px-4 rounded-md font-bold hover:bg-brand-gold-dim transition-colors duration-200"
      >
        🎲 Cycle Interaction Script Line
      </button>

      {/* Dialogue script box */}
      <div className="bg-[#1F2833] border-l-4 border-brand-gold p-4 rounded mt-4">
        <div className="mb-2.5 text-sm leading-relaxed">
          <span className="text-brand-gold font-bold mr-2">
            {voiceA.name}:
          </span>
          <span className="text-gray-200">{lineA}</span>
        </div>
        <div className="text-sm leading-relaxed">
          <span className="text-brand-gold font-bold mr-2">
            {voiceB.name}:
          </span>
          <span className="text-gray-200">{lineB}</span>
        </div>
      </div>

      {/* Word count + insert */}
      <div className="flex items-center justify-between mt-3">
        <span
          className={`text-xs ${
            withinBudget ? 'text-gray-500' : 'text-red-400'
          }`}
        >
          {dialogueWordCount}/{maxWords} words
          {!withinBudget && ' — exceeds budget'}
        </span>
        {onInsert && (
          <button
            onClick={handleInsert}
            disabled={!withinBudget}
            className={`text-xs px-3 py-1.5 rounded font-medium transition-colors duration-200 ${
              withinBudget
                ? 'border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-brand-obsidian'
                : 'border border-gray-600 text-gray-600 cursor-not-allowed'
            }`}
          >
            Insert into page
          </button>
        )}
      </div>
    </div>
  );
}

/**
 * Illustration status enum values in cycle order.
 */
export const ILLUSTRATION_STATUSES = [
  'not-started',
  'sketching',
  'finalizing',
  'complete',
];

/**
 * Human-readable labels for illustration statuses.
 */
export const ILLUSTRATION_STATUS_LABELS = {
  'not-started': 'Not Started',
  'sketching': 'Sketching',
  'finalizing': 'Finalizing',
  'complete': 'Complete',
};

/**
 * Colors for illustration status dot indicators (Tailwind classes).
 */
export const ILLUSTRATION_STATUS_COLORS = {
  'not-started': 'bg-gray-500',
  'sketching': 'bg-blue-500',
  'finalizing': 'bg-orange-500',
  'complete': 'bg-green-500',
};

/**
 * Valid trim sizes for KDP/IngramSpark.
 */
export const VALID_TRIM_SIZES = [
  '5x8',
  '5.5x8.5',
  '6x9',
  '7x10',
  '8x10',
  '8.5x8.5',
  '8.5x11',
  '8.27x11.69',
];

/**
 * Page type options.
 */
export const PAGE_TYPES = ['story', 'frontmatter', 'dedication', 'backmatter'];

/**
 * Page type display labels.
 */
export const PAGE_TYPE_LABELS = {
  story: 'Story Page',
  frontmatter: 'Front Matter',
  dedication: 'Dedication',
  backmatter: 'Back Matter',
};

/**
 * Word count thresholds for validation.
 */
export const WORD_COUNT_THRESHOLDS = {
  MAX_TOTAL: 1000,
  MAX_PER_PAGE: 50,
};

/**
 * Standard children's book page counts.
 */
export const STANDARD_PAGE_COUNTS = [24, 32, 40];

/**
 * Character role options.
 */
export const CHARACTER_ROLES = [
  'Protagonist',
  'Antagonist',
  'Sidekick',
  'Supporting',
  'Narrator',
  'Other',
];

/**
 * Default project metadata.
 */
export const DEFAULT_METADATA = {
  title: '',
  author: '',
  trimSize: '8.5x8.5',
  hasBleed: false,
  bleedWidthInches: 0.125,
  targetWordCount: 500,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  milestones: {
    book: {
      manuscriptDraft: false,
      storyboardPlanned: false,
      illustrationsSketched: false,
      illustrationsFinalized: false,
      readyForUpload: false,
    },
    oracleDeck: {
      cardConceptsDefined: false,
      preliminarySketchesDone: false,
      cardDescriptionsWritten: false,
      finalArtworkComplete: false,
      guidebookDrafted: false,
      readyForPrint: false,
    },
  },
  oracleTargetCards: 44,
};

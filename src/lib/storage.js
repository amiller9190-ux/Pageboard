import { generateId } from '../utils/id';
import { DEFAULT_METADATA } from './constants';

const STORAGE_KEY = 'pagecraft_project';

/**
 * Creates a default page object.
 * @param {number} pageNumber
 * @returns {object}
 */
function createDefaultPage(pageNumber) {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    pageNumber,
    pageType: 'story',
    textContent: '',
    visualDescription: '',
    illustrationStatus: 'not-started',
    notes: '',
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * Returns a fresh blank project with no starter pages.
 * @returns {object}
 */
function createDefaultProject() {
  const now = new Date().toISOString();
  const metadata = {
    ...DEFAULT_METADATA,
    createdAt: now,
    updatedAt: now,
    milestones: {
      book: { ...DEFAULT_METADATA.milestones.book },
      oracleDeck: { ...DEFAULT_METADATA.milestones.oracleDeck },
    },
  };
  const pages = [];
  return { metadata, pages };
}

/**
 * Reads and parses the project from localStorage.
 * Returns a default project if nothing exists.
 * @returns {object}
 */
export function getProject() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultProject();
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.metadata || !Array.isArray(parsed.pages)) {
      return createDefaultProject();
    }
    // Ensure milestones exist (migration for pre-milestone data)
    if (!parsed.metadata.milestones) {
      parsed.metadata.milestones = {
        book: { ...DEFAULT_METADATA.milestones.book },
        oracleDeck: { ...DEFAULT_METADATA.milestones.oracleDeck },
      };
    }
    if (parsed.metadata.oracleTargetCards == null) {
      parsed.metadata.oracleTargetCards = DEFAULT_METADATA.oracleTargetCards;
    }
    return parsed;
  } catch {
    return createDefaultProject();
  }
}

/**
 * Serializes and writes the project to localStorage.
 * Updates metadata.updatedAt automatically.
 * @param {object} project
 */
export function saveProject(project) {
  project.metadata.updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

/**
 * Appends a new page to the project and returns the updated project.
 * @param {object} project
 * @returns {object}
 */
export function addPage(project) {
  const pageNumber = project.pages.length + 1;
  const newPage = createDefaultPage(pageNumber);
  return {
    ...project,
    pages: [...project.pages, newPage],
  };
}

/**
 * Updates a specific page by id. Returns a new project object.
 * @param {object} project
 * @param {string} pageId
 * @param {object} updates
 * @returns {object}
 */
export function updatePage(project, pageId, updates) {
  return {
    ...project,
    pages: project.pages.map((p) =>
      p.id === pageId
        ? { ...p, ...updates, updatedAt: new Date().toISOString() }
        : p
    ),
  };
}

/**
 * Deletes a page by id. Returns a new project object with renumbered pages.
 * @param {object} project
 * @param {string} pageId
 * @returns {object}
 */
export function deletePage(project, pageId) {
  const filtered = project.pages.filter((p) => p.id !== pageId);
  const renumbered = filtered.map((p, i) => ({ ...p, pageNumber: i + 1 }));
  return { ...project, pages: renumbered };
}

/**
 * Reorders pages given a new array of page IDs.
 * Returns a new project object with renumbered pages.
 * @param {object} project
 * @param {string[]} newOrder - array of page IDs in desired order
 * @returns {object}
 */
export function reorderPages(project, newOrder) {
  const pageMap = new Map(project.pages.map((p) => [p.id, p]));
  const reordered = newOrder
    .map((id) => pageMap.get(id))
    .filter(Boolean)
    .map((p, i) => ({ ...p, pageNumber: i + 1, updatedAt: new Date().toISOString() }));
  return { ...project, pages: reordered };
}

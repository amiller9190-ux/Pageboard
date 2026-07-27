import { useState, useCallback, useEffect } from 'react';
import {
  getProject,
  saveProject,
  addPage as storageAddPage,
  updatePage as storageUpdatePage,
  deletePage as storageDeletePage,
} from '../lib/storage';

/**
 * Single source of truth for project state.
 * Hydrates from localStorage on mount, writes through on every mutation.
 */
export function useProject() {
  const [project, setProject] = useState(null);
  const [currentPageId, setCurrentPageId] = useState(null);

  // Hydrate on mount
  useEffect(() => {
    const loaded = getProject();
    setProject(loaded);
    if (loaded.pages.length > 0) {
      setCurrentPageId(loaded.pages[0].id);
    }
  }, []);

  // Persist on every project change
  const updateProject = useCallback((newProjectOrUpdater) => {
    setProject((prev) => {
      const next =
        typeof newProjectOrUpdater === 'function'
          ? newProjectOrUpdater(prev)
          : newProjectOrUpdater;
      if (next) saveProject(next);
      return next;
    });
  }, []);

  /**
   * Update the currently selected page.
   */
  const updateCurrentPage = useCallback(
    (updates) => {
      if (!currentPageId) return;
      updateProject((prev) => storageUpdatePage(prev, currentPageId, updates));
    },
    [currentPageId, updateProject]
  );

  /**
   * Add a new page, auto-select it.
   */
  const addNewPage = useCallback(() => {
    updateProject((prev) => {
      const next = storageAddPage(prev);
      const newPage = next.pages[next.pages.length - 1];
      // Schedule the currentPageId update after the state update
      setTimeout(() => setCurrentPageId(newPage.id), 0);
      return next;
    });
  }, [updateProject]);

  /**
   * Select a page by id.
   */
  const selectPage = useCallback((pageId) => {
    setCurrentPageId(pageId);
  }, []);

  /**
   * Delete a page and re-select appropriately.
   */
  const deletePageAndSelect = useCallback(
    (pageId) => {
      updateProject((prev) => {
        const next = storageDeletePage(prev, pageId);
        // If we deleted the current page, select the nearest one
        if (currentPageId === pageId && next.pages.length > 0) {
          const deletedIndex = prev.pages.findIndex((p) => p.id === pageId);
          const newIndex = Math.min(deletedIndex, next.pages.length - 1);
          setTimeout(() => setCurrentPageId(next.pages[newIndex].id), 0);
        } else if (next.pages.length === 0) {
          setTimeout(() => setCurrentPageId(null), 0);
        }
        return next;
      });
    },
    [currentPageId, updateProject]
  );

  /**
   * Update project metadata.
   */
  const updateMetadata = useCallback(
    (updates) => {
      updateProject((prev) => ({
        ...prev,
        metadata: { ...prev.metadata, ...updates },
      }));
    },
    [updateProject]
  );

  /**
   * Update any page by id (not just the currently selected one).
   */
  const updatePageById = useCallback(
    (pageId, updates) => {
      updateProject((prev) => storageUpdatePage(prev, pageId, updates));
    },
    [updateProject]
  );

  /**
   * Update a milestone in the book or oracleDeck track.
   */
  const toggleBookMilestone = useCallback(
    (key) => {
      updateProject((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          milestones: {
            ...prev.metadata.milestones,
            book: {
              ...prev.metadata.milestones.book,
              [key]: !prev.metadata.milestones.book[key],
            },
          },
        },
      }));
    },
    [updateProject]
  );

  const toggleOracleMilestone = useCallback(
    (key) => {
      updateProject((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          milestones: {
            ...prev.metadata.milestones,
            oracleDeck: {
              ...prev.metadata.milestones.oracleDeck,
              [key]: !prev.metadata.milestones.oracleDeck[key],
            },
          },
        },
      }));
    },
    [updateProject]
  );

  const updateOracleTargetCards = useCallback(
    (value) => {
      updateProject((prev) => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          oracleTargetCards: value,
        },
      }));
    },
    [updateProject]
  );

  // Derived: current page object
  const currentPage = project
    ? project.pages.find((p) => p.id === currentPageId) || null
    : null;

  if (!project) {
    return { project: null, currentPage: null, loading: true };
  }

  return {
    project,
    currentPage,
    currentPageId,
    setCurrentPageId: selectPage,
    updateCurrentPage,
    updatePageById,
    addNewPage,
    selectPage,
    deletePage: deletePageAndSelect,
    updateMetadata,
    toggleBookMilestone,
    toggleOracleMilestone,
    updateOracleTargetCards,
    loading: false,
  };
}

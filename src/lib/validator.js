import {
  VALID_TRIM_SIZES,
  STANDARD_PAGE_COUNTS,
  WORD_COUNT_THRESHOLDS,
} from './constants';

/**
 * Counts words in a string. Same logic as Workspace.jsx.
 * Returns 0 for empty/falsy input.
 * @param {string} text
 * @returns {number}
 */
export function getWordCount(text) {
  if (!text || !text.trim()) return 0;
  return text.trim().split(/\s+/).length;
}

let _nextCheckId = 1;
function checkId() {
  return `check-${_nextCheckId++}`;
}

/**
 * Validates a PageCraft project against KDP/IngramSpark formatting rules.
 * Returns an array of check result objects.
 *
 * @param {object} project
 * @returns {Array<{id: string, category: string, severity: string, message: string, passed: boolean}>}
 */
export function validateProject(project) {
  // Reset id counter for deterministic IDs
  _nextCheckId = 1;

  const results = [];
  const { metadata, pages } = project;

  // --- 1. Trim size validity ---
  const trimValid = VALID_TRIM_SIZES.includes(metadata.trimSize);
  results.push({
    id: checkId(),
    category: 'format',
    severity: 'error',
    message: trimValid
      ? `Trim size "${metadata.trimSize}" is valid for KDP & IngramSpark.`
      : `Trim size "${metadata.trimSize}" is invalid. Must be one of: ${VALID_TRIM_SIZES.join(', ')}.`,
    passed: trimValid,
  });

  // --- 2. Bleed recommendation ---
  const needsBleed = pages.length > 40 && !metadata.hasBleed;
  results.push({
    id: checkId(),
    category: 'format',
    severity: 'warning',
    message: needsBleed
      ? `Your book has ${pages.length} pages (over 40). Consider enabling bleed (0.125") to avoid printing issues.`
      : pages.length > 40
        ? 'Bleed is enabled — good for a book with over 40 pages.'
        : 'Bleed is not required for books under 40 pages.',
    passed: !needsBleed,
  });

  // --- 3. Total word count ---
  const totalWords = pages.reduce(
    (sum, p) => sum + getWordCount(p.textContent),
    0
  );
  const totalExceeded = totalWords > WORD_COUNT_THRESHOLDS.MAX_TOTAL;
  results.push({
    id: checkId(),
    category: 'content',
    severity: 'info',
    message: totalExceeded
      ? `Total word count is ${totalWords} words, exceeding the ${WORD_COUNT_THRESHOLDS.MAX_TOTAL}-word recommendation for standard picture books.`
      : `Total word count is ${totalWords} words (within the ${WORD_COUNT_THRESHOLDS.MAX_TOTAL}-word recommendation).`,
    passed: !totalExceeded,
  });

  // --- 4. Per-page word count ---
  const densePages = pages
    .map((p) => ({ id: p.id, pageNumber: p.pageNumber, words: getWordCount(p.textContent) }))
    .filter((p) => p.words > WORD_COUNT_THRESHOLDS.MAX_PER_PAGE);

  if (densePages.length > 0) {
    const pageList = densePages
      .map((p) => `Page ${p.pageNumber} (${p.words} words)`)
      .join(', ');
    results.push({
      id: checkId(),
      category: 'content',
      severity: 'info',
      message: `${densePages.length} page(s) exceed ${WORD_COUNT_THRESHOLDS.MAX_PER_PAGE} words: ${pageList}. Consider trimming for readability.`,
      passed: false,
    });
  } else {
    results.push({
      id: checkId(),
      category: 'content',
      severity: 'info',
      message: `All pages are under ${WORD_COUNT_THRESHOLDS.MAX_PER_PAGE} words — good pacing.`,
      passed: true,
    });
  }

  // --- 5. Illustration completeness ---
  const storyPages = pages.filter((p) => p.pageType === 'story');
  const incompleteIllustrations = storyPages.filter(
    (p) => p.illustrationStatus !== 'complete'
  );

  if (incompleteIllustrations.length > 0) {
    const pageList = incompleteIllustrations
      .map((p) => `Page ${p.pageNumber}`)
      .join(', ');
    results.push({
      id: checkId(),
      category: 'illustration',
      severity: 'info',
      message: `${incompleteIllustrations.length} story page(s) have incomplete illustrations: ${pageList}.`,
      passed: false,
    });
  } else {
    results.push({
      id: checkId(),
      category: 'illustration',
      severity: 'info',
      message: storyPages.length > 0
        ? `All ${storyPages.length} story pages have complete illustrations.`
        : 'No story pages to check.',
      passed: true,
    });
  }

  // --- 6. Page count range ---
  const pageCount = pages.length;
  const standardCount = STANDARD_PAGE_COUNTS.includes(pageCount);
  results.push({
    id: checkId(),
    category: 'structure',
    severity: 'warning',
    message: standardCount
      ? `Page count is ${pageCount} — a standard children's book page count.`
      : `Page count is ${pageCount}. Standard children's book page counts are ${STANDARD_PAGE_COUNTS.join(', ')}. Non-standard counts may affect printing costs.`,
    passed: standardCount,
  });

  // --- 7. Empty pages ---
  const emptyPages = pages.filter(
    (p) => !p.textContent.trim() && !p.visualDescription.trim()
  );

  if (emptyPages.length > 0) {
    const pageList = emptyPages.map((p) => `Page ${p.pageNumber}`).join(', ');
    results.push({
      id: checkId(),
      category: 'content',
      severity: 'warning',
      message: `${emptyPages.length} page(s) have no content: ${pageList}. Add text or visual descriptions to avoid blank pages.`,
      passed: false,
    });
  } else {
    results.push({
      id: checkId(),
      category: 'content',
      severity: 'warning',
      message: 'No completely empty pages — all pages have either text or visual descriptions.',
      passed: true,
    });
  }

  return results;
}

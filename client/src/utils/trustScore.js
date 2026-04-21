// Badge thresholds: solvedCount required to earn each badge
const BADGE_THRESHOLDS = [
  { id: 'first-helper', label: 'First Helper', threshold: 1 },
  { id: 'rising-star', label: 'Rising Star', threshold: 10 },
  { id: 'community-champion', label: 'Community Champion', threshold: 50 },
  { id: 'legend', label: 'Legend', threshold: 100 },
];

/**
 * Returns the list of badge ids earned based on solvedCount.
 * @param {number} solvedCount
 * @returns {string[]}
 */
export function getEarnedBadges(solvedCount) {
  return BADGE_THRESHOLDS
    .filter(b => solvedCount >= b.threshold)
    .map(b => b.id);
}

/**
 * Returns the next badge the user is working toward, or null if all earned.
 * @param {number} solvedCount
 * @returns {{ id: string, label: string, threshold: number } | null}
 */
export function getNextBadge(solvedCount) {
  return BADGE_THRESHOLDS.find(b => solvedCount < b.threshold) || null;
}

/**
 * Formats a trust score for display (e.g. 1234 → "1,234").
 * @param {number} score
 * @returns {string}
 */
export function formatTrustScore(score) {
  if (typeof score !== 'number' || isNaN(score)) return '0';
  return Math.max(0, Math.floor(score)).toLocaleString();
}

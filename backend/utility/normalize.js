/**
 * normalize.js — Centralized normalization utilities
 */

/**
 * Normalize an email address (lowercase + trimmed).
 * @param {string} email
 * @returns {string}
 */
export function normalizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  return email.trim().toLowerCase();
}

/**
 * Normalize a slug string (lowercase, trimmed, URL-safe alphanumeric + hyphens).
 * @param {string} slug
 * @returns {string}
 */
export function normalizeSlug(slug) {
  if (!slug || typeof slug !== 'string') return '';
  return slug
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Normalize a human name or general text string (trimmed, collapsed whitespace).
 * @param {string} name
 * @returns {string}
 */
export function normalizeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name.trim().replace(/\s+/g, ' ');
}

export default {
  normalizeEmail,
  normalizeSlug,
  normalizeName,
};

import { toCamelCase } from './aem.js';

/**
 * Fetches placeholders object.
 * @param {string} [prefix] Location of placeholders, defaults to the root
 * @returns {Promise<Object>} A promise that resolves to the placeholders object
 */
export default async function fetchPlaceholders(prefix = 'default') {
  window.placeholders = window.placeholders || {};
  if (!window.placeholders[prefix]) {
    window.placeholders[prefix] = new Promise((resolve) => {
      fetch(`${prefix === 'default' ? '' : prefix}/placeholders.json`)
        .then((resp) => {
          if (!resp.ok) throw new Error(`${resp.status}: ${resp.statusText}`);
          return resp.json();
        })
        .then((json) => {
          const placeholders = {};
          (json.data || []).forEach((placeholder) => {
            placeholders[toCamelCase(placeholder.Key)] = placeholder.Text;
          });
          resolve(placeholders);
        })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(`placeholders file not found: ${prefix}/placeholders.json`, error);
          resolve({});
        });
    });
  }
  return window.placeholders[prefix];
}

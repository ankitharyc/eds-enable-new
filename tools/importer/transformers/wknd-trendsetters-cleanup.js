/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: wknd-trendsetters site-wide cleanup.
 * All selectors verified against migration-work/cleaned.html.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Non-authorable chrome nested inside authorable block regions must be
    // removed before block parsing so parsers don't extract it.
    // Found in cleaned.html: breadcrumbs inside the article-header (columns) section.
    WebImporter.DOMUtils.remove(element, [
      '.breadcrumbs', // <div class="breadcrumbs"> inside #main-content section 1
    ]);
  }

  if (hookName === H.after) {
    // Site shell / global chrome — not authored per-page.
    // Found in cleaned.html: skip link, top navbar, site footer.
    WebImporter.DOMUtils.remove(element, [
      'a.skip-link', // <a href="#main-content" class="skip-link">
      '.navbar', // <div class="navbar"> top navigation with mega-menu
      'footer.footer', // <footer class="footer inverse-footer">
    ]);
  }
}

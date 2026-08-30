/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: article-list
 * Base block: article-list (custom — no library convention; inferred from source)
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Source structure: a grid (.grid-layout.desktop-4-column) of article cards,
 * each an <a class="article-card card-link"> containing an image and a body
 * (tag, date, heading). Inferred table: 1 column, one card per row.
 */
export default function parse(element, { document }) {
  // Each card is a direct-child anchor (fallback to any article-card).
  let cards = Array.from(element.querySelectorAll(':scope > a.article-card, :scope > a.card-link'));
  if (cards.length === 0) {
    cards = Array.from(element.querySelectorAll('a.article-card, .article-card'));
  }

  // Empty-block guard
  if (cards.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // 1 column: one card per row.
  cards.forEach((card) => {
    cells.push([card]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'article-list', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: columns
 * Base block: columns
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Library convention: multi-column. Column count derived from the natural
 * grouping of content in the source. Here the grid has 2 direct-child columns:
 *   Column 1: article cover image
 *   Column 2: breadcrumbs, heading, author + date/read-time meta
 */
export default function parse(element, { document }) {
  // The block element is the .grid-layout; its direct children are the columns.
  let columns = Array.from(element.querySelectorAll(':scope > div'));

  // Fallback: if no direct-child divs, treat the element itself as one column.
  if (columns.length === 0) {
    columns = [element];
  }

  // Empty-block guard
  if (columns.length === 0 || columns.every((c) => !c.textContent.trim() && !c.querySelector('img'))) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single content row: one cell per column
  cells.push(columns);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}

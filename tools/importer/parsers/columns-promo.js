/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-promo. Base block: columns.
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport
 * Generated: 2026-08-30
 *
 * EDS columns convention: multiple columns, rows after the header have equal
 * column counts, each cell rendered as a responsive column.
 *
 * This promo is a single row of two columns (natural grouping in the source
 * .grid-layout, which has two direct child divs):
 *   Column 1: rounded cover image.
 *   Column 2: heading + lead paragraph + CTA button.
 */
export default function parse(element, { document }) {
  const grid = element.querySelector('.grid-layout') || element;

  const image = grid.querySelector('img');
  const heading = grid.querySelector('h1, h2, h3, [class*="heading"]');
  const lead = grid.querySelector('p');
  const ctas = Array.from(grid.querySelectorAll('.button-group a[href], a.button'));

  // Build the text column content.
  const textCol = [];
  if (heading) textCol.push(heading);
  if (lead) textCol.push(lead);
  ctas.forEach((cta) => textCol.push(cta));

  // Empty-block guard: no meaningful content.
  if (!image && !heading && !lead) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single row, two columns: media | text. Pad if one side is missing.
  cells.push([image || '', textCol.length ? textCol : '']);

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns-promo', cells });
  element.replaceWith(block);
}

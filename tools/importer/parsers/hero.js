/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: hero
 * Base block: hero
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Library convention: 1 column, 3 rows.
 *   Row 1: block name
 *   Row 2: background/hero image(s) (optional)
 *   Row 3: title (heading), subheading, call-to-action(s)
 */
export default function parse(element, { document }) {
  // INPUT EXTRACTION (validated against source.html)
  // Heading — source uses <h1 class="h1-heading">
  const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  // Subheading — source uses <p class="subheading">
  const subheading = element.querySelector('.subheading, p');
  // CTAs — source uses <div class="button-group"><a class="button">
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));
  // Images — source has a column of <img class="cover-image"> assets
  const images = Array.from(element.querySelectorAll('img'));

  // Empty-block guard
  if (!heading && !subheading && images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 (optional): image(s)
  if (images.length > 0) {
    cells.push([images]);
  }

  // Row 3: text content in a single cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: banner
 * Base block: banner (custom — no library convention; inferred from source)
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Source structure: an .inverse-section with a background image
 * (<img class="cover-image utility-overlay">) overlaid by a .card-body holding
 * a heading, subheading, and a CTA button.
 * Inferred table (1 column):
 *   Row 1: block name
 *   Row 2: background image (optional)
 *   Row 3: heading, subheading, call-to-action(s)
 */
export default function parse(element, { document }) {
  // Background image
  const bgImage = element.querySelector('img.utility-overlay, img.cover-image, img');
  // Heading
  const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
  // Subheading
  const subheading = element.querySelector('.subheading, .card-body p, p');
  // CTA(s)
  const ctaLinks = Array.from(element.querySelectorAll('.button-group a, a.button'));

  // Empty-block guard
  if (!heading && !subheading && !bgImage) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];

  // Row 2 (optional): background image
  if (bgImage) {
    cells.push([bgImage]);
  }

  // Row 3: text content in a single cell
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (subheading) contentCell.push(subheading);
  contentCell.push(...ctaLinks);
  cells.push([contentCell]);

  const block = WebImporter.Blocks.createBlock(document, { name: 'banner', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: photo-gallery
 * Base block: photo-gallery (custom — no library convention; inferred from source)
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Source structure: a grid (.grid-layout.desktop-4-column) of image tiles, each
 * a <div class="utility-aspect-1x1"><img class="cover-image"></div>.
 * Inferred table: 1 row containing all gallery images, each image in its own cell.
 */
export default function parse(element, { document }) {
  // Each tile is a direct-child div holding one image.
  const tiles = Array.from(element.querySelectorAll(':scope > div'));
  // Extract the image from each tile (fallback to any img).
  let images = tiles
    .map((tile) => tile.querySelector('img'))
    .filter((img) => img);
  if (images.length === 0) {
    images = Array.from(element.querySelectorAll('img'));
  }

  // Empty-block guard
  if (images.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  // Single row: one image per cell.
  cells.push(images.map((img) => [img]));

  const block = WebImporter.Blocks.createBlock(document, { name: 'photo-gallery', cells });
  element.replaceWith(block);
}

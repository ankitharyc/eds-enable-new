/* eslint-disable */
/* global WebImporter */
/**
 * Parser for the boilerplate "cards" block.
 *
 * EDS cards convention: table has 2 columns, multiple rows; each row is one card:
 *   Cell 1 (mandatory): image
 *   Cell 2 (mandatory): text content — heading (optional), description (optional),
 *                        CTA link (optional)
 *
 * Source (wknd trends pages): a .grid-layout whose direct children are <div>
 *   cards, each with an img (.cover-image) + heading + paragraph(s) + optional link.
 */
export default function parse(element, { document }) {
  // Each card is a direct div child of the grid that contains an image.
  let cards = [...element.children].filter((c) => c.tagName === 'DIV' && c.querySelector('img'));
  if (!cards.length) {
    cards = [...element.querySelectorAll(':scope > div')].filter((c) => c.querySelector('img'));
  }

  const cells = [];
  cards.forEach((card) => {
    const img = card.querySelector('img');
    const heading = card.querySelector('h1, h2, h3, h4, [class*="heading"]');
    const paras = [...card.querySelectorAll('p')];
    const link = card.querySelector('a[href]');

    // Cell 2: heading + description + optional CTA, in a single container.
    const body = document.createElement('div');
    if (heading) body.append(heading);
    paras.forEach((p) => body.append(p));
    if (link) body.append(link);

    if (!img && !body.childNodes.length) return;

    cells.push([img || '', body]);
  });

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}

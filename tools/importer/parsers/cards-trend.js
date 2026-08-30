/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-trend. Base block: cards.
 * Source: https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport
 * Generated: 2026-08-30
 *
 * EDS cards convention: 2 columns, one card per row.
 *   Cell 1: image (mandatory).
 *   Cell 2: text content (title heading, description, optional CTA link).
 *
 * Source: each card is an <a class="trend-card card-link"> wrapping
 *   .trend-card-image img and .trend-card-body (span.tag + h3 + p).
 * The category tag pill is emitted as a leading paragraph so the block
 * decorator can convert it to the tag span. The card href is preserved by
 * wrapping the title in an anchor.
 */
export default function parse(element, { document }) {
  // Each trend card is an anchor in the source grid.
  let cards = Array.from(element.querySelectorAll('a.trend-card, a.card-link'));
  // Fallback: any anchor that contains an image.
  if (!cards.length) {
    cards = Array.from(element.querySelectorAll('a[href]')).filter((a) => a.querySelector('img'));
  }

  const cells = [];

  cards.forEach((card) => {
    const href = card.getAttribute('href');
    const img = card.querySelector('.trend-card-image img, img');
    const tag = card.querySelector('.tag, span[class*="tag"]');
    const heading = card.querySelector('h1, h2, h3, h4, [class*="heading"]');
    const description = card.querySelector('.trend-card-body p, p');

    const bodyContent = [];

    // Category tag pill -> paragraph (block decorator converts to tag span).
    if (tag && tag.textContent.trim()) {
      const tagP = document.createElement('p');
      tagP.textContent = tag.textContent.trim();
      bodyContent.push(tagP);
    }

    // Wrap the heading in the card link so the whole card is clickable.
    if (heading) {
      if (href) {
        const link = document.createElement('a');
        link.href = href;
        link.append(heading);
        bodyContent.push(link);
      } else {
        bodyContent.push(heading);
      }
    } else if (href) {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = href;
      bodyContent.push(link);
    }

    if (description) bodyContent.push(description);

    // Skip cards with no usable content.
    if (!img && !bodyContent.length) return;

    cells.push([img || '', bodyContent.length ? bodyContent : '']);
  });

  // Empty-block guard: nothing extracted, unwrap in place.
  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-trend', cells });
  element.replaceWith(block);
}

/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: accordion-faq
 * Base block: accordion
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Library convention: 2 columns, multiple rows.
 *   Row 1: block name
 *   Each subsequent row = one accordion item: [ Title | Content ]
 *
 * Source structure: a .faq-list of <details class="faq-item"> items. Each has a
 * <summary class="faq-question"> (a <span> with the question + a decorative SVG
 * icon) and a <div class="faq-answer"> with the answer paragraph.
 */
export default function parse(element, { document }) {
  const items = Array.from(element.querySelectorAll('.faq-item, details'));

  // Empty-block guard
  if (items.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  items.forEach((item) => {
    // Title: the question text (prefer the span, excluding the decorative icon).
    const questionSpan = item.querySelector('.faq-question span, summary span');
    const summary = item.querySelector('.faq-question, summary');
    const titleCell = questionSpan || summary || '';

    // Content: the answer body.
    const answer = item.querySelector('.faq-answer');
    const contentCell = answer || '';

    cells.push([titleCell, contentCell]);
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'accordion-faq', cells });
  element.replaceWith(block);
}

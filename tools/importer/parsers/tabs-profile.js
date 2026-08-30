/* eslint-disable */
/* global WebImporter */
/**
 * Parser for variant: tabs-profile
 * Base block: tabs
 * Source: https://wknd-trendsetters.site/about-us
 * Generated: 2026-08-30
 *
 * Library convention: 2 columns, multiple rows.
 *   Row 1: block name
 *   Each subsequent row = one tab: [ Tab Label | Tab Content ]
 *
 * Source structure: a .tabs-wrapper containing a .tabs-content (with .tab-pane
 * content panels) and a .tab-menu (with .tab-menu-link buttons carrying the
 * label: avatar + name + role). We pair each menu label with its content pane.
 */
export default function parse(element, { document }) {
  const panes = Array.from(element.querySelectorAll('.tabs-content .tab-pane, .tab-pane'));
  const menuButtons = Array.from(element.querySelectorAll('.tab-menu .tab-menu-link, .tab-menu-link'));

  // Empty-block guard
  if (panes.length === 0 && menuButtons.length === 0) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  const rowCount = Math.max(panes.length, menuButtons.length);

  for (let i = 0; i < rowCount; i += 1) {
    // Label: prefer the menu button's text label (name + role). The button
    // wraps an avatar image and the name/role text — use its inner content.
    let labelCell = '';
    if (menuButtons[i]) {
      // Use the text container (skip the avatar image) for a clean tab label.
      const labelText = menuButtons[i].querySelector(':scope > div > div:last-child, :scope > div:last-child');
      labelCell = labelText || menuButtons[i];
    }

    // Content: the matching content pane.
    const contentCell = panes[i] || '';

    cells.push([labelCell, contentCell]);
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs-profile', cells });
  element.replaceWith(block);
}

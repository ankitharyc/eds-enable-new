// eslint-disable-next-line import/no-unresolved
import { toClassName } from '../../scripts/aem.js';

/**
 * Splits a cell's paragraphs into a media element (the one containing the
 * image) and a body wrapper holding the remaining text paragraphs.
 * @param {Element} cell element whose direct children are <p> nodes
 * @param {string} prefix class prefix, e.g. "tabs-profile-tab"
 */
function splitMediaAndBody(cell, prefix) {
  const parts = [...cell.children];
  const media = parts.find((p) => p.querySelector('picture, img'));
  if (media) media.classList.add(`${prefix}-media`);
  const body = document.createElement('div');
  body.className = `${prefix}-body`;
  parts.forEach((p) => {
    if (p !== media) body.append(p);
  });
  cell.append(body);
}

export default async function decorate(block) {
  // build tablist
  const tablist = document.createElement('div');
  tablist.className = 'tabs-profile-list';
  tablist.setAttribute('role', 'tablist');

  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const tabCell = cells[0]; // avatar + name + role
    const paneCell = cells[1]; // photo + name + role + quote
    const id = toClassName(tabCell.textContent);

    // decorate the content pane (repurpose the row)
    const tabpanel = row;
    tabpanel.className = 'tabs-profile-panel';
    tabpanel.id = `tabpanel-${id}`;
    tabpanel.setAttribute('aria-hidden', !!i);
    tabpanel.setAttribute('aria-labelledby', `tab-${id}`);
    tabpanel.setAttribute('role', 'tabpanel');

    // build tab button from the first cell
    const button = document.createElement('button');
    button.className = 'tabs-profile-tab';
    button.id = `tab-${id}`;
    button.innerHTML = tabCell.innerHTML;
    splitMediaAndBody(button, 'tabs-profile-tab');
    button.setAttribute('aria-controls', `tabpanel-${id}`);
    button.setAttribute('aria-selected', !i);
    button.setAttribute('role', 'tab');
    button.setAttribute('type', 'button');
    button.addEventListener('click', () => {
      block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
        panel.setAttribute('aria-hidden', true);
      });
      tablist.querySelectorAll('button').forEach((btn) => {
        btn.setAttribute('aria-selected', false);
      });
      tabpanel.setAttribute('aria-hidden', false);
      button.setAttribute('aria-selected', true);
    });
    tablist.append(button);

    // remove the tab cell; unwrap the pane cell into the panel, then split
    tabCell.remove();
    while (paneCell.firstChild) tabpanel.append(paneCell.firstChild);
    paneCell.remove();
    splitMediaAndBody(tabpanel, 'tabs-profile-panel');
  });

  // source shows the active content pane ABOVE the tab menu
  block.append(tablist);
}

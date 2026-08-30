import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the cards-trend block.
 *
 * Variant of `cards` for the trend-alert grid: each card is a link containing
 * a rounded cover image, a category tag pill, an uppercase title and a short
 * description. Authored content model (one card per row):
 *   Row: [ image ] [ tag text, heading, description paragraph, (optional) link ]
 *
 * @param {Element} block The cards-trend block element
 */
export default function decorate(block) {
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);

    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) {
        div.className = 'cards-trend-card-image';
      } else {
        div.className = 'cards-trend-card-body';
        // First paragraph in the body is the category tag pill.
        const firstP = div.querySelector('p');
        if (firstP && !firstP.querySelector('a, picture')) {
          const tag = document.createElement('span');
          tag.className = 'cards-trend-tag';
          tag.textContent = firstP.textContent.trim();
          firstP.replaceWith(tag);
        }
      }
    });

    // If the card body carries a link, turn the whole card into that link.
    const link = li.querySelector('a[href]');
    if (link) {
      const anchor = document.createElement('a');
      anchor.className = 'cards-trend-link';
      anchor.href = link.getAttribute('href');
      link.replaceWith(...link.childNodes);
      while (li.firstElementChild) anchor.append(li.firstElementChild);
      li.append(anchor);
    }

    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    img.closest('picture').replaceWith(optimizedPic);
  });

  block.textContent = '';
  block.append(ul);
}

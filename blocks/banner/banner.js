import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * loads and decorates the banner block
 * @param {Element} block The banner block element
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        col.classList.add('banner-image');
        const img = pic.querySelector('img');
        pic.replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
      } else {
        col.classList.add('banner-text');
      }
    });
  });
}

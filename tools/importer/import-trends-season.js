/* eslint-disable */
/* global WebImporter */

import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import cardsParser from './parsers/cards.js';
import photoGalleryParser from './parsers/photo-gallery.js';

import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

const parsers = {
  hero: heroParser,
  columns: columnsParser,
  cards: cardsParser,
  'photo-gallery': photoGalleryParser,
};

const PAGE_TEMPLATE = {
  name: 'trends-season',
  description: 'fashion-trends-of-the-season: hero, media/text promo, 3 feature cards, gallery, CTA.',
  urls: ['https://wknd-trendsetters.site/fashion-trends-of-the-season'],
  blocks: [
    { name: 'hero', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'columns', instances: ['#main-content > section.section#trends .grid-layout'] },
    { name: 'cards', instances: ['#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.desktop-3-column'] },
    { name: 'photo-gallery', instances: ['#main-content > section.section:nth-of-type(3) .grid-layout.desktop-3-column'] },
  ],
  sections: [
    { id: 's1', name: 'Hero', selector: '#main-content > header.section.secondary-section', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 's2', name: 'Trend alert', selector: '#main-content > section.section#trends', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 's3', name: 'Trends that turn heads', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'secondary', blocks: ['cards'], defaultContent: [] },
    { id: 's4', name: 'Style in every snapshot', selector: '#main-content > section.section:nth-of-type(3)', style: null, blocks: ['photo-gallery'], defaultContent: [] },
    { id: 's5', name: 'CTA', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: [] },
  ],
};

const transformers = [cleanupTransformer, sectionsTransformer];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((fn) => {
    try { fn.call(null, hookName, element, enhancedPayload); } catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => pageBlocks.push({ name: blockDef.name, selector, element }));
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const {
      document, url, html, params,
    } = payload;
    const main = document.body;
    executeTransformers('beforeTransform', main, payload);
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try { parser(block.element, { document, url, params }); } catch (e) { console.error(`Failed to parse ${block.name}:`, e); }
      }
    });
    executeTransformers('afterTransform', main, payload);
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
    const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);
    return [{ element: main, path, report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) } }];
  },
};

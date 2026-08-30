/* eslint-disable */
/* global WebImporter */

import heroParser from './parsers/hero.js';
import cardsTrendParser from './parsers/cards-trend.js';
import columnsPromoParser from './parsers/columns-promo.js';

import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

const parsers = {
  hero: heroParser,
  'cards-trend': cardsTrendParser,
  'columns-promo': columnsPromoParser,
};

const PAGE_TEMPLATE = {
  name: 'article-alt',
  description: 'Standalone article: hero intro, trend card grid, media/text promo, accent CTA.',
  urls: ['https://wknd-trendsetters.site/fashion-trends-young-adults-casual-sport'],
  blocks: [
    { name: 'hero', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'cards-trend', instances: ['#main-content > section.section#trends .grid-layout.desktop-4-column'] },
    { name: 'columns-promo', instances: ['#main-content > section.section.secondary-section .grid-layout'] },
  ],
  sections: [
    { id: 'aa1', name: 'Hero intro', selector: '#main-content > header.section.secondary-section', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'aa2', name: 'Trend grid', selector: '#main-content > section.section#trends', style: null, blocks: ['cards-trend'], defaultContent: [] },
    { id: 'aa3', name: 'Promo', selector: '#main-content > section.section.secondary-section', style: 'secondary', blocks: ['columns-promo'], defaultContent: [] },
    { id: 'aa4', name: 'CTA', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

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

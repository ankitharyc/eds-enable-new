/* eslint-disable */
/* global WebImporter */

import heroParser from './parsers/hero.js';
import cardsParser from './parsers/cards.js';
import articleListParser from './parsers/article-list.js';
import photoGalleryParser from './parsers/photo-gallery.js';

import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

const parsers = {
  hero: heroParser,
  cards: cardsParser,
  'article-list': articleListParser,
  'photo-gallery': photoGalleryParser,
};

const PAGE_TEMPLATE = {
  name: 'trends-young-adults',
  description: 'fashion-trends-young-adults: hero, 3 feature cards, intro, trend article cards, gallery, CTA.',
  urls: ['https://wknd-trendsetters.site/fashion-trends-young-adults'],
  blocks: [
    { name: 'hero', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'cards', instances: ['#main-content > section.section:nth-of-type(1) .grid-layout.desktop-3-column'] },
    { name: 'article-list', instances: ['#main-content > section.section#trends .grid-layout.desktop-4-column'] },
    { name: 'photo-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.desktop-4-column'] },
  ],
  sections: [
    { id: 'y1', name: 'Hero', selector: '#main-content > header.section.secondary-section', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'y2', name: 'Feature cards', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['cards'], defaultContent: [] },
    { id: 'y3', name: 'Intro', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'secondary', blocks: [], defaultContent: [] },
    { id: 'y4', name: 'Trends for every vibe', selector: '#main-content > section.section#trends', style: null, blocks: ['article-list'], defaultContent: [] },
    { id: 'y5', name: 'Style in every snapshot', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'secondary', blocks: ['photo-gallery'], defaultContent: [] },
    { id: 'y6', name: 'CTA', selector: '#main-content > section.section.accent-section', style: 'accent', blocks: [], defaultContent: [] },
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

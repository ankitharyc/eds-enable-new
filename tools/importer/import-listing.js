/* eslint-disable */
/* global WebImporter */

import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import articleListParser from './parsers/article-list.js';

import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

const parsers = {
  hero: heroParser,
  columns: columnsParser,
  'article-list': articleListParser,
};

const PAGE_TEMPLATE = {
  name: 'listing',
  description: 'Listing/index page: hero intro, featured article, and a responsive grid of linked cards.',
  urls: ['https://wknd-trendsetters.site/blog'],
  blocks: [
    { name: 'hero', instances: ['main > header.section.secondary-section .grid-layout'] },
    { name: 'columns', instances: ['main > section.section:not(.secondary-section):not(.accent-section) .grid-layout'] },
    { name: 'article-list', instances: ['main > section.section.secondary-section#articles .grid-layout.desktop-4-column'] },
  ],
  sections: [
    { id: 'l1', name: 'Hero intro', selector: 'main > header.section.secondary-section', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'l2', name: 'Featured article', selector: 'main > section.section:not(.secondary-section):not(.accent-section)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'l3', name: 'Latest articles', selector: 'main > section.section.secondary-section#articles', style: 'secondary', blocks: ['article-list'], defaultContent: [] },
    { id: 'l4', name: 'CTA', selector: 'main > section.section.accent-section', style: 'accent', blocks: [], defaultContent: [] },
  ],
};

const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      elements.forEach((element) => {
        pageBlocks.push({ name: blockDef.name, selector, element });
      });
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
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
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

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }];
  },
};

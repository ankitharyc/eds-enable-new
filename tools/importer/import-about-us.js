/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import photoGalleryParser from './parsers/photo-gallery.js';
import tabsProfileParser from './parsers/tabs-profile.js';
import articleListParser from './parsers/article-list.js';
import accordionFaqParser from './parsers/accordion-faq.js';
import bannerParser from './parsers/banner.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/wknd-trendsetters-cleanup.js';
import sectionsTransformer from './transformers/wknd-trendsetters-sections.js';

// PARSER REGISTRY
const parsers = {
  hero: heroParser,
  columns: columnsParser,
  'photo-gallery': photoGalleryParser,
  'tabs-profile': tabsProfileParser,
  'article-list': articleListParser,
  'accordion-faq': accordionFaqParser,
  banner: bannerParser,
};

// PAGE TEMPLATE CONFIGURATION — embedded from page-templates.json
const PAGE_TEMPLATE = {
  name: 'about-us',
  description: 'About Us page — hero intro, article header, photo gallery, profile tabs, latest articles, FAQ accordion, and CTA banner.',
  urls: [
    'https://wknd-trendsetters.site/about-us',
  ],
  blocks: [
    { name: 'hero', instances: ['#main-content > header.section.secondary-section .grid-layout'] },
    { name: 'columns', instances: ['#main-content > section.section:nth-of-type(1) .grid-layout'] },
    { name: 'photo-gallery', instances: ['#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column'] },
    { name: 'tabs-profile', instances: ['#main-content > section.section:nth-of-type(3) .tabs-wrapper'] },
    { name: 'article-list', instances: ['#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.desktop-4-column'] },
    { name: 'accordion-faq', instances: ['#main-content > section.section:nth-of-type(5) .faq-list'] },
    { name: 'banner', instances: ['#main-content > section.section.inverse-section'] },
  ],
  sections: [
    { id: 'rc1', name: 'Hero intro', selector: '#main-content > header.section.secondary-section', style: null, blocks: ['hero'], defaultContent: [] },
    { id: 'rc2', name: 'Article header', selector: '#main-content > section.section:nth-of-type(1)', style: null, blocks: ['columns'], defaultContent: [] },
    { id: 'rc3', name: 'Style in every snapshot', selector: '#main-content > section.section.secondary-section:nth-of-type(2)', style: 'secondary', blocks: ['photo-gallery'], defaultContent: [] },
    { id: 'rc4', name: 'Profile tabs', selector: '#main-content > section.section:nth-of-type(3)', style: null, blocks: ['tabs-profile'], defaultContent: [] },
    { id: 'rc5', name: 'Latest articles', selector: '#main-content > section.section.secondary-section:nth-of-type(4)', style: 'secondary', blocks: ['article-list'], defaultContent: [] },
    { id: 'rc6', name: 'FAQ', selector: '#main-content > section.section:nth-of-type(5)', style: null, blocks: ['accordion-faq'], defaultContent: [] },
    { id: 'rc7', name: 'CTA banner', selector: '#main-content > section.section.inverse-section', style: null, blocks: ['banner'], defaultContent: [] },
  ],
};

// TRANSFORMER REGISTRY — cleanup first, then section breaks/metadata
const transformers = [
  cleanupTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook.
 */
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

/**
 * Find all blocks on the page based on the embedded template configuration.
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name, selector, element, section: blockDef.section || null,
        });
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

    // 1. beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block (skip elements already replaced by a prior parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (map root to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};

/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-about-us.js
  var import_about_us_exports = {};
  __export(import_about_us_exports, {
    default: () => import_about_us_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document: document2 }) {
    const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
    const subheading = element.querySelector(".subheading, p");
    const ctaLinks = Array.from(element.querySelectorAll(".button-group a, a.button"));
    const images = Array.from(element.querySelectorAll("img"));
    if (!heading && !subheading && images.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (images.length > 0) {
      cells.push([images]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document: document2 }) {
    let columns = Array.from(element.querySelectorAll(":scope > div"));
    if (columns.length === 0) {
      columns = [element];
    }
    if (columns.length === 0 || columns.every((c) => !c.textContent.trim() && !c.querySelector("img"))) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push(columns);
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/photo-gallery.js
  function parse3(element, { document: document2 }) {
    const tiles = Array.from(element.querySelectorAll(":scope > div"));
    let images = tiles.map((tile) => tile.querySelector("img")).filter((img) => img);
    if (images.length === 0) {
      images = Array.from(element.querySelectorAll("img"));
    }
    if (images.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cells.push(images.map((img) => [img]));
    const block = WebImporter.Blocks.createBlock(document2, { name: "photo-gallery", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs-profile.js
  function parse4(element, { document: document2 }) {
    const panes = Array.from(element.querySelectorAll(".tabs-content .tab-pane, .tab-pane"));
    const menuButtons = Array.from(element.querySelectorAll(".tab-menu .tab-menu-link, .tab-menu-link"));
    if (panes.length === 0 && menuButtons.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    const rowCount = Math.max(panes.length, menuButtons.length);
    for (let i = 0; i < rowCount; i += 1) {
      let labelCell = "";
      if (menuButtons[i]) {
        const labelText = menuButtons[i].querySelector(":scope > div > div:last-child, :scope > div:last-child");
        labelCell = labelText || menuButtons[i];
      }
      const contentCell = panes[i] || "";
      cells.push([labelCell, contentCell]);
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "tabs-profile", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/article-list.js
  function parse5(element, { document: document2 }) {
    let cards = Array.from(element.querySelectorAll(":scope > a.article-card, :scope > a.card-link"));
    if (cards.length === 0) {
      cards = Array.from(element.querySelectorAll("a.article-card, .article-card"));
    }
    if (cards.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    cards.forEach((card) => {
      cells.push([card]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "article-list", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/accordion-faq.js
  function parse6(element, { document: document2 }) {
    const items = Array.from(element.querySelectorAll(".faq-item, details"));
    if (items.length === 0) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    items.forEach((item) => {
      const questionSpan = item.querySelector(".faq-question span, summary span");
      const summary = item.querySelector(".faq-question, summary");
      const titleCell = questionSpan || summary || "";
      const answer = item.querySelector(".faq-answer");
      const contentCell = answer || "";
      cells.push([titleCell, contentCell]);
    });
    const block = WebImporter.Blocks.createBlock(document2, { name: "accordion-faq", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/banner.js
  function parse7(element, { document: document2 }) {
    const bgImage = element.querySelector("img.utility-overlay, img.cover-image, img");
    const heading = element.querySelector('h1, h2, .h1-heading, [class*="heading"]');
    const subheading = element.querySelector(".subheading, .card-body p, p");
    const ctaLinks = Array.from(element.querySelectorAll(".button-group a, a.button"));
    if (!heading && !subheading && !bgImage) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (bgImage) {
      cells.push([bgImage]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (subheading) contentCell.push(subheading);
    contentCell.push(...ctaLinks);
    cells.push([contentCell]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "banner", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-trendsetters-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        ".breadcrumbs"
        // <div class="breadcrumbs"> inside #main-content section 1
      ]);
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        "a.skip-link",
        // <a href="#main-content" class="skip-link">
        ".navbar",
        // <div class="navbar"> top navigation with mega-menu
        "footer.footer"
        // <footer class="footer inverse-footer">
      ]);
    }
  }

  // tools/importer/transformers/wknd-trendsetters-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  function transform2(hookName, element, payload) {
    const sections = payload.template && payload.template.sections || [];
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = element.querySelector(section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || element.querySelector(section.selector);
        if (!anchor) continue;
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-about-us.js
  var parsers = {
    hero: parse,
    columns: parse2,
    "photo-gallery": parse3,
    "tabs-profile": parse4,
    "article-list": parse5,
    "accordion-faq": parse6,
    banner: parse7
  };
  var PAGE_TEMPLATE = {
    name: "about-us",
    description: "About Us page \u2014 hero intro, article header, photo gallery, profile tabs, latest articles, FAQ accordion, and CTA banner.",
    urls: [
      "https://wknd-trendsetters.site/about-us"
    ],
    blocks: [
      { name: "hero", instances: ["#main-content > header.section.secondary-section .grid-layout"] },
      { name: "columns", instances: ["#main-content > section.section:nth-of-type(1) .grid-layout"] },
      { name: "photo-gallery", instances: ["#main-content > section.section.secondary-section:nth-of-type(2) .grid-layout.desktop-4-column"] },
      { name: "tabs-profile", instances: ["#main-content > section.section:nth-of-type(3) .tabs-wrapper"] },
      { name: "article-list", instances: ["#main-content > section.section.secondary-section:nth-of-type(4) .grid-layout.desktop-4-column"] },
      { name: "accordion-faq", instances: ["#main-content > section.section:nth-of-type(5) .faq-list"] },
      { name: "banner", instances: ["#main-content > section.section.inverse-section"] }
    ],
    sections: [
      { id: "rc1", name: "Hero intro", selector: "#main-content > header.section.secondary-section", style: null, blocks: ["hero"], defaultContent: [] },
      { id: "rc2", name: "Article header", selector: "#main-content > section.section:nth-of-type(1)", style: null, blocks: ["columns"], defaultContent: [] },
      { id: "rc3", name: "Style in every snapshot", selector: "#main-content > section.section.secondary-section:nth-of-type(2)", style: "secondary", blocks: ["photo-gallery"], defaultContent: [] },
      { id: "rc4", name: "Profile tabs", selector: "#main-content > section.section:nth-of-type(3)", style: null, blocks: ["tabs-profile"], defaultContent: [] },
      { id: "rc5", name: "Latest articles", selector: "#main-content > section.section.secondary-section:nth-of-type(4)", style: "secondary", blocks: ["article-list"], defaultContent: [] },
      { id: "rc6", name: "FAQ", selector: "#main-content > section.section:nth-of-type(5)", style: null, blocks: ["accordion-faq"], defaultContent: [] },
      { id: "rc7", name: "CTA banner", selector: "#main-content > section.section.inverse-section", style: null, blocks: ["banner"], defaultContent: [] }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_about_us_default = {
    transform: (payload) => {
      const {
        document: document2,
        url,
        html,
        params
      } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_about_us_exports);
})();

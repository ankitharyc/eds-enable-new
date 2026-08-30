import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Fetches index rows from a query-index style JSON endpoint.
 * @param {string} source path to the index JSON (e.g. /query-index.json)
 * @returns {Promise<Array<Object>>}
 */
async function fetchIndex(source) {
  try {
    const resp = await fetch(source);
    if (!resp.ok) return [];
    const json = await resp.json();
    return json.data || [];
  } catch (e) {
    return [];
  }
}

/**
 * Splits a card's inline text into category, date and title.
 * Authored text arrives as e.g. "Casual Cool May 12### Tennis style, redefined"
 * where "###" is the leftover markdown heading marker for the title.
 * @param {string} raw the anchor's text content (after the picture)
 * @returns {{category: string, date: string, title: string}}
 */
function parseCardText(raw) {
  const text = (raw || '').replace(/\s+/g, ' ').trim();
  const [metaPart, ...titleParts] = text.split(/#{1,6}\s*/);
  const title = titleParts.join(' ').trim();
  const meta = metaPart.trim();
  // Pull a trailing date like "May 12" / "Sept 3" off the meta string.
  const dateMatch = meta.match(/^(.*?)\s+([A-Z][a-z]+\.?\s+\d{1,2})$/);
  if (dateMatch) {
    return { category: dateMatch[1].trim(), date: dateMatch[2].trim(), title };
  }
  return { category: meta, date: '', title: title || meta };
}

/**
 * Builds a card from an authored inline anchor.
 * @param {HTMLAnchorElement} anchor the authored link (contains picture + text)
 * @returns {HTMLLIElement}
 */
function buildInlineCard(anchor) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const link = document.createElement('a');
  link.className = 'article-list-link';
  link.href = anchor.getAttribute('href');

  const picture = anchor.querySelector('picture');
  if (picture) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'article-list-image';
    imgWrap.append(picture);
    link.append(imgWrap);
  }

  // Text nodes remaining in the anchor carry category/date/title.
  const raw = [...anchor.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ');
  const { category, date, title } = parseCardText(raw);

  const body = document.createElement('div');
  body.className = 'article-list-body';

  if (category || date) {
    const meta = document.createElement('div');
    meta.className = 'article-list-meta';
    if (category) {
      const tag = document.createElement('span');
      tag.className = 'article-list-tag';
      tag.textContent = category;
      meta.append(tag);
    }
    if (date) {
      const dateEl = document.createElement('span');
      dateEl.className = 'article-list-date';
      dateEl.textContent = date;
      meta.append(dateEl);
    }
    body.append(meta);
  }

  const heading = document.createElement('h3');
  heading.className = 'article-list-title';
  heading.textContent = title;
  body.append(heading);

  link.append(body);
  li.append(link);
  return li;
}

/**
 * Builds a single article card linking to the page (index-driven mode).
 * @param {Object} article a row from the index (path, title, description, image)
 * @returns {HTMLLIElement}
 */
function buildCard(article) {
  const li = document.createElement('li');
  li.className = 'article-list-card';

  const link = document.createElement('a');
  link.className = 'article-list-link';
  link.href = article.path;

  if (article.image) {
    const imgWrap = document.createElement('div');
    imgWrap.className = 'article-list-image';
    imgWrap.append(createOptimizedPicture(article.image, article.title || '', false, [{ width: '750' }]));
    link.append(imgWrap);
  }

  const body = document.createElement('div');
  body.className = 'article-list-body';
  const title = document.createElement('h3');
  title.className = 'article-list-title';
  title.textContent = article.title || article.path;
  body.append(title);
  if (article.description) {
    const desc = document.createElement('p');
    desc.textContent = article.description;
    body.append(desc);
  }
  link.append(body);

  li.append(link);
  return li;
}

/**
 * loads and decorates the article list
 * @param {Element} block The article-list block element
 */
export default async function decorate(block) {
  // Inline mode: cards are authored directly in the block as links with images.
  const inlineAnchors = [...block.querySelectorAll(':scope > div > div > a')]
    .filter((a) => a.querySelector('picture'));

  if (inlineAnchors.length) {
    const list = document.createElement('ul');
    list.className = 'article-list-items';
    inlineAnchors.forEach((a) => list.append(buildInlineCard(a)));
    block.textContent = '';
    block.append(list);
    return;
  }

  // Index-driven mode: fetch rows from a query-index style endpoint.
  const link = block.querySelector('a');
  const rows = [...block.querySelectorAll(':scope > div')];
  const filterText = rows[1]?.textContent.trim();
  let source = '/query-index.json';
  if (link && link.getAttribute('href')) source = new URL(link.getAttribute('href'), window.location).pathname;
  else {
    const firstText = rows[0]?.textContent.trim();
    if (firstText && firstText.startsWith('/')) source = firstText;
  }

  let articles = await fetchIndex(source);

  if (filterText && filterText.startsWith('/')) {
    articles = articles.filter((a) => a.path && a.path.startsWith(filterText));
  }

  block.textContent = '';
  const list = document.createElement('ul');
  list.className = 'article-list-items';
  articles.forEach((article) => list.append(buildCard(article)));
  block.append(list);

  if (!articles.length) {
    const empty = document.createElement('p');
    empty.className = 'article-list-empty';
    empty.textContent = 'No articles found.';
    block.append(empty);
  }
}

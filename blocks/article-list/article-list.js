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
 * Builds a single article card linking to the page.
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
  // 1. Extract configuration:
  //    - source: index JSON path (link or /path text), default /query-index.json
  //    - filter: optional path prefix to only include matching pages
  const link = block.querySelector('a');
  const rows = [...block.querySelectorAll(':scope > div')];
  const filterText = rows[1]?.textContent.trim();
  let source = '/query-index.json';
  if (link && link.getAttribute('href')) source = new URL(link.getAttribute('href'), window.location).pathname;
  else {
    const firstText = rows[0]?.textContent.trim();
    if (firstText && firstText.startsWith('/')) source = firstText;
  }

  // 2. Load data
  let articles = await fetchIndex(source);

  // 3. Optional path-prefix filter (e.g. only /articles/)
  if (filterText && filterText.startsWith('/')) {
    articles = articles.filter((a) => a.path && a.path.startsWith(filterText));
  }

  // 4. Transform DOM
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

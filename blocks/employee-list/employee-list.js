const PAGE_SIZE = 10;

/**
 * Fetches the "loadMore" label from the placeholders sheet.
 * Falls back to "Load more" if the sheet or key is unavailable.
 * @returns {Promise<string>}
 */
async function getLoadMoreLabel() {
  try {
    const resp = await fetch('/placeholders.json');
    if (!resp.ok) return 'Load more';
    const json = await resp.json();
    const row = (json.data || []).find((r) => r.Key === 'loadMore');
    return (row && row.Text) ? row.Text : 'Load more';
  } catch (e) {
    return 'Load more';
  }
}

/**
 * Fetches the employee records from the given JSON source.
 * @param {string} source path to the employees sheet
 * @returns {Promise<Array<Object>>}
 */
async function fetchEmployees(source) {
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
 * Builds a single employee card element.
 * @param {Object} employee
 * @returns {HTMLLIElement}
 */
function buildCard(employee) {
  const li = document.createElement('li');
  li.className = 'employee-list-card';
  li.innerHTML = `
    <h3 class="employee-list-name">${employee.Name || ''}</h3>
    <dl class="employee-list-meta">
      <div><dt>Department</dt><dd>${employee.Department || ''}</dd></div>
      <div><dt>Experience</dt><dd>${employee.Experience || ''} yrs</dd></div>
      <div><dt>City</dt><dd>${employee.City || ''}</dd></div>
    </dl>`;
  return li;
}

/**
 * loads and decorates the employee list
 * @param {Element} block The employee-list block element
 */
export default async function decorate(block) {
  // 1. Extract configuration: data source path (link or text), default to /employees.json
  const link = block.querySelector('a');
  const rawText = block.textContent.trim();
  let source = '/employees.json';
  if (link && link.href) source = new URL(link.getAttribute('href'), window.location).pathname;
  else if (rawText.startsWith('/')) source = rawText;

  // 2. Load data + label in parallel
  const [employees, loadMoreLabel] = await Promise.all([
    fetchEmployees(source),
    getLoadMoreLabel(),
  ]);

  // 3. Transform DOM
  block.textContent = '';
  const list = document.createElement('ul');
  list.className = 'employee-list-items';
  block.append(list);

  let rendered = 0;
  const renderNext = () => {
    const next = employees.slice(rendered, rendered + PAGE_SIZE);
    next.forEach((employee) => list.append(buildCard(employee)));
    rendered += next.length;
  };

  renderNext();

  // 4. "Load more" button — only when there are more records
  if (rendered < employees.length) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'employee-list-load-more';
    button.textContent = loadMoreLabel;
    button.addEventListener('click', () => {
      renderNext();
      if (rendered >= employees.length) button.remove();
    });
    block.append(button);
  }
}

const sidebar = document.querySelector('#site-sidebar');
const sidebarOverlay = document.querySelector('#sidebar-overlay');
const menuButton = document.querySelector('#menu-button');
const closeSidebarButton = document.querySelector('#close-sidebar');
const categoryNav = sidebar.querySelector('.sidebar-categories');
const submenu = sidebar.querySelector('#sidebar-submenu');
const menuCategories = window.marketplaceCategories;
const categoryById = new Map(menuCategories.map(category => [category.id, category]));
const pageContent = [...document.body.children].filter(element => element !== sidebar && element !== sidebarOverlay);
const previousInert = new Map();
const params = new URLSearchParams(window.location.search);
const requestedCategory = params.get('category');
let activeCategory = categoryById.has(requestedCategory) ? requestedCategory : menuCategories[0].id;

function renderSubmenu(categoryId) {
  const category = categoryById.get(categoryId);
  if (!category) return;
  const subcategory = params.get('subcategory');
  submenu.innerHTML = `
    <div class="sidebar-submenu-heading">
      <div>
        <p class="eyebrow">EXPLORE</p>
        <h2>${category.label}</h2>
      </div>
      <a href="shop.html?category=${encodeURIComponent(category.id)}">Shop all <span aria-hidden="true">→</span></a>
    </div>
    <nav class="sidebar-subcategory-grid" aria-label="${category.label} subcategories">
      ${category.subcategories.map(item => `<a href="shop.html?category=${encodeURIComponent(category.id)}&subcategory=${encodeURIComponent(item.id)}"${subcategory === item.id && requestedCategory === category.id ? ' aria-current="page"' : ''}>${item.label}<span aria-hidden="true">→</span></a>`).join('')}
    </nav>
  `;
}

function selectCategory(categoryId) {
  if (!categoryById.has(categoryId)) return;
  activeCategory = categoryId;
  categoryNav.querySelectorAll('[data-menu-category]').forEach(button => {
    const selected = button.dataset.menuCategory === activeCategory;
    button.classList.toggle('is-active', selected);
    button.setAttribute('aria-expanded', String(selected));
  });
  renderSubmenu(activeCategory);
}

const categoryGroups = menuCategories.reduce((groups, category) => {
  const group = category.group || 'Marketplace';
  (groups[group] ||= []).push(category);
  return groups;
}, {});
const activeGroup = categoryById.get(activeCategory)?.group || 'Marketplace';
categoryNav.innerHTML = Object.entries(categoryGroups)
  .sort(([left], [right]) => Number(right === activeGroup) - Number(left === activeGroup))
  .map(([group, groupCategories]) => `
  <div class="sidebar-category-group">
    <p class="sidebar-group-label">${group}</p>
    ${groupCategories.map(category => `
      <button class="sidebar-category-link" type="button" data-menu-category="${category.id}" aria-controls="sidebar-submenu" aria-expanded="false">
        <span>${category.label}</span><span class="sidebar-category-arrow" aria-hidden="true">→</span>
      </button>
    `).join('')}
  </div>
`).join('');
selectCategory(activeCategory);

categoryNav.addEventListener('pointerover', event => {
  const button = event.target.closest('[data-menu-category]');
  if (button) selectCategory(button.dataset.menuCategory);
});
categoryNav.addEventListener('focusin', event => {
  const button = event.target.closest('[data-menu-category]');
  if (button) selectCategory(button.dataset.menuCategory);
});
categoryNav.addEventListener('click', event => {
  const button = event.target.closest('[data-menu-category]');
  if (button) selectCategory(button.dataset.menuCategory);
});

function setSidebarOpen(open) {
  sidebar.classList.toggle('open', open);
  sidebarOverlay.classList.toggle('show', open);
  sidebarOverlay.setAttribute('aria-hidden', String(!open));
  sidebar.setAttribute('aria-hidden', String(!open));
  sidebar.inert = !open;
  document.body.classList.toggle('sidebar-open', open);
  if (open) {
    pageContent.forEach(element => {
      previousInert.set(element, element.inert);
      element.inert = true;
    });
  } else {
    pageContent.forEach(element => {
      element.inert = previousInert.get(element) || false;
    });
    previousInert.clear();
  }
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  if (open) closeSidebarButton.focus();
  else menuButton.focus();
}

menuButton.addEventListener('click', () => {
  setSidebarOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});
closeSidebarButton.addEventListener('click', () => setSidebarOpen(false));
sidebarOverlay.addEventListener('click', () => setSidebarOpen(false));
sidebar.addEventListener('click', event => {
  if (event.target.closest('.sidebar-submenu a')) setSidebarOpen(false);
});
sidebar.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    event.preventDefault();
    setSidebarOpen(false);
    return;
  }
  if (event.key !== 'Tab') return;
  const focusable = [...sidebar.querySelectorAll('a[href], button:not([disabled])')];
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});

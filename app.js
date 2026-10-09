const products = window.marketplaceProducts;
const productById = new Map(products.map(product => [product.id, product]));
const grid = document.querySelector('#product-grid');
const drawer = document.querySelector('#drawer');
const overlay = document.querySelector('#overlay');
const toast = document.querySelector('#toast');
const bagButton = document.querySelector('#bag-button');
const searchDialog = document.querySelector('#search-dialog');
let cart = readStoredIds('themarketplace-cart');
let savedProducts = new Set(readStoredIds('themarketplace-saved'));
let toastTimer;
const revealObserver = 'IntersectionObserver' in window
  ? new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      }
    }, { threshold: 0.14 })
  : null;

if (revealObserver) document.documentElement.classList.add('motion-ready');

function observeReveals(root = document) {
  if (!revealObserver) return;
  root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(element => {
    const delay = Number(element.dataset.revealDelay);
    if (Number.isFinite(delay) && delay > 0) {
      element.style.setProperty('--reveal-delay', `${delay}ms`);
    }
    revealObserver.observe(element);
  });
}

function readStoredIds(key) {
  try {
    const stored = JSON.parse(localStorage.getItem(key) || '[]');
    if (!Array.isArray(stored)) throw new TypeError('Expected a list of product IDs.');
    return stored.filter(id => Number.isInteger(id) && productById.has(id));
  } catch (error) {
    console.error(`Could not read ${key} from local storage.`, error);
    return [];
  }
}

function money(value) {
  return `$${value.toFixed(2)}`;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function saveIds(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    showToast('Your browser could not save this change.');
  }
}

function productCard(product, index) {
  const isSaved = savedProducts.has(product.id);
  return `<article class="product-card" data-reveal data-reveal-delay="${index * 55}">
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" loading="lazy" />
      ${product.tag ? `<span class="product-tag">${product.tag}</span>` : ''}
      <button class="wish${isSaved ? ' is-saved' : ''}" type="button" data-save-id="${product.id}" aria-label="${isSaved ? 'Remove' : 'Save'} ${product.name}" aria-pressed="${isSaved}">${isSaved ? '♥' : '♡'}</button>
    </div>
    <div class="product-info">
      <div><p class="product-name">${product.name}</p><span class="seller-name">By ${product.seller}</span></div>
      <strong>${money(product.price)}</strong>
    </div>
    <button class="add" type="button" data-add-id="${product.id}">Add to bag <span aria-hidden="true">+</span></button>
  </article>`;
}

function renderProducts(filter = 'all') {
  if (revealObserver) {
    grid.querySelectorAll('[data-reveal]').forEach(element => revealObserver.unobserve(element));
  }
  const visibleProducts = filter === 'all' ? products : products.filter(product => product.category === filter);
  grid.innerHTML = visibleProducts.map((product, index) => productCard(product, index)).join('');
  if (visibleProducts.length === 0) {
    grid.innerHTML = '<p class="no-results">No finds in this category just yet. Check back soon.</p>';
  }
  observeReveals(grid);
}

function updateCart() {
  saveIds('themarketplace-cart', cart);
  const items = cart.map(id => productById.get(id)).filter(Boolean);
  const total = items.reduce((sum, product) => sum + product.price, 0);
  document.querySelector('#bag-count').textContent = String(items.length);
  document.querySelector('#drawer-count').textContent = `(${items.length})`;
  bagButton.setAttribute('aria-label', `Shopping bag, ${items.length} ${items.length === 1 ? 'item' : 'items'}`);
  document.querySelector('#subtotal').textContent = money(total);
  document.querySelector('#cart-items').innerHTML = items.length
    ? items.map((product, index) => `<div class="cart-item"><img src="${product.image}" alt="" /><div><p>${product.name}</p><span>By ${product.seller}</span><p>${money(product.price)}</p></div><button class="remove" type="button" data-remove-index="${index}" aria-label="Remove ${product.name}">Remove</button></div>`).join('')
    : '<p class="empty-state">Your bag is ready for a little something.</p>';
}

function toggleDrawer(open) {
  drawer.classList.toggle('open', open);
  overlay.classList.toggle('show', open);
  overlay.setAttribute('aria-hidden', String(!open));
  drawer.setAttribute('aria-hidden', String(!open));
  drawer.inert = !open;
  if (open) document.querySelector('#close-drawer').focus();
  else bagButton.focus();
}

renderProducts();
updateCart();
observeReveals();

grid.addEventListener('click', event => {
  const addButton = event.target.closest('[data-add-id]');
  if (addButton) {
    const product = productById.get(Number(addButton.dataset.addId));
    if (!product) return;
    cart.push(product.id);
    updateCart();
    showToast(`${product.name} added to your bag.`);
    return;
  }

  const saveButton = event.target.closest('[data-save-id]');
  if (saveButton) {
    const productId = Number(saveButton.dataset.saveId);
    if (savedProducts.has(productId)) {
      savedProducts.delete(productId);
      showToast('Removed from your saved finds.');
    } else {
      savedProducts.add(productId);
      showToast('Saved for later.');
    }
    saveIds('themarketplace-saved', [...savedProducts]);
    renderProducts();
  }
});

document.querySelector('#cart-items').addEventListener('click', event => {
  const button = event.target.closest('[data-remove-index]');
  if (!button) return;
  cart.splice(Number(button.dataset.removeIndex), 1);
  updateCart();
});

bagButton.addEventListener('click', () => toggleDrawer(true));
document.querySelector('#close-drawer').addEventListener('click', () => toggleDrawer(false));
overlay.addEventListener('click', () => toggleDrawer(false));

document.querySelector('#checkout-button').addEventListener('click', () => {
  showToast(cart.length ? 'Checkout is ready to connect to your payment provider.' : 'Your bag is empty.');
});

document.querySelector('#newsletter-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#form-message').textContent = 'You’re on the list. Look out for good things!';
  event.currentTarget.reset();
});

document.querySelector('#search-button').addEventListener('click', () => {
  searchDialog.showModal();
  document.querySelector('#search-input').focus();
});

document.querySelector('#search-input').addEventListener('input', event => {
  const term = event.target.value.trim().toLowerCase();
  const matches = products.filter(product => `${product.name} ${product.category} ${product.seller}`.toLowerCase().includes(term));
  const results = document.querySelector('#search-results');
  results.innerHTML = !term ? '' : matches.length
    ? matches.map(product => `<div class="search-result"><span><strong>${product.name}</strong><small>By ${product.seller}</small></span><span>${money(product.price)} <button type="button" data-search-add="${product.id}">Add +</button></span></div>`).join('')
    : '<p class="search-empty">No finds yet. Try another search.</p>';
});

document.querySelector('#search-results').addEventListener('click', event => {
  const button = event.target.closest('[data-search-add]');
  if (!button) return;
  const product = productById.get(Number(button.dataset.searchAdd));
  if (!product) return;
  cart.push(product.id);
  updateCart();
  showToast(`${product.name} added to your bag.`);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && drawer.classList.contains('open')) toggleDrawer(false);
});

const products = window.marketplaceProducts;
const productById = new Map(products.map(product => [product.id, product]));
const grid = document.querySelector('#product-grid');
const drawer = document.querySelector('#drawer');
const overlay = document.querySelector('#overlay');
const toast = document.querySelector('#toast');
const bagButton = document.querySelector('#bag-button');
const themeButton = document.querySelector('#theme-button');
const wishlistButton = document.querySelector('#wishlist-button');
const wishlistDialog = document.querySelector('#wishlist-dialog');
const wishlistItems = document.querySelector('#wishlist-items');
const searchDialog = document.querySelector('#search-dialog');
const productDialog = document.querySelector('#product-dialog');
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

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function atStockLimit(product) {
  return product.isSellerListing && cart.filter(id => id === product.id).length >= product.quantity;
}

function canAddToCart(product) {
  if (!atStockLimit(product)) return true;
  showToast('You have added all available stock of this item to your bag.');
  return false;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('show'), 2400);
}

function applyTheme(theme, persist = false) {
  const isDark = theme === 'dark';
  document.documentElement.dataset.theme = isDark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(isDark));
  themeButton.setAttribute('aria-label', `Switch to ${isDark ? 'light' : 'dark'} mode`);
  themeButton.querySelector('.theme-icon').textContent = isDark ? '☀' : '☾';
  document.querySelector('meta[name="theme-color"]').content = isDark ? '#171c18' : '#f7f7f3';
  if (persist) {
    try {
      localStorage.setItem('themarketplace-theme', isDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Could not save the theme preference.', error);
      showToast('Your browser could not save the theme preference.');
    }
  }
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
  const escapedName = escapeHTML(product.name);
  const escapedSeller = escapeHTML(product.seller);
  const escapedImage = escapeHTML(product.image);
  const stockLimitReached = atStockLimit(product);
  const listingDetails = product.condition && product.size
    ? `<p class="product-listing-details"><span><strong>Condition</strong> ${escapeHTML(product.condition)}</span><span><strong>Size</strong> ${escapeHTML(product.size)}</span></p>`
    : '';
  return `<article class="product-card" data-reveal data-reveal-delay="${index * 55}">
    <div class="product-image">
      <button class="product-image-trigger" type="button" data-product-detail-id="${product.id}" aria-label="View details for ${escapedName}"><img src="${escapedImage}" alt="" loading="lazy" /></button>
      ${product.condition ? `<span class="product-tag">${escapeHTML(product.condition)}</span>` : product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ''}
      <button class="wish${isSaved ? ' is-saved' : ''}" type="button" data-save-id="${product.id}" aria-label="${isSaved ? 'Remove' : 'Save'} ${escapedName}" aria-pressed="${isSaved}">${isSaved ? '♥' : '♡'}</button>
    </div>
    <div class="product-info">
      <div><button class="product-name-trigger" type="button" data-product-detail-id="${product.id}">${escapedName}</button><span class="seller-name">By ${escapedSeller}</span></div>
      <strong>${money(product.price)}</strong>
    </div>
    ${listingDetails}
    <button class="add" type="button" data-add-id="${product.id}"${stockLimitReached ? ' disabled' : ''}>${stockLimitReached ? 'Stock in bag' : 'Add to bag'} <span aria-hidden="true">${stockLimitReached ? '' : '+'}</span></button>
  </article>`;
}

function renderWishlist() {
  const items = [...savedProducts].map(id => productById.get(id)).filter(Boolean);
  document.querySelector('#wishlist-count').textContent = String(items.length);
  document.querySelector('#wishlist-dialog-count').textContent = `(${items.length})`;
  wishlistButton.setAttribute('aria-label', `Wishlist, ${items.length} saved ${items.length === 1 ? 'item' : 'items'}`);
  wishlistItems.innerHTML = items.length
    ? items.map(product => `<article class="wishlist-item">
        <button class="wishlist-item-image" type="button" data-product-detail-id="${product.id}" aria-label="View details for ${escapeHTML(product.name)}"><img src="${escapeHTML(product.image)}" alt="" loading="lazy" /></button>
        <div class="wishlist-item-info"><button class="product-name-trigger" type="button" data-product-detail-id="${product.id}">${escapeHTML(product.name)}</button><span class="seller-name">By ${escapeHTML(product.seller)}</span>${product.condition && product.size ? `<span class="wishlist-item-meta">${escapeHTML(product.condition)} · Size ${escapeHTML(product.size)}</span>` : ''}<strong>${money(product.price)}</strong></div>
        <div class="wishlist-item-actions"><button class="add" type="button" data-wishlist-add="${product.id}"${atStockLimit(product) ? ' disabled' : ''}>${atStockLimit(product) ? 'Stock in bag' : 'Add to bag'} <span aria-hidden="true">${atStockLimit(product) ? '' : '+'}</span></button><button class="wishlist-remove" type="button" data-wishlist-remove="${product.id}">Remove</button></div>
      </article>`).join('')
    : '<div class="wishlist-empty"><span aria-hidden="true">♡</span><h3>Keep the good finds close.</h3><p>Tap the heart on anything you love and it will be saved here.</p><a class="button button-dark" href="shop.html">Explore the marketplace <span aria-hidden="true">→</span></a></div>';
}

function openProductDetails(productId) {
  const product = productById.get(Number(productId));
  if (!product) return;
  const categoryLabel = window.marketplaceCategories.find(category => category.id === product.category)?.label || product.category;
  const subcategoryLabel = window.marketplaceCategories.find(category => category.id === product.category)
    ?.subcategories.find(item => item.id === product.subcategory)?.label;
  const details = [
    ['Shop', categoryLabel],
    subcategoryLabel ? ['Collection', subcategoryLabel] : null,
    ['Seller', product.seller],
    product.tag ? ['Note', product.tag] : null,
    product.condition ? ['Condition', product.condition] : null,
    product.size ? ['Size', product.size] : null
  ].filter(Boolean);
  document.querySelector('#product-detail-content').innerHTML = `<div class="product-detail-layout">
    <div class="product-detail-image"><img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" /></div>
    <div class="product-detail-copy">
      <p class="eyebrow">A MARKETPLACE FIND</p>
      <h2>${escapeHTML(product.name)}</h2>
      <p class="product-detail-price">${money(product.price)}</p>
      <p class="product-detail-seller">Sold by ${escapeHTML(product.seller)}</p>
      ${product.description ? `<p class="product-detail-description">${escapeHTML(product.description)}</p>` : ''}
      <dl class="product-detail-facts">${details.map(([label, value]) => `<div><dt>${escapeHTML(label)}</dt><dd>${escapeHTML(value)}</dd></div>`).join('')}</dl>
      <button class="add product-detail-add" type="button" data-detail-add-id="${product.id}"${atStockLimit(product) ? ' disabled' : ''}>${atStockLimit(product) ? 'Stock in bag' : 'Add to bag'} <span aria-hidden="true">${atStockLimit(product) ? '' : '+'}</span></button>
    </div>
  </div>`;
  productDialog.showModal();
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
    ? items.map((product, index) => `<div class="cart-item"><img src="${escapeHTML(product.image)}" alt="" /><div><p>${escapeHTML(product.name)}</p><span>By ${escapeHTML(product.seller)}</span>${product.condition && product.size ? `<p>${escapeHTML(product.condition)} · Size ${escapeHTML(product.size)}</p>` : ''}<p>${money(product.price)}</p></div><button class="remove" type="button" data-remove-index="${index}" aria-label="Remove ${escapeHTML(product.name)}">Remove</button></div>`).join('')
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
renderWishlist();
observeReveals();
applyTheme(document.documentElement.dataset.theme || 'light');

themeButton.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
});

grid.addEventListener('click', event => {
  const detailTrigger = event.target.closest('[data-product-detail-id]');
  if (detailTrigger) {
    openProductDetails(detailTrigger.dataset.productDetailId);
    return;
  }

  const addButton = event.target.closest('[data-add-id]');
  if (addButton) {
    const product = productById.get(Number(addButton.dataset.addId));
    if (!product || !canAddToCart(product)) return;
    cart.push(product.id);
    updateCart();
    renderProducts();
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
    renderWishlist();
    renderProducts();
  }
});

wishlistButton.addEventListener('click', () => {
  renderWishlist();
  wishlistDialog.showModal();
});
document.querySelector('#close-wishlist').addEventListener('click', () => wishlistDialog.close());
wishlistItems.addEventListener('click', event => {
  const detailTrigger = event.target.closest('[data-product-detail-id]');
  if (detailTrigger) {
    wishlistDialog.close();
    openProductDetails(detailTrigger.dataset.productDetailId);
    return;
  }
  const removeButton = event.target.closest('[data-wishlist-remove]');
  if (removeButton) {
    savedProducts.delete(Number(removeButton.dataset.wishlistRemove));
    saveIds('themarketplace-saved', [...savedProducts]);
    renderWishlist();
    renderProducts();
    showToast('Removed from your wishlist.');
    return;
  }
  const addButton = event.target.closest('[data-wishlist-add]');
  if (!addButton) return;
  const product = productById.get(Number(addButton.dataset.wishlistAdd));
  if (!product || !canAddToCart(product)) return;
  cart.push(product.id);
  updateCart();
  renderProducts();
  showToast(`${product.name} added to your bag.`);
});

document.querySelector('#close-product-dialog').addEventListener('click', () => productDialog.close());
document.querySelector('#product-detail-content').addEventListener('click', event => {
  const addButton = event.target.closest('[data-detail-add-id]');
  if (!addButton) return;
  const product = productById.get(Number(addButton.dataset.detailAddId));
  if (!product || !canAddToCart(product)) return;
  cart.push(product.id);
  updateCart();
  renderProducts();
  productDialog.close();
  showToast(`${product.name} added to your bag.`);
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
  const matches = products.filter(product => `${product.name} ${product.category} ${product.seller} ${product.condition || ''} ${product.size || ''}`.toLowerCase().includes(term));
  const results = document.querySelector('#search-results');
  results.innerHTML = !term ? '' : matches.length
    ? matches.map(product => `<div class="search-result"><span><button type="button" class="search-product-detail" data-product-detail-id="${product.id}">${escapeHTML(product.name)}</button><small>By ${escapeHTML(product.seller)}${product.condition && product.size ? ` · ${escapeHTML(product.condition)} · Size ${escapeHTML(product.size)}` : ''}</small></span><span>${money(product.price)} <button type="button" data-search-add="${product.id}"${atStockLimit(product) ? ' disabled' : ''}>${atStockLimit(product) ? 'Stock in bag' : 'Add +'}</button></span></div>`).join('')
    : '<p class="search-empty">No finds yet. Try another search.</p>';
});

document.querySelector('#search-results').addEventListener('click', event => {
  const detailTrigger = event.target.closest('[data-product-detail-id]');
  if (detailTrigger) {
    searchDialog.close();
    openProductDetails(detailTrigger.dataset.productDetailId);
    return;
  }
  const button = event.target.closest('[data-search-add]');
  if (!button) return;
  const product = productById.get(Number(button.dataset.searchAdd));
  if (!product || !canAddToCart(product)) return;
  cart.push(product.id);
  updateCart();
  renderProducts();
  showToast(`${product.name} added to your bag.`);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && drawer.classList.contains('open')) toggleDrawer(false);
});

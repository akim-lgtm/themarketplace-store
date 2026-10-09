const products = window.marketplaceProducts;
const categories = {
  all: {
    label: 'Everything',
    title: 'Everything good, all in one place.',
    description: 'Discover independent makers, clever finds and everyday favourites from shops with a story to tell.',
    kicker: 'THE MARKETPLACE EDIT',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Thoughtfully curated marketplace finds'
  },
  home: {
    label: 'Home & living',
    title: 'Make yourself at home.',
    description: 'Thoughtful details, useful little upgrades and pieces that make your space feel like yours.',
    kicker: 'ROOM FOR GOOD FINDS',
    image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Warm, carefully styled home interior'
  },
  tech: {
    label: 'Tech',
    title: 'Clever things for everyday.',
    description: 'Meet smart essentials and well-made tech from independent shops with a fresh point of view.',
    kicker: 'A SMARTER EVERYDAY',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Thoughtful everyday technology'
  },
  style: {
    label: 'Style',
    title: 'A little more you.',
    description: 'Find everyday favourites, considered accessories and pieces that make getting dressed feel easy.',
    kicker: 'YOUR EVERYDAY EDIT',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Friends enjoying a day of shopping'
  },
  beauty: {
    label: 'Beauty',
    title: 'A moment for yourself.',
    description: 'Small-batch skincare and feel-good rituals from makers who care about the details.',
    kicker: 'A LITTLE SELF-CARE',
    image: 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Thoughtfully made skincare products'
  },
  outdoors: {
    label: 'Outdoors',
    title: 'Take the good stuff outside.',
    description: 'Simple, considered companions for fresh air, slow weekends and wherever the day takes you.',
    kicker: 'MADE TO ROAM',
    image: 'https://images.unsplash.com/photo-1478131143081-80f7f84ca84d?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'A welcoming campsite in the outdoors'
  },
  gifts: {
    label: 'Gifts',
    title: 'A little something lovely.',
    description: 'Thoughtful gifts with a story behind them, ready to make someone’s day.',
    kicker: 'GOOD THINGS TO GIVE',
    image: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Carefully wrapped gifts'
  },
  women: {
    label: 'Women',
    title: 'Everyday style, your way.',
    description: 'Explore dresses, denim, occasionwear and the little extras for your next outfit.',
    kicker: 'THE WOMEN’S EDIT',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Friends browsing a clothing boutique'
  },
  'plus-curve': {
    label: 'Plus+Curve',
    title: 'Style made to celebrate you.',
    description: 'Browse expressive everyday looks, denim, dresses and active essentials.',
    kicker: 'PLUS+CURVE',
    image: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'A model wearing a contemporary outfit'
  },
  men: {
    label: 'Men',
    title: 'Good style, made easy.',
    description: 'Find considered layers, everyday staples and finishing touches.',
    kicker: 'THE MEN’S EDIT',
    image: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'A contemporary menswear collection'
  },
  new: {
    label: 'New',
    title: 'Fresh finds, just in.',
    description: 'Explore what’s new, what’s trending and the latest additions to the edit.',
    kicker: 'JUST ARRIVED',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'A curated rail of new-season clothing'
  },
  sport: {
    label: 'Sport',
    title: 'Ready when you are.',
    description: 'Discover activewear and useful extras for movement, training and downtime.',
    kicker: 'MADE TO MOVE',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'A bright, modern fitness studio'
  },
  kids: {
    label: 'Kids',
    title: 'Little looks for big days.',
    description: 'Browse cheerful finds for growing kids, toddlers and every adventure.',
    kicker: 'LITTLE ONES, BIG ADVENTURES',
    image: 'https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Children playing outdoors'
  },
  thrift: {
    label: 'Thrift & pre-loved',
    title: 'Good finds, with a past.',
    description: 'Give great things another go. Browse carefully described pre-loved clothing, accessories and home finds, with condition and size shown on every listing.',
    kicker: 'PRE-LOVED, READY FOR YOU',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1100&q=85',
    imageAlt: 'Friends browsing clothes together'
  }
};

const productById = new Map(products.map(product => [product.id, product]));
const queryParams = new URLSearchParams(window.location.search);
const queryCategory = queryParams.get('category') || 'all';
const category = categories[queryCategory] ? queryCategory : 'all';
const details = categories[category];
const menuCategory = window.marketplaceCategories.find(item => item.id === category);
const requestedSubcategory = queryParams.get('subcategory');
const subcategory = menuCategory?.subcategories.find(item => item.id === requestedSubcategory) || null;
const grid = document.querySelector('#product-grid');
const drawer = document.querySelector('#drawer');
const overlay = document.querySelector('#overlay');
const bagButton = document.querySelector('#bag-button');
const themeButton = document.querySelector('#theme-button');
const wishlistButton = document.querySelector('#wishlist-button');
const wishlistDialog = document.querySelector('#wishlist-dialog');
const wishlistItems = document.querySelector('#wishlist-items');
const toast = document.querySelector('#toast');
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
const productDialog = document.querySelector('#product-dialog');
let toastTimer;
let cart = readStoredIds('themarketplace-cart');
let savedProducts = new Set(readStoredIds('themarketplace-saved'));
let thriftSort = 'featured';
let thriftSubcategory = subcategory?.id || '';
let thriftCondition = '';
let menFilter = 'all';

if (revealObserver) document.documentElement.classList.add('motion-ready');

function observeReveals(root = document) {
  if (!revealObserver) return;
  root.querySelectorAll('[data-reveal]:not(.is-visible)').forEach(element => {
    const delay = Number(element.dataset.revealDelay);
    if (Number.isFinite(delay) && delay > 0) element.style.setProperty('--reveal-delay', `${delay}ms`);
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

function saveIds(key, ids) {
  try {
    localStorage.setItem(key, JSON.stringify(ids));
  } catch (error) {
    console.error(`Could not save ${key} to local storage.`, error);
    showToast('Your browser could not save this change.');
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

function productCard(product, index) {
  const isSaved = savedProducts.has(product.id);
  const revealClass = category === 'thrift' ? ' is-visible' : '';
  const escapedName = escapeHTML(product.name);
  const escapedSeller = escapeHTML(product.seller);
  const escapedImage = escapeHTML(product.image);
  const stockLimitReached = atStockLimit(product);
  const listingDetails = product.condition && product.size
    ? `<p class="product-listing-details"><span><strong>Condition</strong> ${escapeHTML(product.condition)}</span><span><strong>Size</strong> ${escapeHTML(product.size)}</span></p>`
    : '';
  return `<article class="product-card${revealClass}" data-reveal data-reveal-delay="${index * 55}">
    <div class="product-image">
      <button class="product-image-trigger" type="button" data-product-detail-id="${product.id}" aria-label="View details for ${escapedName}"><img src="${escapedImage}" alt="" loading="lazy" /></button>
      ${product.condition ? `<span class="product-tag">${escapeHTML(product.condition)}</span>` : product.tag ? `<span class="product-tag">${escapeHTML(product.tag)}</span>` : ''}
      <button class="wish${isSaved ? ' is-saved' : ''}" type="button" data-save-id="${product.id}" aria-label="${isSaved ? 'Remove' : 'Save'} ${escapedName}" aria-pressed="${isSaved}">${isSaved ? '♥' : '♡'}</button>
    </div>
    <div class="product-info"><div><button class="product-name-trigger" type="button" data-product-detail-id="${product.id}">${escapedName}</button><span class="seller-name">By ${escapedSeller}</span></div><strong>${money(product.price)}</strong></div>
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
  const category = window.marketplaceCategories.find(item => item.id === product.category);
  const details = [
    ['Shop', category?.label || product.category],
    category?.subcategories.find(item => item.id === product.subcategory)
      ? ['Collection', category.subcategories.find(item => item.id === product.subcategory).label] : null,
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

function renderProducts() {
  const visible = products.filter(product => {
    const inCategory = category === 'all' || product.category === category;
    const inSubcategory = category === 'thrift' || !subcategory || product.subcategory === subcategory.id;
    const inThriftSubcategory = !thriftSubcategory || product.subcategory === thriftSubcategory;
    const inCondition = !thriftCondition || product.condition === thriftCondition;
    const inMenFilter = category !== 'men' || menFilter === 'all'
      || (menFilter === 'bestsellers' ? product.featured : product.subcategory === menFilter);
    return inCategory && inSubcategory && inThriftSubcategory && inCondition && inMenFilter;
  });
  const sorted = [...visible];
  if (thriftSort === 'price-low') sorted.sort((left, right) => left.price - right.price);
  if (thriftSort === 'price-high') sorted.sort((left, right) => right.price - left.price);
  if (thriftSort === 'condition') {
    const conditionOrder = ['New with tags', 'Like new', 'Very good', 'Good'];
    sorted.sort((left, right) => conditionOrder.indexOf(left.condition) - conditionOrder.indexOf(right.condition));
  }
  grid.innerHTML = sorted.map(productCard).join('');
  document.querySelector('#product-count').textContent = `${visible.length} ${visible.length === 1 ? 'find' : 'finds'}`;
  const thriftCount = document.querySelector('#thrift-result-count');
  if (thriftCount) thriftCount.textContent = `${visible.length} ${visible.length === 1 ? 'item' : 'items'}`;
  const menCount = document.querySelector('#men-trending-count');
  if (menCount) menCount.textContent = `${visible.length} ${visible.length === 1 ? 'find' : 'finds'}`;
  if (visible.length === 0) grid.innerHTML = '<p class="no-results">No finds in this category just yet. Check back soon.</p>';
  observeReveals(grid);
}

function updateCart() {
  saveIds('themarketplace-cart', cart);
  const items = cart.map(id => productById.get(id)).filter(Boolean);
  document.querySelector('#bag-count').textContent = String(items.length);
  document.querySelector('#drawer-count').textContent = `(${items.length})`;
  bagButton.setAttribute('aria-label', `Shopping bag, ${items.length} ${items.length === 1 ? 'item' : 'items'}`);
  document.querySelector('#subtotal').textContent = money(items.reduce((total, product) => total + product.price, 0));
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

document.title = `${subcategory ? subcategory.label : category === 'all' ? 'Shop' : details.label} — TheMarketPlace`;
document.querySelector('#category-title').textContent = subcategory ? `${subcategory.label}, found for you.` : details.title;
document.querySelector('#category-description').textContent = subcategory
  ? `Explore ${subcategory.label.toLowerCase()} from independent shops, makers and thoughtful brands.`
  : details.description;
document.querySelector('#category-kicker').textContent = details.kicker;
document.querySelector('#products-title').textContent = subcategory
  ? subcategory.label
  : category === 'all' ? 'Find your next favourite' : `${details.label} finds`;
document.querySelector('#products-kicker').textContent = category === 'all' ? 'A LITTLE BIT OF EVERYTHING' : details.kicker;
document.querySelector('#breadcrumb-current').textContent = subcategory ? `${details.label} / ${subcategory.label}` : details.label;
document.querySelector('#category-image').src = details.image;
document.querySelector('#category-image').alt = details.imageAlt;
if (category === 'thrift') {
  document.body.classList.add('is-thrift-page');
  document.querySelector('.browse-copy').classList.add('is-visible');
  document.querySelector('#thrift-toolbar').hidden = false;
  document.querySelector('#thrift-category-filter').value = thriftSubcategory;
  document.querySelector('#category-description').textContent = 'One-of-a-kind pre-loved finds, ready for another story. Check each item’s condition and size before you choose.';
  document.querySelector('#category-kicker').textContent = 'PRE-LOVED, READY FOR YOU';
  document.querySelector('#products-title').textContent = 'Pre-loved finds';
  document.querySelector('#products-kicker').textContent = 'ONE-OF-A-KIND FINDS';
  document.querySelector('#thrift-category-filter').addEventListener('change', event => {
    thriftSubcategory = event.target.value;
    renderProducts();
  });
  document.querySelector('#thrift-condition-filter').addEventListener('change', event => {
    thriftCondition = event.target.value;
    renderProducts();
  });
  document.querySelector('#thrift-sort').addEventListener('change', event => {
    thriftSort = event.target.value;
    renderProducts();
  });
  document.querySelectorAll('[data-thrift-columns]').forEach(button => {
    button.addEventListener('click', () => {
      const columns = button.dataset.thriftColumns;
      grid.dataset.columns = columns;
      document.querySelectorAll('[data-thrift-columns]').forEach(option => {
        option.setAttribute('aria-pressed', String(option === button));
      });
    });
  });
}
if (category === 'men') {
  document.body.classList.add('is-men-page');
  document.querySelector('.browse-copy').classList.add('is-visible');
  document.querySelector('#men-category-links').hidden = false;
  document.querySelector('#men-collection-grid').hidden = false;
  document.querySelector('#men-trending').hidden = false;
  document.querySelector('#category-kicker').textContent = 'THE MEN’S EDIT';
  document.querySelector('#category-title').textContent = 'Everyday style. Your own rules.';
  document.querySelector('#category-description').textContent = 'Fresh fits, easy layers and the pieces you reach for on repeat. Find your next favourite in the men’s edit.';
  document.querySelector('.browse-copy .button').textContent = 'Explore the edit ↓';
  document.querySelector('#men-category-links').innerHTML = [
    `<a href="shop.html?category=men"${subcategory ? '' : ' aria-current="page"'}>Shop all</a>`,
    ...menuCategory.subcategories.map(item =>
      `<a href="shop.html?category=men&subcategory=${encodeURIComponent(item.id)}"${subcategory?.id === item.id ? ' aria-current="page"' : ''}>${item.label}</a>`
    )
  ].join('');
  document.querySelectorAll('[data-men-filter]').forEach(button => {
    button.addEventListener('click', () => {
      menFilter = button.dataset.menFilter;
      document.querySelectorAll('[data-men-filter]').forEach(tab => {
        tab.setAttribute('aria-pressed', String(tab === button));
      });
      renderProducts();
    });
  });
}
document.querySelectorAll('[data-category-link]').forEach(link => {
  if (link.dataset.categoryLink === category) link.setAttribute('aria-current', 'page');
});

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
    renderProducts(category);
    showToast(`${product.name} added to your bag.`);
    return;
  }
  const saveButton = event.target.closest('[data-save-id]');
  if (!saveButton) return;
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
  renderProducts(category);
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
  renderProducts(category);
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

document.querySelector('#search-button').addEventListener('click', () => {
  document.querySelector('#search-dialog').showModal();
  document.querySelector('#search-input').focus();
});
document.querySelector('#search-input').addEventListener('input', event => {
  const term = event.target.value.trim().toLowerCase();
  const matches = products.filter(product => `${product.name} ${product.category} ${product.seller} ${product.condition || ''} ${product.size || ''}`.toLowerCase().includes(term));
  document.querySelector('#search-results').innerHTML = !term ? '' : matches.length
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
  renderProducts(category);
  showToast(`${product.name} added to your bag.`);
});

document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && drawer.classList.contains('open')) toggleDrawer(false);
});

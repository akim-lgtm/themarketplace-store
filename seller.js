import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase-config.js';

const LISTINGS_TABLE = 'marketplace_listings';
const LISTINGS_BUCKET = 'listing-media';
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const accessPanel = document.querySelector('#seller-access');
const accessMessage = document.querySelector('#seller-access-message');
const accessSignout = document.querySelector('#seller-access-signout');
const workspace = document.querySelector('#seller-workspace');
const signoutButton = document.querySelector('#seller-signout');
const form = document.querySelector('#seller-listing-form');
const listingMessage = document.querySelector('#seller-message');
const listMessage = document.querySelector('#seller-list-message');
const listingContainer = document.querySelector('#seller-listings');
const categorySelect = document.querySelector('#listing-category');
const subcategorySelect = document.querySelector('#listing-subcategory');
const sizeInput = document.querySelector('#listing-size');
const imageInput = document.querySelector('#listing-image');
const filterSelect = document.querySelector('#seller-listing-filter');
const cancelEditButton = document.querySelector('#seller-cancel-edit');
const themeButton = document.querySelector('#seller-theme-button');
let client;
let sellerSession;
let sellerProfile;
let listings = [];
let editingId = null;

function escapeHTML(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function setMessage(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('is-error', isError);
}

function getPublicImageUrl(path) {
  return client.storage.from(LISTINGS_BUCKET).getPublicUrl(path).data.publicUrl;
}

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(price));
}

function setTheme(theme, persist = false) {
  const dark = theme === 'dark';
  document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} mode`);
  themeButton.querySelector('.theme-icon').textContent = dark ? '☀' : '☾';
  document.querySelector('meta[name="theme-color"]').content = dark ? '#171c18' : '#f7f7f3';
  if (persist) {
    try {
      localStorage.setItem('themarketplace-theme', dark ? 'dark' : 'light');
    } catch (error) {
      console.error('Could not save the theme preference.', error);
    }
  }
}

function setAccessState(message, isError = false, showSignout = false) {
  accessPanel.hidden = false;
  workspace.hidden = true;
  signoutButton.hidden = true;
  accessSignout.hidden = !showSignout;
  setMessage(accessMessage, message, isError);
}

function populateCategories(selectedCategory = '') {
  const categories = window.marketplaceCategories;
  categorySelect.innerHTML = `<option value="">Choose a category</option>${categories
    .map(category => `<option value="${escapeHTML(category.id)}">${escapeHTML(category.label)}</option>`)
    .join('')}`;
  categorySelect.value = selectedCategory;
  updateSubcategories();
}

function updateSubcategories(selectedSubcategory = '') {
  const category = window.marketplaceCategories.find(item => item.id === categorySelect.value);
  const subcategories = category?.subcategories || [];
  subcategorySelect.innerHTML = `<option value="">Choose a subcategory</option>${subcategories
    .map(item => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.label)}</option>`)
    .join('')}`;
  subcategorySelect.disabled = subcategories.length === 0;
  subcategorySelect.value = selectedSubcategory;
  const sizeRequired = categorySelect.value === 'thrift';
  sizeInput.required = sizeRequired;
  sizeInput.setAttribute('aria-required', String(sizeRequired));
}

function listingPayload() {
  const category = window.marketplaceCategories.find(item => item.id === categorySelect.value);
  const subcategory = category?.subcategories.find(item => item.id === subcategorySelect.value);
  if (!category || !subcategory) throw new Error('Choose a valid category and subcategory.');
  const name = document.querySelector('#listing-name').value.trim();
  const description = document.querySelector('#listing-description').value.trim();
  const price = Number(document.querySelector('#listing-price').value);
  const quantity = Number(document.querySelector('#listing-quantity').value);
  const size = sizeInput.value.trim();
  if (name.length < 2 || description.length < 10) throw new Error('Add a title and a description with at least 10 characters.');
  if (!Number.isFinite(price) || price <= 0) throw new Error('Enter a price greater than zero.');
  if (!Number.isInteger(quantity) || quantity < 1) throw new Error('Available quantity must be at least one.');
  if (category.id === 'thrift' && !size) throw new Error('Add a size for thrift and pre-loved listings.');

  return {
    seller_id: sellerSession.user.id,
    seller_name: sellerProfile.shop_name,
    category: category.id,
    subcategory: subcategory.id,
    name,
    description,
    price,
    condition: document.querySelector('#listing-condition').value,
    size: size || null,
    quantity,
    status: document.querySelector('#listing-status').value
  };
}

async function uploadListingImage(file) {
  if (!allowedImageTypes.includes(file.type)) throw new Error('Choose a JPG, PNG, WebP, or AVIF image.');
  if (file.size > MAX_IMAGE_SIZE) throw new Error('The product photo must be no larger than 5 MB.');
  const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${sellerSession.user.id}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(LISTINGS_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false
  });
  if (error) throw new Error(`Could not upload the product photo: ${error.message}`);
  return path;
}

async function removeImage(path, context) {
  if (!path) return null;
  const { error } = await client.storage.from(LISTINGS_BUCKET).remove([path]);
  if (error) {
    console.error(`Could not remove a ${context} listing image.`, error);
    return error;
  }
  return null;
}

function resetListingForm() {
  form.reset();
  editingId = null;
  imageInput.required = true;
  categorySelect.value = '';
  updateSubcategories();
  document.querySelector('#listing-quantity').value = '1';
  document.querySelector('#listing-status').value = 'active';
  document.querySelector('#seller-form-title').textContent = 'Create a listing';
  document.querySelector('#seller-submit').innerHTML = 'Save listing <span aria-hidden="true">→</span>';
  cancelEditButton.hidden = true;
}

async function saveListing(event) {
  event.preventDefault();
  if (!form.reportValidity()) return;
  const submitButton = document.querySelector('#seller-submit');
  submitButton.disabled = true;
  setMessage(listingMessage, editingId ? 'Updating your listing…' : 'Saving your listing…');
  let uploadedPath = null;
  let listingSaved = false;
  try {
    const payload = listingPayload();
    const selectedImage = imageInput.files?.[0];
    const existing = editingId === null ? null : listings.find(listing => listing.id === editingId);
    if (selectedImage) uploadedPath = await uploadListingImage(selectedImage);
    const imagePath = uploadedPath || existing?.image_path;
    if (!imagePath) throw new Error('Choose a product photo for this listing.');
    const query = existing
      ? client.from(LISTINGS_TABLE).update({ ...payload, image_path: imagePath }).eq('id', editingId).eq('seller_id', sellerSession.user.id)
      : client.from(LISTINGS_TABLE).insert({ ...payload, image_path: imagePath });
    const { data, error } = await query.select('*').single();
    if (error) throw new Error(`Could not save your listing: ${error.message}`);
    listingSaved = true;

    const replacedPath = existing && uploadedPath ? existing.image_path : null;
    if (replacedPath) {
      const cleanupError = await removeImage(replacedPath, 'previous');
      if (cleanupError) {
        await loadListings();
        resetListingForm();
        setMessage(listingMessage, 'Listing saved, but its previous photo could not be removed from storage.', true);
        return;
      }
    }
    if (!existing) listings.unshift(data);
    else listings = listings.map(listing => listing.id === data.id ? data : listing);
    resetListingForm();
    renderListings();
    setMessage(listMessage, '');
    setMessage(listingMessage, data.status === 'active'
      ? 'Listing saved and published to the marketplace.'
      : 'Listing saved as a draft.');
  } catch (error) {
    if (uploadedPath && !listingSaved) {
      const cleanupError = await removeImage(uploadedPath, 'unused');
      if (cleanupError) {
        console.error('The listing failed to save and its uploaded photo remains in storage.', cleanupError);
      }
    }
    console.error('Could not save the seller listing.', error);
    setMessage(listingMessage, error instanceof Error ? error.message : 'Could not save the listing.', true);
  } finally {
    submitButton.disabled = false;
  }
}

function editListing(id) {
  const listing = listings.find(item => item.id === id);
  if (!listing) return;
  editingId = listing.id;
  document.querySelector('#listing-name').value = listing.name;
  categorySelect.value = listing.category;
  updateSubcategories(listing.subcategory);
  document.querySelector('#listing-price').value = listing.price;
  document.querySelector('#listing-quantity').value = Math.max(1, listing.quantity);
  document.querySelector('#listing-condition').value = listing.condition;
  sizeInput.value = listing.size || '';
  document.querySelector('#listing-description').value = listing.description;
  document.querySelector('#listing-status').value = listing.status === 'archived' || listing.status === 'sold'
    ? 'draft'
    : listing.status;
  imageInput.value = '';
  imageInput.required = false;
  document.querySelector('#seller-form-title').textContent = 'Edit listing';
  document.querySelector('#seller-submit').innerHTML = 'Update listing <span aria-hidden="true">→</span>';
  cancelEditButton.hidden = false;
  setMessage(listingMessage, 'Leave the photo empty to keep the current image.');
  document.querySelector('#listing-name').focus();
  form.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function renderSummary() {
  document.querySelector('#seller-count-all').textContent = String(listings.length);
  for (const status of ['active', 'draft', 'sold']) {
    document.querySelector(`#seller-count-${status}`).textContent = String(
      listings.filter(listing => listing.status === status).length
    );
  }
}

function renderListings() {
  renderSummary();
  const filter = filterSelect.value;
  const visibleListings = listings.filter(listing => filter === 'all' || listing.status === filter);
  listingContainer.innerHTML = visibleListings.length
    ? visibleListings.map(listing => {
      const category = window.marketplaceCategories.find(item => item.id === listing.category);
      const subcategory = category?.subcategories.find(item => item.id === listing.subcategory);
      return `<article class="seller-listing-card" data-listing-id="${listing.id}">
        <img class="seller-listing-image" src="${escapeHTML(getPublicImageUrl(listing.image_path))}" alt="" loading="lazy" />
        <div class="seller-listing-copy">
          <div class="seller-listing-title"><h3>${escapeHTML(listing.name)}</h3><span class="seller-status seller-status-${escapeHTML(listing.status)}">${escapeHTML(listing.status)}</span></div>
          <p>${escapeHTML(category?.label || listing.category)}${subcategory ? ` · ${escapeHTML(subcategory.label)}` : ''}</p>
          <p>${escapeHTML(listing.condition)}${listing.size ? ` · Size ${escapeHTML(listing.size)}` : ''} · ${listing.quantity} in stock</p>
          <strong>${formatPrice(listing.price)}</strong>
          <div class="seller-listing-actions">
            <button type="button" data-listing-edit="${listing.id}">Edit</button>
            ${listing.status === 'active'
              ? `<button type="button" data-listing-status="draft" data-listing-id="${listing.id}">Unpublish</button><button type="button" data-listing-status="sold" data-listing-id="${listing.id}">Mark sold</button>`
              : listing.status === 'sold'
                ? `<button type="button" data-listing-edit="${listing.id}">Restock &amp; republish</button>`
                : `<button type="button" data-listing-status="active" data-listing-id="${listing.id}">Publish</button>`}
            <button class="seller-listing-delete" type="button" data-listing-delete="${listing.id}">Delete</button>
          </div>
        </div>
      </article>`;
    }).join('')
    : '<p class="seller-list-empty">No listings in this view yet. Add a listing above to get started.</p>';
}

async function loadListings() {
  setMessage(listMessage, 'Loading your listings…');
  const { data, error } = await client
    .from(LISTINGS_TABLE)
    .select('*')
    .eq('seller_id', sellerSession.user.id)
    .order('created_at', { ascending: false });
  if (error) throw new Error(`Could not load your listings: ${error.message}`);
  listings = data;
  renderListings();
  setMessage(listMessage, '');
}

async function updateListingStatus(id, status) {
  const listing = listings.find(item => item.id === id);
  if (!listing) return;
  const quantity = status === 'sold' ? 0 : Math.max(1, listing.quantity);
  const { data, error } = await client.from(LISTINGS_TABLE)
    .update({ status, quantity })
    .eq('id', id)
    .eq('seller_id', sellerSession.user.id)
    .select('*')
    .single();
  if (error) throw new Error(`Could not update listing status: ${error.message}`);
  listings = listings.map(item => item.id === id ? data : item);
  renderListings();
}

async function deleteListing(id) {
  const listing = listings.find(item => item.id === id);
  if (!listing || !window.confirm(`Delete “${listing.name}” permanently?`)) return;
  const { error } = await client.from(LISTINGS_TABLE)
    .delete()
    .eq('id', id)
    .eq('seller_id', sellerSession.user.id);
  if (error) throw new Error(`Could not delete listing: ${error.message}`);
  listings = listings.filter(item => item.id !== id);
  renderListings();
  const cleanupError = await removeImage(listing.image_path, 'deleted');
  setMessage(listMessage, cleanupError
    ? 'Listing deleted, but its photo could not be removed from storage.'
    : 'Listing deleted.');
}

async function handleListingAction(action) {
  try {
    if (action.dataset.listingEdit !== undefined) {
      editListing(Number(action.dataset.listingEdit));
      return;
    }
    if (action.dataset.listingStatus) {
      await updateListingStatus(Number(action.dataset.listingId), action.dataset.listingStatus);
      setMessage(listMessage, action.dataset.listingStatus === 'sold' ? 'Listing marked as sold.' : 'Listing visibility updated.');
      return;
    }
    if (action.dataset.listingDelete !== undefined) {
      await deleteListing(Number(action.dataset.listingDelete));
    }
  } catch (error) {
    console.error('Could not complete the listing action.', error);
    setMessage(listMessage, error instanceof Error ? error.message : 'Could not complete this listing action.', true);
  }
}

async function signOut() {
  const { error } = await client.auth.signOut();
  if (error) throw new Error(`Could not sign out: ${error.message}`);
  sellerSession = null;
  sellerProfile = null;
  listings = [];
  setAccessState('You have signed out. Sign in again to manage your shop.');
}

async function initialize() {
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    setAccessState('Seller tools are unavailable because the Supabase project is not configured.', true);
    return;
  }
  client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });
  client.auth.onAuthStateChange(event => {
    if (event === 'SIGNED_OUT') {
      sellerSession = null;
      sellerProfile = null;
      listings = [];
      setAccessState('You have signed out. Sign in again to manage your shop.');
    }
  });
  const { data, error } = await client.auth.getSession();
  if (error) throw new Error(`Could not check your sign-in: ${error.message}`);
  if (!data.session) {
    setAccessState('Seller Studio is available to registered sellers. Sign in or create a seller account to manage your listings.');
    return;
  }
  sellerSession = data.session;
  const { data: profile, error: profileError } = await client.from('profiles')
    .select('role, shop_name')
    .eq('user_id', sellerSession.user.id)
    .single();
  if (profileError) throw new Error(`Could not load your seller profile: ${profileError.message}`);
  if (profile.role !== 'seller') {
    setAccessState('This account is a shopper account. Sign out here, then sign in or create a seller account to open Seller Studio.', false, true);
    return;
  }
  sellerProfile = profile;
  accessPanel.hidden = true;
  workspace.hidden = false;
  signoutButton.hidden = false;
  document.querySelector('#seller-shop-name').textContent = profile.shop_name;
  document.querySelector('#seller-account-email').textContent = sellerSession.user.email || '';
  populateCategories();
  try {
    await loadListings();
  } catch (error) {
    console.error('Could not initialize seller listings.', error);
    listingContainer.innerHTML = '';
    setMessage(listMessage, `${error.message}. Run the updated supabase-schema.sql in the Supabase SQL Editor, then reload Seller Studio.`, true);
  }
}

populateCategories();
setTheme(document.documentElement.dataset.theme || 'light');
themeButton.addEventListener('click', () => {
  setTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
});
categorySelect.addEventListener('change', () => updateSubcategories());
form.addEventListener('submit', saveListing);
cancelEditButton.addEventListener('click', () => {
  resetListingForm();
  setMessage(listingMessage, '');
});
filterSelect.addEventListener('change', renderListings);
listingContainer.addEventListener('click', event => {
  const action = event.target.closest('[data-listing-edit], [data-listing-status], [data-listing-delete]');
  if (action) void handleListingAction(action);
});
signoutButton.addEventListener('click', () => {
  void signOut().catch(error => {
    console.error('Could not sign out of Seller Studio.', error);
    setMessage(listMessage, error.message, true);
  });
});
accessSignout.addEventListener('click', () => {
  void signOut().catch(error => {
    console.error('Could not sign out of Seller Studio.', error);
    setMessage(accessMessage, error.message, true);
  });
});
void initialize().catch(error => {
  console.error('Could not open Seller Studio.', error);
  setAccessState(error instanceof Error ? error.message : 'Could not open Seller Studio.', true);
});

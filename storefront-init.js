import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase-config.js';

async function loadPublishedListings() {
  const client = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }
  });
  const { data, error } = await client
    .from('marketplace_listings')
    .select('id, seller_name, category, subcategory, name, description, price, image_path, condition, size, quantity')
    .eq('status', 'active')
    .gt('quantity', 0)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) throw new Error(`Could not load seller listings: ${error.message}`);
  const listings = data.map(listing => ({
    id: Number(listing.id),
    name: listing.name,
    description: listing.description,
    price: Number(listing.price),
    category: listing.category,
    subcategory: listing.subcategory,
    seller: listing.seller_name,
    image: client.storage.from('listing-media').getPublicUrl(listing.image_path).data.publicUrl,
    condition: listing.condition,
    size: listing.size,
    quantity: listing.quantity,
    isSellerListing: true
  }));
  window.marketplaceProducts.push(...listings);
}

let listingsError = null;
if (SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY) {
  try {
    await loadPublishedListings();
  } catch (error) {
    listingsError = error;
    console.error('Seller listings are unavailable; displaying the sample catalog instead.', error);
  }
} else {
  listingsError = new Error('Supabase is not configured.');
  console.error('Seller listings are unavailable; displaying the sample catalog instead.', listingsError);
}

const pageModule = window.location.pathname.endsWith('/shop.html')
  ? './shop-page.js?v=seller-listings-1'
  : './app.js?v=seller-listings-1';
await import(pageModule);

if (listingsError) {
  const notice = document.createElement('p');
  notice.className = 'listing-feed-notice';
  notice.setAttribute('role', 'status');
  notice.textContent = 'Live seller listings are temporarily unavailable. Sample finds are still shown.';
  document.querySelector('#product-grid')?.before(notice);
}

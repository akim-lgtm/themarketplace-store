import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL } from './supabase-config.js';

const accountDialog = document.querySelector('#account-dialog');
const accountMessage = document.querySelector('#account-message');
const profileMessage = document.querySelector('#profile-message');
const passwordMessage = document.querySelector('#password-message');
const accountForm = document.querySelector('#account-form');
const forgotForm = document.querySelector('#forgot-form');
const resetForm = document.querySelector('#reset-form');
const profileForm = document.querySelector('#profile-form');
const passwordForm = document.querySelector('#password-form');
const accountProfile = document.querySelector('#account-profile');
const accountRoleSwitch = document.querySelector('#account-role-switch');
const accountModeSwitch = document.querySelector('#account-mode-switch');
const accountRoleButtons = [...accountDialog.querySelectorAll('[data-account-role]')];
const accountModeButtons = [...accountDialog.querySelectorAll('[data-account-mode]')];
const signupFields = [...accountDialog.querySelectorAll('.account-signup-only')];
const accountName = document.querySelector('#account-name');
const accountShop = document.querySelector('#account-shop');
const accountPhone = document.querySelector('#account-phone');
const accountAddress = document.querySelector('#account-address');
const accountEmail = document.querySelector('#account-email');
const accountPassword = document.querySelector('#account-password');
const accountConfirm = document.querySelector('#account-confirm');
const accountTitle = document.querySelector('#account-title');
const accountSubmit = document.querySelector('#account-submit');
const accountButton = document.querySelector('#account-button');
const sellerDashboardLink = document.querySelector('#seller-profile-dashboard');
const profileAvatar = document.querySelector('#profile-avatar');
const profileBanner = document.querySelector('#profile-banner');
const avatarInput = document.querySelector('#profile-picture');
const bannerInput = document.querySelector('#store-banner');
const PROFILE_BUCKET = 'profile-media';
const PASSWORD_MIN_LENGTH = 8;
const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const MAX_BANNER_SIZE = 8 * 1024 * 1024;
let supabase;
let activeSession = null;
let accountRole = 'shopper';
let accountMode = 'signin';
let accountView = 'auth';
let returnFocus = null;
let selectedAvatar = null;
let selectedBanner = null;
let avatarObjectUrl = null;
let bannerObjectUrl = null;
let recoveryFlowStarted = false;

function setMessage(target, message, isError = false) {
  target.textContent = message;
  target.classList.toggle('is-error', isError);
}

function updateAccountButton() {
  if (!accountButton) return;
  const label = activeSession?.profile.username || activeSession?.email || 'Your account';
  accountButton.setAttribute('aria-label', activeSession
    ? `${activeSession.role === 'seller' ? 'Seller' : 'Shopper'} account: ${label}`
    : 'Your account');
  accountButton.title = activeSession ? `Signed in as ${label}` : 'Your account';
}

function renderAccountDialog() {
  const signedIn = Boolean(activeSession);
  const roleLabel = accountRole === 'seller' ? 'Seller' : 'Shopper';

  accountRoleSwitch.hidden = signedIn || accountView !== 'auth';
  accountModeSwitch.hidden = signedIn || accountView !== 'auth';
  accountForm.hidden = signedIn || accountView !== 'auth';
  forgotForm.hidden = signedIn || accountView !== 'forgot';
  resetForm.hidden = accountView !== 'reset';
  accountProfile.hidden = !signedIn || accountView === 'reset';
  profileForm.hidden = !signedIn || accountView === 'reset';
  passwordForm.hidden = !signedIn || accountView === 'reset';
  accountRoleButtons.forEach(button => {
    button.setAttribute('aria-pressed', String(button.dataset.accountRole === accountRole));
  });
  accountModeButtons.forEach(button => {
    button.setAttribute('aria-selected', String(button.dataset.accountMode === accountMode));
  });
  signupFields.forEach(field => {
    const roleMatches = !field.dataset.accountRoleField || field.dataset.accountRoleField === accountRole;
    field.hidden = accountView !== 'auth' || accountMode !== 'signup' || !roleMatches;
  });

  accountTitle.textContent = accountView === 'reset'
    ? 'Choose a new password'
    : signedIn
      ? `${roleLabel} profile`
      : accountView === 'forgot'
      ? 'Reset your password'
      : `${roleLabel} ${accountMode === 'signup' ? 'sign up' : 'sign in'}`;
  accountName.required = accountRole === 'seller' && accountMode === 'signup';
  accountShop.required = accountRole === 'seller' && accountMode === 'signup';
  accountPhone.required = accountRole === 'shopper' && accountMode === 'signup';
  accountAddress.required = accountRole === 'shopper' && accountMode === 'signup';
  accountConfirm.required = accountView === 'auth' && accountMode === 'signup';
  accountPassword.autocomplete = accountMode === 'signup' ? 'new-password' : 'current-password';
  accountSubmit.textContent = accountMode === 'signup' ? 'Create account →' : 'Sign in →';
  accountProfile.querySelector('#account-profile-welcome').textContent = signedIn
    ? `Welcome, ${activeSession.profile.username || activeSession.email}.`
    : '';
  if (signedIn) {
    accountRole = activeSession.role;
    profileRoleFields();
  }
  sellerDashboardLink.hidden = !signedIn || activeSession.role !== 'seller';
  updateAccountButton();
}

function profileRoleFields() {
  const seller = activeSession?.role === 'seller';
  document.querySelector('#profile-shop-name-field').hidden = !seller;
  document.querySelector('#profile-phone-field').hidden = seller;
  document.querySelector('#profile-address-field').hidden = seller;
  document.querySelector('#store-banner-field').hidden = !seller;
  document.querySelector('#profile-phone').required = !seller;
  document.querySelector('#profile-address').required = !seller;
}

function openAccount(role = 'shopper', mode = 'signin', trigger = accountButton) {
  accountRole = activeSession?.role || (role === 'seller' ? 'seller' : 'shopper');
  accountMode = mode === 'signup' ? 'signup' : 'signin';
  accountView = 'auth';
  returnFocus = trigger;
  setMessage(accountMessage, '');
  setMessage(profileMessage, '');
  setMessage(passwordMessage, '');
  renderAccountDialog();
  if (!accountDialog.open) accountDialog.showModal();
  if (activeSession) {
    document.querySelector('#profile-username').focus();
  } else if (accountMode === 'signup' && accountRole === 'seller') {
    accountName.focus();
  } else {
    accountEmail.focus();
  }
}

async function getClient() {
  if (supabase) return supabase;
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    throw new Error('Supabase is not configured. Add the project URL and publishable key to supabase-config.js.');
  }
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
  supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: true, persistSession: true, detectSessionInUrl: true }
  });
  return supabase;
}

function authRedirectUrl(search = '') {
  const url = new URL('./index.html', window.location.href);
  url.search = search;
  return url.toString();
}

function continueToSellerDashboard() {
  if (new URLSearchParams(window.location.search).get('seller-login') !== '1'
    || activeSession?.role !== 'seller') return false;
  window.location.replace('seller.html');
  return true;
}

async function fetchProfile(userId) {
  const client = await getClient();
  const { data, error } = await client
    .from('profiles')
    .select('user_id, role, username, shop_name, phone, delivery_address, location, profile_image_path, store_banner_path')
    .eq('user_id', userId)
    .single();
  if (error) throw new Error(`Could not load your profile: ${error.message}`);
  return data;
}

async function syncSession(session) {
  if (!session?.user) {
    activeSession = null;
    accountView = 'auth';
    updateAccountButton();
    renderAccountDialog();
    return;
  }

  const profile = await fetchProfile(session.user.id);
  activeSession = { id: session.user.id, email: session.user.email, role: profile.role, profile };
  accountRole = profile.role;
  populateProfileForm(profile, session.user.email);
  renderAccountDialog();
}

async function signUp() {
  const client = await getClient();
  const name = accountRole === 'seller' ? accountName.value.trim() : '';
  const shopName = accountRole === 'seller' ? accountShop.value.trim() : '';
  const email = accountEmail.value.trim().toLowerCase();
  const phone = accountRole === 'shopper' ? accountPhone.value.trim() : '';
  const address = accountRole === 'shopper' ? accountAddress.value.trim() : '';
  const password = accountPassword.value;

  if (accountRole === 'seller' && name.length < 2) throw new Error('Enter your name to create a seller account.');
  if (accountRole === 'seller' && shopName.length < 2) throw new Error('Enter a shop name to continue.');
  if (accountRole === 'shopper' && !phone) throw new Error('Enter a phone number for delivery updates.');
  if (accountRole === 'shopper' && address.length < 5) throw new Error('Enter your delivery address.');
  if (password.length < PASSWORD_MIN_LENGTH) throw new Error('Use a password with at least 8 characters.');
  if (password !== accountConfirm.value) throw new Error('Your passwords do not match.');

  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: authRedirectUrl(accountRole === 'seller' ? '?seller-login=1' : ''),
      data: {
        role: accountRole,
        username: name || email.split('@')[0],
        shop_name: shopName,
        phone,
        delivery_address: address
      }
    }
  });
  if (error) throw new Error(error.message);
  accountForm.reset();
  if (data.session) {
    await syncSession(data.session);
    if (continueToSellerDashboard()) return;
    setMessage(profileMessage, 'Your account is ready.');
  } else {
    accountMode = 'signin';
    accountView = 'auth';
    renderAccountDialog();
    setMessage(accountMessage, 'Check your email to confirm your account, then sign in.');
  }
}

async function signIn() {
  const client = await getClient();
  const { data, error } = await client.auth.signInWithPassword({
    email: accountEmail.value.trim().toLowerCase(),
    password: accountPassword.value
  });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Sign-in did not create a session. Confirm your email and try again.');

  const profile = await fetchProfile(data.session.user.id);
  if (profile.role !== accountRole) {
    await client.auth.signOut();
    accountForm.reset();
    throw new Error(`This email is registered as a ${profile.role}, not a ${accountRole}. Choose the matching account type.`);
  }
  accountForm.reset();
  await syncSession(data.session);
  continueToSellerDashboard();
}

async function requestPasswordReset() {
  const client = await getClient();
  const email = document.querySelector('#forgot-email').value.trim().toLowerCase();
  const redirectTo = new URL(`${authRedirectUrl()}?password-reset=1`).toString();
  const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
  if (error) throw new Error(error.message);
  setMessage(document.querySelector('#forgot-message'), 'If an account exists for that email, a password reset link has been sent.');
}

async function finishPasswordReset(password, confirmation) {
  if (password.length < PASSWORD_MIN_LENGTH) throw new Error('Use a password with at least 8 characters.');
  if (password !== confirmation) throw new Error('Your passwords do not match.');
  const client = await getClient();
  const { data, error } = await client.auth.updateUser({ password });
  if (error) throw new Error(error.message);
  if (!data.user) throw new Error('Password changed, but the recovery session is missing. Sign in with your new password.');
  const { data: sessionData, error: sessionError } = await client.auth.getSession();
  if (sessionError) throw new Error(`Password changed, but the session could not be refreshed: ${sessionError.message}`);
  accountView = 'auth';
  if (sessionData.session) await syncSession(sessionData.session);
  window.history.replaceState(null, '', window.location.pathname);
  setMessage(profileMessage, 'Your password has been reset.');
}

function populateProfileForm(profile, email) {
  document.querySelector('#profile-email').textContent = email || '';
  document.querySelector('#profile-username').value = profile.username || '';
  document.querySelector('#profile-shop-name').value = profile.shop_name || '';
  document.querySelector('#profile-phone').value = profile.phone || '';
  document.querySelector('#profile-address').value = profile.delivery_address || '';
  document.querySelector('#profile-location').value = profile.location || '';
  selectedAvatar = null;
  selectedBanner = null;
  clearImagePreviewUrls();
  void renderStoredImage(profile.profile_image_path, profileAvatar, 'Profile picture');
  void renderStoredImage(profile.store_banner_path, profileBanner, 'Store banner');
}

function clearImagePreviewUrls() {
  if (avatarObjectUrl) URL.revokeObjectURL(avatarObjectUrl);
  if (bannerObjectUrl) URL.revokeObjectURL(bannerObjectUrl);
  avatarObjectUrl = null;
  bannerObjectUrl = null;
}

async function renderStoredImage(path, image, alt) {
  image.removeAttribute('src');
  image.alt = alt;
  image.hidden = !path;
  if (!path) return;
  try {
    const client = await getClient();
    const { data, error } = await client.storage.from(PROFILE_BUCKET).createSignedUrl(path, 3600);
    if (error) throw new Error(error.message);
    image.src = data.signedUrl;
    image.hidden = false;
  } catch (error) {
    console.error(`Could not load ${alt.toLowerCase()}.`, error);
    setMessage(profileMessage, `Could not load ${alt.toLowerCase()}: ${error.message}`, true);
  }
}

function previewImage(input, image, kind) {
  const file = input.files?.[0] || null;
  if (kind === 'avatar') selectedAvatar = file;
  else selectedBanner = file;
  const currentUrl = kind === 'avatar' ? avatarObjectUrl : bannerObjectUrl;
  if (currentUrl) URL.revokeObjectURL(currentUrl);
  if (!file) {
    const path = kind === 'avatar'
      ? activeSession?.profile.profile_image_path
      : activeSession?.profile.store_banner_path;
    void renderStoredImage(path, image, kind === 'avatar' ? 'Profile picture' : 'Store banner');
    if (kind === 'avatar') avatarObjectUrl = null;
    else bannerObjectUrl = null;
    return;
  }
  const objectUrl = URL.createObjectURL(file);
  image.src = objectUrl;
  image.hidden = false;
  if (kind === 'avatar') avatarObjectUrl = objectUrl;
  else bannerObjectUrl = objectUrl;
}

function validateImage(file, maxSize, label) {
  if (!file) return;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/avif'].includes(file.type)) {
    throw new Error(`${label} must be a JPG, PNG, WebP, or AVIF image.`);
  }
  if (file.size > maxSize) throw new Error(`${label} must be smaller than ${Math.round(maxSize / 1024 / 1024)} MB.`);
}

async function uploadImage(file, kind) {
  if (!file) return null;
  const client = await getClient();
  const extension = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${activeSession.id}/${kind}/${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from(PROFILE_BUCKET).upload(path, file, {
    cacheControl: '3600',
    contentType: file.type,
    upsert: false
  });
  if (error) throw new Error(`Could not upload ${kind.replace('-', ' ')}: ${error.message}`);
  return path;
}

async function saveProfile() {
  const client = await getClient();
  const profile = activeSession.profile;
  const username = document.querySelector('#profile-username').value.trim();
  const isSeller = activeSession.role === 'seller';
  const shopName = document.querySelector('#profile-shop-name').value.trim();
  if (username.length < 2) throw new Error('Username must be at least 2 characters.');
  if (isSeller && shopName.length < 2) throw new Error('Shop name must be at least 2 characters.');
  if (!isSeller && !document.querySelector('#profile-phone').value.trim()) {
    throw new Error('Enter a phone number for delivery updates.');
  }
  if (!isSeller && document.querySelector('#profile-address').value.trim().length < 5) {
    throw new Error('Enter your delivery address.');
  }
  validateImage(selectedAvatar, MAX_AVATAR_SIZE, 'Profile picture');
  validateImage(selectedBanner, MAX_BANNER_SIZE, 'Store banner');

  const newAvatarPath = selectedAvatar ? await uploadImage(selectedAvatar, 'profile-picture') : profile.profile_image_path;
  const newBannerPath = selectedBanner ? await uploadImage(selectedBanner, 'store-banner') : profile.store_banner_path;
  const updates = {
    username,
    shop_name: isSeller ? shopName : null,
    phone: isSeller ? null : document.querySelector('#profile-phone').value.trim(),
    delivery_address: isSeller ? null : document.querySelector('#profile-address').value.trim(),
    location: document.querySelector('#profile-location').value.trim(),
    profile_image_path: newAvatarPath,
    store_banner_path: isSeller ? newBannerPath : null
  };

  const { data, error } = await client
    .from('profiles')
    .update(updates)
    .eq('user_id', activeSession.id)
    .select('user_id, role, username, shop_name, phone, delivery_address, location, profile_image_path, store_banner_path')
    .single();
  if (error) throw new Error(`Could not save your profile: ${error.message}`);

  const replacedPaths = [
    selectedAvatar && profile.profile_image_path,
    selectedBanner && profile.store_banner_path
  ].filter(Boolean);
  activeSession.profile = data;
  populateProfileForm(data, activeSession.email);
  renderAccountDialog();
  if (replacedPaths.length) {
    const { error: cleanupError } = await client.storage.from(PROFILE_BUCKET).remove(replacedPaths);
    if (cleanupError) {
      console.error('Profile was saved, but replaced image files could not be removed.', cleanupError);
      setMessage(profileMessage, 'Profile saved. A previous image could not be removed from storage.', true);
      return;
    }
  }
  setMessage(profileMessage, 'Your profile has been saved.');
}

async function changePassword() {
  const currentPassword = document.querySelector('#current-password').value;
  const newPassword = document.querySelector('#new-password').value;
  const confirmation = document.querySelector('#confirm-new-password').value;
  if (newPassword.length < PASSWORD_MIN_LENGTH) throw new Error('Use a new password with at least 8 characters.');
  if (newPassword !== confirmation) throw new Error('Your new passwords do not match.');
  if (newPassword === currentPassword) throw new Error('Choose a password different from your current one.');

  const client = await getClient();
  const { error: verifyError } = await client.auth.signInWithPassword({
    email: activeSession.email,
    password: currentPassword
  });
  if (verifyError) throw new Error('Your current password is incorrect.');
  const { error } = await client.auth.updateUser({ password: newPassword });
  if (error) throw new Error(`Could not change your password: ${error.message}`);
  passwordForm.reset();
  setMessage(passwordMessage, 'Your password has been changed.');
}

async function handleForm(form, messageTarget, operation, progressMessage) {
  const submit = form.querySelector('button[type="submit"]');
  if (!form.reportValidity()) return;
  submit.disabled = true;
  setMessage(messageTarget, progressMessage);
  try {
    await operation();
  } catch (error) {
    console.error('Could not complete the account action.', error);
    setMessage(messageTarget, error instanceof Error ? error.message : 'Could not complete this account action.', true);
  } finally {
    submit.disabled = false;
  }
}

async function handlePasswordRecovery(session) {
  if (recoveryFlowStarted) return;
  recoveryFlowStarted = true;
  if (!session?.user) {
    accountView = 'auth';
    setMessage(accountMessage, 'The password reset link is invalid or expired. Request a new one.', true);
    return;
  }
  try {
    const profile = await fetchProfile(session.user.id);
    activeSession = { id: session.user.id, email: session.user.email, role: profile.role, profile };
    accountRole = profile.role;
  } catch (error) {
    console.error('Could not load the account for password recovery.', error);
  }
  accountView = 'reset';
  renderAccountDialog();
  if (!accountDialog.open) accountDialog.showModal();
  document.querySelector('#reset-password').focus();
}

accountButton?.addEventListener('click', event => {
  openAccount(activeSession?.role || 'shopper', 'signin', event.currentTarget);
});

document.querySelectorAll('[data-account-open]').forEach(link => {
  link.addEventListener('click', event => {
    event.preventDefault();
    openAccount(link.dataset.accountOpen, link.dataset.accountMode, link);
  });
});

accountRoleButtons.forEach(button => {
  button.addEventListener('click', () => {
    accountRole = button.dataset.accountRole;
    setMessage(accountMessage, '');
    renderAccountDialog();
  });
});

accountModeButtons.forEach(button => {
  button.addEventListener('click', () => {
    accountMode = button.dataset.accountMode;
    setMessage(accountMessage, '');
    renderAccountDialog();
  });
});

accountForm.addEventListener('submit', event => {
  event.preventDefault();
  void handleForm(accountForm, accountMessage, accountMode === 'signup' ? signUp : signIn, 'Connecting securely…');
});

document.querySelector('#forgot-password-link').addEventListener('click', () => {
  accountView = 'forgot';
  document.querySelector('#forgot-email').value = accountEmail.value.trim();
  setMessage(document.querySelector('#forgot-message'), '');
  renderAccountDialog();
  document.querySelector('#forgot-email').focus();
});

document.querySelector('#back-to-signin').addEventListener('click', () => {
  accountView = 'auth';
  accountMode = 'signin';
  setMessage(accountMessage, '');
  renderAccountDialog();
  accountEmail.focus();
});

forgotForm.addEventListener('submit', event => {
  event.preventDefault();
  void handleForm(forgotForm, document.querySelector('#forgot-message'), requestPasswordReset, 'Sending a reset link…');
});

resetForm.addEventListener('submit', event => {
  event.preventDefault();
  void handleForm(resetForm, document.querySelector('#reset-message'), () => finishPasswordReset(
    document.querySelector('#reset-password').value,
    document.querySelector('#confirm-reset-password').value
  ), 'Updating your password…');
});

profileForm.addEventListener('submit', event => {
  event.preventDefault();
  void handleForm(profileForm, profileMessage, saveProfile, 'Saving your profile…');
});

passwordForm.addEventListener('submit', event => {
  event.preventDefault();
  void handleForm(passwordForm, passwordMessage, changePassword, 'Verifying your current password…');
});

avatarInput.addEventListener('change', () => previewImage(avatarInput, profileAvatar, 'avatar'));
bannerInput.addEventListener('change', () => previewImage(bannerInput, profileBanner, 'banner'));

document.querySelector('#account-signout').addEventListener('click', async () => {
  try {
    const client = await getClient();
    const { error } = await client.auth.signOut();
    if (error) throw new Error(error.message);
    activeSession = null;
    accountView = 'auth';
    accountMode = 'signin';
    setMessage(accountMessage, '');
    renderAccountDialog();
    accountEmail.focus();
  } catch (error) {
    console.error('Could not sign out.', error);
    setMessage(profileMessage, error instanceof Error ? error.message : 'Could not sign out.', true);
  }
});

document.querySelector('#close-account').addEventListener('click', () => accountDialog.close());
accountDialog.addEventListener('click', event => {
  if (event.target === accountDialog) accountDialog.close();
});
accountDialog.addEventListener('close', () => {
  clearImagePreviewUrls();
  selectedAvatar = null;
  selectedBanner = null;
  accountForm.reset();
  forgotForm.reset();
  resetForm.reset();
  passwordForm.reset();
  avatarInput.value = '';
  bannerInput.value = '';
  if (activeSession) populateProfileForm(activeSession.profile, activeSession.email);
  if (returnFocus?.isConnected) returnFocus.focus();
});
accountDialog.addEventListener('cancel', event => {
  event.preventDefault();
  accountDialog.close();
});

async function initializeAuth() {
  try {
    const client = await getClient();
    client.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        window.setTimeout(() => { void handlePasswordRecovery(session); }, 0);
      }
    });
    const { data, error } = await client.auth.getSession();
    if (error) throw new Error(error.message);
    if (data.session) await syncSession(data.session);
    const params = new URLSearchParams(window.location.search);
    if (params.get('seller-login') === '1') {
      if (continueToSellerDashboard()) return;
      if (activeSession) {
        openAccount(activeSession.role, 'signin');
        setMessage(profileMessage, 'This is a shopper account. Sign out, then sign in or create a seller account to continue.', true);
      } else {
        openAccount('seller', params.get('create-account') === '1' ? 'signup' : 'signin');
      }
      return;
    }
    if (new URLSearchParams(window.location.search).has('password-reset')) {
      if (data.session) {
        await handlePasswordRecovery(data.session);
      } else {
        setMessage(accountMessage, 'The password reset link is invalid or expired. Request a new one.', true);
        accountDialog.showModal();
      }
    }
  } catch (error) {
    console.error('Could not initialize Supabase authentication.', error);
    setMessage(accountMessage, `Account service is unavailable: ${error instanceof Error ? error.message : 'unknown error'}`, true);
  }
}

void initializeAuth();

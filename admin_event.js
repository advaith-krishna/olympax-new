const CONFIG = {
  tableName: 'events',
  bucketName: 'events',
  columns: {
    title: 'title',
    category: 'category',
    date: 'date',
    location: 'location',
    description: 'description',
    imageUrl: 'image_url'
  }
};

const loginGate = document.getElementById('login-gate');
const adminPanel = document.getElementById('admin-panel');
const loginForm = document.getElementById('login-form');
const eventForm = document.getElementById('eventForm');
const loginStatus = document.getElementById('loginStatus');
const formStatus = document.getElementById('formStatus');
const logoutBtn = document.getElementById('logoutBtn');

function showStatus(element, message, isError = false) {
  element.style.display = 'block';
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function clearStatus(element) {
  element.style.display = 'none';
  element.textContent = '';
  element.classList.remove('error');
}

function showLoginGate() {
  loginGate.classList.remove('hidden');
  adminPanel.classList.add('hidden');
}

function showAdminPanel() {
  loginGate.classList.add('hidden');
  adminPanel.classList.remove('hidden');
}

function getSafeFileName(file) {
  const name = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-');
  return `${Date.now()}-${name}`;
}

async function adminLogin(event) {
  if (event) event.preventDefault();

  const email = document.getElementById('adminEmail').value.trim();
  const password = document.getElementById('adminPassword').value;

  if (!email || !password) {
    showStatus(loginStatus, 'Please enter both email and password.', true);
    return;
  }

  try {
    clearStatus(loginStatus);
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) throw error;

    if (data?.session) {
      showAdminPanel();
    } else {
      showStatus(loginStatus, 'Login failed. Please try again.', true);
    }
  } catch (error) {
    showStatus(loginStatus, error.message || 'Login failed.', true);
  }
}

async function adminLogout() {
  try {
    await supabaseClient.auth.signOut();
    showLoginGate();
    eventForm.reset();
    clearStatus(formStatus);
  } catch (error) {
    showStatus(formStatus, 'Logout failed.', true);
  }
}

async function uploadEventImage(file) {
  if (!file) throw new Error('Please choose an image file.');

  const safeFileName = getSafeFileName(file);

  const { error: uploadError } = await supabaseClient.storage
    .from(CONFIG.bucketName)
    .upload(safeFileName, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data: urlData } = supabaseClient.storage.from(CONFIG.bucketName).getPublicUrl(safeFileName);
  return urlData?.publicUrl || '';
}

async function saveEventRecord(eventData) {
  const { error } = await supabaseClient.from(CONFIG.tableName).insert([eventData]);
  if (error) throw error;
}

async function handleEventFormSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('title').value.trim();
  const category = document.getElementById('category').value.trim();
  const date = document.getElementById('date').value;
  const location = document.getElementById('location').value.trim();
  const description = document.getElementById('description').value.trim();
  const imageFile = document.getElementById('image').files[0];

  if (!title || !category || !date || !location || !description || !imageFile) {
    showStatus(formStatus, 'Please fill in all fields and select an image.', true);
    return;
  }

  try {
    showStatus(formStatus, 'Uploading image to Supabase Storage...');
    const imageUrl = await uploadEventImage(imageFile);

    const eventRecord = {
      [CONFIG.columns.title]: title,
      [CONFIG.columns.category]: category,
      [CONFIG.columns.date]: date,
      [CONFIG.columns.location]: location,
      [CONFIG.columns.description]: description,
      [CONFIG.columns.imageUrl]: imageUrl
    };

    showStatus(formStatus, 'Saving event to Supabase...');
    await saveEventRecord(eventRecord);

    eventForm.reset();
    showStatus(formStatus, 'Event saved successfully.');
  } catch (error) {
    showStatus(formStatus, error.message || 'Could not save event.', true);
  }
}

async function initializeEventAdminPage() {
  loginForm.addEventListener('submit', adminLogin);
  logoutBtn.addEventListener('click', adminLogout);
  eventForm.addEventListener('submit', handleEventFormSubmit);

  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) showAdminPanel(); else showLoginGate();
}

window.addEventListener('DOMContentLoaded', initializeEventAdminPage);

async function adminLogin() {
  const emailInput = document.getElementById('adminEmail');
  const passwordInput = document.getElementById('adminPassword');
  const loginStatus = document.getElementById('loginStatus');

  const email = emailInput ? emailInput.value.trim() : '';
  const password = passwordInput ? passwordInput.value : '';

  if (loginStatus) {
    loginStatus.textContent = '';
  }

  if (!email || !password) {
    if (loginStatus) {
      loginStatus.textContent = 'Please enter both email and password.';
    }
    return;
  }

  const { error } = await supabaseClient.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    if (loginStatus) {
      loginStatus.textContent = error.message;
    }
    return;
  }

  showAdminPanel();
}

async function adminLogout() {
  await supabaseClient.auth.signOut();
  showLoginGate();
}

function showAdminPanel() {
  const loginGate = document.getElementById('login-gate');
  const adminPanel = document.getElementById('admin-panel');
  const loginStatus = document.getElementById('loginStatus');

  if (loginGate) {
    loginGate.style.display = 'none';
  }

  if (adminPanel) {
    adminPanel.style.display = 'block';
  }

  if (loginStatus) {
    loginStatus.textContent = '';
  }
}

function showLoginGate() {
  const loginGate = document.getElementById('login-gate');
  const adminPanel = document.getElementById('admin-panel');

  if (loginGate) {
    loginGate.style.display = 'block';
  }

  if (adminPanel) {
    adminPanel.style.display = 'none';
  }
}

function setStatus(message, isError = false) {
  const formStatus = document.getElementById('formStatus');

  if (!formStatus) {
    return;
  }

  formStatus.textContent = message;
  formStatus.style.color = isError ? '#ff6b6b' : 'var(--text)';
  formStatus.style.background = isError ? 'rgba(255,107,107,0.12)' : 'rgba(61,214,208,0.08)';
  formStatus.style.borderColor = isError ? 'rgba(255,107,107,0.25)' : 'rgba(61,214,208,0.25)';
}

function getSafeFileName(file) {
  const name = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').replace(/-+/g, '-');
  return `${Date.now()}-${name}`;
}

async function uploadProductImage(file, fileName) {
  const bucketName = 'products';

  if (!file || !fileName) {
    throw new Error('Please provide both a file and a file name.');
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please select an image file.');
  }

  const { error } = await supabaseClient
    .storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    throw error;
  }

  return fileName;
}

async function saveProductRecord(productData) {
  const { data, error } = await supabaseClient
    .from('products')
    .insert([productData]);

  if (error) {
    throw error;
  }

  return data;
}

async function handleProductFormSubmit(event) {
  event.preventDefault();

  const productForm = document.getElementById('productForm');

  if (!productForm) {
    return;
  }

  const { data: { session } } = await supabaseClient.auth.getSession();

  if (!session) {
    showLoginGate();
    setStatus('Please log in before saving products.', true);
    return;
  }

  const name = productForm.name.value.trim();
  const category = productForm.category.value.trim();
  const price = parseFloat(productForm.price.value);
  const stock = parseInt(productForm.stock.value, 10);
  const description = productForm.description.value.trim();
  const imageFile = productForm.image.files[0];

  if (!name || !category || Number.isNaN(price) || Number.isNaN(stock) || !description || !imageFile) {
    setStatus('Please fill in all fields and select an image.', true);
    return;
  }

  if (imageFile.size > 5 * 1024 * 1024) {
    setStatus('Image file is too large. Please choose a file under 5MB.', true);
    return;
  }

  const fileName = getSafeFileName(imageFile);

  try {
    setStatus('Uploading image to Supabase Storage...');
    const uploadedFileName = await uploadProductImage(imageFile, fileName);

    setStatus('Saving product details...');

    await saveProductRecord({
      name,
      category,
      price,
      stock,
      description,
      image_url: uploadedFileName,
      created_at: new Date().toISOString(),
    });

    setStatus('Product saved successfully!');
    productForm.reset();
  } catch (error) {
    console.error('Admin product save failed:', error);
    setStatus('Unable to save product. Check the console for details.', true);
  }
}

async function initializeAdminPage() {
  const { data: { session } } = await supabaseClient.auth.getSession();

  if (session) {
    showAdminPanel();
  } else {
    showLoginGate();
  }

  const productForm = document.getElementById('productForm');

  if (productForm) {
    productForm.addEventListener('submit', handleProductFormSubmit);
  }
}

window.adminLogin = adminLogin;
window.adminLogout = adminLogout;
window.showAdminPanel = showAdminPanel;
window.showLoginGate = showLoginGate;

window.addEventListener('DOMContentLoaded', initializeAdminPage);

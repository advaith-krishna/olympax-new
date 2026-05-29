const productForm = document.getElementById('productForm');
const formStatus = document.getElementById('formStatus');

function setStatus(message, isError = false) {
  if (!formStatus) return;
  formStatus.textContent = message;
  formStatus.style.color = isError ? '#ff6b6b' : 'var(--text)';
  formStatus.style.background = isError ? 'rgba(255,107,107,0.12)' : 'rgba(61,214,208,0.08)';
  formStatus.style.borderColor = isError ? 'rgba(255,107,107,0.25)' : 'rgba(61,214,208,0.25)';
}

function getSafeFileName(file) {
  const name = file.name.toLowerCase().replace(/[^a-z0-9\.]+/g, '-').replace(/-+/g, '-');
  return `${Date.now()}-${name}`;
}

async function saveProductRecord(productData) {
  const { data, error } = await supabaseClient.from('products').insert([productData]);
  if (error) {
    throw error;
  }
  return data;
}

async function handleProductFormSubmit(event) {
  event.preventDefault();

  if (!productForm) return;

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

    if (!uploadedFileName) {
      throw new Error('Image upload failed.');
    }

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

if (productForm) {
  productForm.addEventListener('submit', handleProductFormSubmit);
}

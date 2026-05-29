// Beginner-friendly Supabase setup for plain JavaScript
// Replace the values below with your own Supabase project URL and anon public key.

const SUPABASE_URL = 'https://lqgxrgwoxagxlahoexck.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZ3hyZ3dveGFneGxhaG9leGNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTkzMDksImV4cCI6MjA5NDY5NTMwOX0.672ifClklbNVpIcxEGSw2N5MJXSWDXE911d26K9pLlI';

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * PRODUCT IMAGE SETUP GUIDE FOR BEGINNERS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * OPTION 1: Using Supabase Storage (Recommended for Beginners)
 * ─────────────────────────────────────────────────────────
 * 1. Upload images to Supabase Storage in a 'products' bucket
 * 2. In your database, store just the FILENAME (e.g., "shirt.jpg")
 * 3. Set the image_url field to this filename
 * 4. The code will automatically generate the public URL
 * 
 * OPTION 2: Using External URLs
 * ──────────────────────────────
 * 1. Upload images anywhere (Cloudinary, Imgix, etc.)
 * 2. In your database, store the FULL URL (e.g., "https://...")
 * 3. Set the image_url field to this full URL
 * 4. The code will use it directly
 * 
 * DATABASE SETUP:
 * ───────────────
 * In your 'products' table, add:
 * - image_url (TEXT column)
 * 
 * For Supabase Storage, set image_url to: filename.jpg
 * For external URLs, set image_url to: https://example.com/image.jpg
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */

// Create a shared Supabase client.
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
/**
 * Fetch all products from the database.
 * 
 * Returns an array of product objects with fields like:
 * - id, name, description, price, category, image_url
 * 
 * Returns an empty array if:
 * - Connection fails
 * - Table doesn't exist
 * - No products found
 * 
 * @returns {Array} Array of product objects
 */
async function fetchProducts() {
  try {
    const { data, error } = await supabaseClient
      .from('products')
      .select('*');

    if (error) {
      console.error('❌ Failed to fetch products:', error.message);
      return [];
    }

    if (!data || data.length === 0) {
      console.log('ℹ️ No products found in database.');
      return [];
    }

    console.log(`✓ Loaded ${data.length} product(s) from database`, data);
    return data;

  } catch (error) {
    console.error('❌ Unexpected error while fetching products:', error);
    return [];
  }
}

function formatProductPrice(value) {
  if (value == null || value === '') {
    return 'Price not available';
  }

  const number = Number(value);
  if (Number.isNaN(number)) {
    return value;
  }

  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(number);
}

/**
 * Get the complete image URL for a product.
 * 
 * This function:
 * 1. Checks the database for image_url field
 * 2. If the URL is a full path (http/https), returns it directly
 * 3. If it's a bucket filename, generates the public Supabase URL
 * 4. Returns empty string if no image found (will trigger fallback in render)
 * 
 * @param {Object} product - The product object from the database
 * @returns {string} Complete public image URL or empty string
 */
function getProductImageUrl(product) {
  // Try multiple field names for flexibility (image_url, image, imageUrl, photo)
  const imageUrl = product.image_url || product.image || product.imageUrl || product.photo || '';
  
  // No image found - will use fallback placeholder
  if (!imageUrl) {
    return '';
  }
  
  // If it's already a full URL (starts with http/https), return as-is
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Otherwise, it's a filename in Supabase storage bucket
  // Generate the public URL for the 'products' bucket
  try {
    const { data } = supabaseClient.storage.from('products').getPublicUrl(imageUrl);
    return data?.publicUrl || '';
  } catch (error) {
    // If something goes wrong, fall back to empty string
    console.warn('Error getting image URL for bucket file:', error);
    return '';
  }
}

/**
 * Placeholder image to show when product images fail to load.
 * This is a simple placeholder image from a public CDN.
 * You can replace this URL with any image URL you prefer.
 */
const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400x300?text=No+Image';

/**
 * Render all product cards to the DOM.
 * 
 * For each product:
 * 1. Gets the image URL (with Supabase bucket support)
 * 2. Creates a card with image, name, category, and price
 * 3. Adds error handling for broken images (uses fallback)
 * 4. Displays "no products" message if list is empty
 * 
 * @param {Array} products - Array of product objects from Supabase
 */
function renderProducts(products) {
  const container = document.getElementById('products-grid');

  if (!container) {
    return;
  }

  container.innerHTML = '';

  if (!products || products.length === 0) {
    const emptyMessage = document.createElement('div');
    emptyMessage.textContent = 'No products are available at the moment. Please check back soon.';
    emptyMessage.style.color = 'var(--muted)';
    emptyMessage.style.textAlign = 'center';
    emptyMessage.style.padding = '2rem 1rem';
    emptyMessage.style.gridColumn = '1 / -1';
    container.appendChild(emptyMessage);
    return;
  }

  products.forEach((product) => {
    const card = document.createElement('div');
    card.className = 'product-card';

    // ─── IMAGE WRAPPER ───
    const imageWrapper = document.createElement('div');
    imageWrapper.className = 'product-image';

    const image = document.createElement('img');
    
    // Get the product image URL (supports both direct URLs and Supabase bucket files)
    const productImageUrl = getProductImageUrl(product);
    const fallbackImageUrl = FALLBACK_IMAGE_URL;
    
    // Set the primary image URL
    image.src = productImageUrl || fallbackImageUrl;
    image.alt = product.name ? `${product.name} product image` : 'Product image';
    
    /**
     * Handle image loading errors.
     * If the primary image fails to load, show the fallback image.
     * This is important because Supabase URLs might occasionally be unavailable.
     */
    image.onerror = function() {
      console.warn(`Failed to load image for product: ${product.name || 'Unknown'}`);
      // Only change to fallback if not already showing fallback
      if (this.src !== fallbackImageUrl) {
        this.src = fallbackImageUrl;
      }
    };
    
    imageWrapper.appendChild(image);
    card.appendChild(imageWrapper);

    // ─── PRODUCT INFO ───
    const info = document.createElement('div');
    info.style.padding = '16px';
    info.style.display = 'flex';
    info.style.flexDirection = 'column';
    info.style.gap = '8px';

    // Product name
    const name = document.createElement('h4');
    name.textContent = product.name || 'Unnamed product';
    name.style.margin = '0';
    name.style.fontSize = '1.05rem';
    name.style.fontWeight = '700';
    info.appendChild(name);

    // Product category
    const category = document.createElement('div');
    category.textContent = product.category ? product.category : 'Uncategorized';
    category.style.color = 'var(--muted)';
    category.style.fontSize = '0.85rem';
    category.style.textTransform = 'uppercase';
    category.style.letterSpacing = '0.08em';
    category.style.fontWeight = '700';
    info.appendChild(category);

    // Product price
    const price = document.createElement('div');
    price.textContent = formatProductPrice(product.price);
    price.style.marginTop = 'auto';
    price.style.fontWeight = '700';
    price.style.color = 'var(--gold)';
    info.appendChild(price);

    card.appendChild(info);
    container.appendChild(card);
  });
}

async function loadProducts() {
  const productsGrid = document.getElementById('products-grid');

  if (!productsGrid) {
    return;
  }

  const products = await fetchProducts();
  renderProducts(products);
}

/**
 * Upload a product image file to Supabase Storage (products bucket).
 * 
 * HOW TO USE:
 * 1. Get a File from an HTML input: <input type="file" id="imageInput" accept="image/*">
 * 2. Call this function:
 *    const file = document.getElementById('imageInput').files[0];
 *    const url = await uploadProductImage(file, 'my-product-image.jpg');
 * 3. Store the returned URL filename in your database's image_url field
 * 
 * @param {File} file - A browser File object (from file input)
 * @param {string} fileName - What to name the file in storage (e.g., 'product-1.jpg')
 * @returns {string} The public URL of the uploaded image, or null if upload fails
 * 
 * EXAMPLE:
 * ────────
 * const file = document.getElementById('imageInput').files[0];
 * const imageUrl = await uploadProductImage(file, 'new-shirt.jpg');
 * // imageUrl will be something like: "https://...supabase.co/storage/v1/object/public/products/new-shirt.jpg"
 * // Store just "new-shirt.jpg" in your database's image_url field
 */
async function uploadProductImage(file, fileName) {
  const bucketName = 'products';

  // Validate inputs
  if (!file || !fileName) {
    console.error('❌ Please provide both a file and a file name.');
    return null;
  }

  // Validate file is actually an image
  if (!file.type.startsWith('image/')) {
    console.error('❌ Please select an image file (jpg, png, etc.)');
    return null;
  }

  try {
    // Upload the file to Supabase Storage
    const { data, error } = await supabaseClient
      .storage
      .from(bucketName)
      .upload(fileName, file, { 
        cacheControl: '3600',  // Cache for 1 hour
        upsert: false          // Don't overwrite existing files
      });

    if (error) {
      console.error('❌ Upload failed:', error.message);
      return null;
    }

    // Get the public URL for the uploaded file
    const { data: publicUrlData } = supabaseClient
      .storage
      .from(bucketName)
      .getPublicUrl(data.path);

    const publicURL = publicUrlData.publicUrl;
    console.log('✓ Upload successful! Public URL:', publicURL);
    
    // Return just the filename to store in the database
    // (the getProductImageUrl function will generate the full URL)
    return fileName;

  } catch (error) {
    console.error('❌ Unexpected error during upload:', error);
    return null;
  }
}

/**
 * Load and render all products.
 * This is the main function that ties everything together.
 */
async function loadProducts() {
  console.log('⏳ Loading products from Supabase...');
  const products = await fetchProducts();
  renderProducts(products);
}

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * AUTO-LOAD PRODUCTS ON PAGE LOAD
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * This code runs automatically when the page loads and calls loadProducts().
 * This will fetch your products from Supabase and display them on the page.
 * 
 * TROUBLESHOOTING:
 * ────────────────
 * If products don't appear:
 * 1. Check browser console (F12) for error messages
 * 2. Verify your Supabase credentials at the top of this file
 * 3. Make sure your 'products' table exists in Supabase
 * 4. Make sure the 'products' bucket exists in Supabase Storage
 * 5. Check that your #products-grid element exists in HTML
 * 
 * ═══════════════════════════════════════════════════════════════════════════════
 */
// Example startup call for beginner testing.
window.addEventListener('DOMContentLoaded', () => {
  loadProducts();
});

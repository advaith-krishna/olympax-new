# Product Image Setup Guide

## Overview
Your product rendering has been updated to support Supabase Storage bucket images with robust fallback handling and beginner-friendly code.

## Quick Start

### Option 1: Using Supabase Storage (Recommended)

**Step 1: Create Storage Bucket**
1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `products`
3. Make it public (uncheck "Private Bucket")

**Step 2: Upload Product Images**
1. Click the `products` bucket
2. Upload your product images (JPG, PNG, WebP, etc.)
3. Note the filenames (e.g., `shirt-blue.jpg`, `shoe-red.jpg`)

**Step 3: Add to Database**
In your `products` table, add an `image_url` column (TEXT type) and fill it with just the **filename**:

```
id   | name        | price | category | image_url
-----|-------------|-------|----------|------------------
1    | Blue Shirt  | 299   | Clothing | shirt-blue.jpg
2    | Red Shoes   | 499   | Footwear | shoe-red.jpg
```

✓ The code will automatically generate the full public URL!

### Option 2: Using External URLs

If your images are already hosted elsewhere (Cloudinary, AWS S3, etc.):

**Step 1: Get Your Image URLs**
Get the full public URL of your image:
```
https://example.com/images/product-1.jpg
```

**Step 2: Add to Database**
Store the **full URL** in the `image_url` field:

```
id   | name        | price | category | image_url
-----|-------------|-------|----------|---------------------------------------
1    | Blue Shirt  | 299   | Clothing | https://example.com/images/shirt.jpg
2    | Red Shoes   | 499   | Footwear | https://example.com/images/shoes.jpg
```

✓ The code will use the URL directly!

## How It Works

### Image URL Resolution
The code checks the `image_url` field in your database and:

1. **If it's a full URL** (starts with `http://` or `https://`)
   - Uses it directly
   - Example: `https://example.com/image.jpg`

2. **If it's a filename** (no `http`)
   - Generates Supabase Storage public URL
   - Example: `shirt.jpg` → `https://...supabase.co/storage/...products/shirt.jpg`

3. **If empty or missing**
   - Shows a placeholder image
   - If the image fails to load, shows the placeholder as fallback

### Fallback Image Handling

The code handles broken images gracefully:

```javascript
// Current fallback (can be customized):
const FALLBACK_IMAGE_URL = 'https://via.placeholder.com/400x300?text=No+Image';
```

To customize the fallback image, edit line in `supabase.js`:
```javascript
const FALLBACK_IMAGE_URL = 'YOUR_CUSTOM_FALLBACK_URL_HERE';
```

## Field Names

The code looks for images in the following field names (in order):
1. `image_url` (recommended)
2. `image`
3. `imageUrl`
4. `photo`

So you can use any of these field names in your database!

## Error Handling

### What Happens If...

**Image file not found in Supabase?**
- Shows placeholder image automatically

**Database field is empty?**
- Shows placeholder image

**Supabase bucket doesn't exist?**
- Shows placeholder image + console warning

**External image URL is broken?**
- Shows placeholder image automatically

All errors log to browser console for debugging (press F12).

## Uploading Images Programmatically

You can upload images directly from JavaScript:

```javascript
// HTML: <input type="file" id="imageInput" accept="image/*">
// <button onclick="handleImageUpload()">Upload Image</button>

async function handleImageUpload() {
  const fileInput = document.getElementById('imageInput');
  const file = fileInput.files[0];
  
  if (!file) {
    alert('Please select an image first');
    return;
  }
  
  // Upload the image
  const fileName = await uploadProductImage(file, file.name);
  
  if (fileName) {
    console.log('✓ Image uploaded! Store this in your database:');
    console.log('image_url:', fileName);
    
    // Now add this filename to your database product record
  } else {
    alert('❌ Upload failed. Check console for details.');
  }
}
```

## Console Messages

When loading products, you'll see helpful messages:

```
⏳ Loading products from Supabase...
✓ Loaded 5 product(s) from database

✓ Upload successful! Public URL: https://...
❌ Failed to load image for product: Blue Shirt
```

These help you debug any issues!

## Database Schema

Minimum setup for your `products` table:

```
Column Name    | Type   | Required | Example
---------------|--------|----------|------------------------
id             | UUID   | Yes      | auto-generated
name           | TEXT   | Yes      | "Blue Shirt"
price          | NUMBER | Yes      | 299
image_url      | TEXT   | No       | "shirt-blue.jpg"
category       | TEXT   | No       | "Clothing"
description    | TEXT   | No       | "Comfortable blue shirt"
```

## Troubleshooting

### Images Not Showing?

1. **Check console messages** (Press F12 → Console tab)
2. **Verify Supabase URL and Key** at top of `supabase.js`
3. **Make sure `products` bucket exists** and is set to public
4. **Check `image_url` field** contains correct filename or URL
5. **Test with a full external URL first** to verify code works

### Upload Fails?

- Check file size (keep images under 5MB)
- Ensure file is a valid image (JPG, PNG, WebP, etc.)
- Verify `products` bucket exists and is public
- Check browser console for error messages

### Placeholder Always Shows?

- Check if image filename/URL is correct in database
- Try uploading a test image and see if it works
- Check Supabase Storage for the file actually existing
- Look at browser console (F12) for specific error

## Code Overview

### Key Functions

**`getProductImageUrl(product)`**
- Takes a product object
- Returns the complete public image URL
- Handles both Supabase filenames and external URLs

**`renderProducts(products)`**
- Creates HTML cards for each product
- Includes error handling for broken images
- Displays fallback if needed

**`uploadProductImage(file, fileName)`**
- Upload image to Supabase Storage
- Returns filename to store in database

**`loadProducts()`**
- Fetches all products from database
- Renders them on page load

## Security Note

The `products` bucket and database are readable by anyone with your Supabase key (which is public, that's fine for read-only). For write operations, you should add proper authentication. But for displaying products, this is secure!

---

**Questions?** Check the comments in `supabase.js` - they explain everything step by step!

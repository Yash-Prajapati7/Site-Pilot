import { v2 as cloudinary } from 'cloudinary';

// Configuration is auto-loaded from env vars by the server entry point,
// but we explicitly call config here so this module is self-contained.
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} fileBuffer - The raw file data from multer.
 * @param {string} folder     - Cloudinary folder path (e.g. "site-pilot/logos").
 * @returns {Promise<string>}   The secure HTTPS URL of the uploaded asset.
 */
export async function uploadToCloudinary(fileBuffer, folder = 'site-pilot') {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'auto' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

/**
 * Delete an asset from Cloudinary by its public URL.
 * Extracts the public_id from a typical Cloudinary URL.
 */
export async function deleteFromCloudinary(secureUrl) {
  try {
    // Extract public_id from URL like https://res.cloudinary.com/<cloud>/image/upload/v123/folder/filename.ext
    const parts = secureUrl.split('/upload/');
    if (parts.length < 2) return;
    const publicIdWithExt = parts[1].replace(/^v\d+\//, '');  // strip version
    const publicId = publicIdWithExt.replace(/\.[^/.]+$/, ''); // strip extension
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
  }
}

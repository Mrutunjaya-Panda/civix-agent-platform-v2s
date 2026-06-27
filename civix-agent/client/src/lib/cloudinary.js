import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file client-side and uploads it to Cloudinary using an unsigned preset.
 * 
 * @param {File} file - The image file from an <input type="file">
 * @returns {Promise<string>} The secure URL of the uploaded image
 */
export async function uploadImage(file) {
  if (!file) throw new Error('No file provided for upload.');

  // 1. Compress the image client-side to save bandwidth and Cloudinary storage
  const options = {
    maxSizeMB: 1, // Max file size in MB
    maxWidthOrHeight: 1200, // Max width/height to resize to
    useWebWorker: true,
  };

  let compressedFile;
  try {
    compressedFile = await imageCompression(file, options);
  } catch (error) {
    console.error('[Cloudinary] Image compression failed, falling back to original:', error);
    compressedFile = file; // Fallback to original if compression fails
  }

  // 2. Prepare FormData for Cloudinary API
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !uploadPreset) {
    throw new Error('Cloudinary environment variables are missing (VITE_CLOUDINARY_CLOUD_NAME or VITE_CLOUDINARY_UPLOAD_PRESET)');
  }

  const formData = new FormData();
  formData.append('file', compressedFile);
  formData.append('upload_preset', uploadPreset);

  // 3. Upload to Cloudinary unsigned endpoint
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error?.message || 'Upload failed');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('[Cloudinary] Upload error:', error);
    throw error;
  }
}

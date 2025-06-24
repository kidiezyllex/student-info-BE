import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'drqbhj6ft',
  api_key: process.env.CLOUDINARY_API_KEY || '191952193821284',
  api_secret: process.env.CLOUDINARY_API_SECRET || '23tR5d5GDWA6hycDzydv6zs_HNU'
});

/**
 * Upload file to Cloudinary
 * @param {string} filePath - Path to the file
 * @param {object} options - Upload options
 * @returns {Promise} - Upload result
 */
export const uploadToCloudinary = async (filePath, options = {}) => {
  try {
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Automatically detect file type
      folder: 'student-info', // Organize files in a folder
      use_filename: true,
      unique_filename: false,
      ...options
    });
    
    return {
      success: true,
      url: result.secure_url,
      public_id: result.public_id,
      resource_type: result.resource_type,
      format: result.format,
      bytes: result.bytes,
      width: result.width,
      height: result.height,
      created_at: result.created_at
    };
  } catch (error) {
    console.error('Cloudinary upload error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Public ID of the file to delete
 * @param {string} resourceType - Type of resource (image, video, raw)
 * @returns {Promise} - Delete result
 */
export const deleteFromCloudinary = async (publicId, resourceType = 'image') => {
  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });
    
    return {
      success: true,
      result: result.result
    };
  } catch (error) {
    console.error('Cloudinary delete error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

export default cloudinary; 
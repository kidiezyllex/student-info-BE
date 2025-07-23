import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

/**
 * @desc    Upload single file
 * @route   POST /api/upload/single
 * @access  Private
 */
export const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { file } = req;
    const { folder } = req.body;

    // Define document MIME types that should be treated as 'raw' resources
    const rawDocumentMimeTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'text/csv',
      'application/rtf',
      'application/zip',
      'application/x-rar-compressed',
      'application/x-7z-compressed'
    ];

    let resourceType = 'auto';
    if (rawDocumentMimeTypes.includes(file.mimetype)) {
      resourceType = 'raw';
    }

    // Upload to Cloudinary
    const uploadOptions = {
      folder: folder ? `student-info/${folder}` : 'student-info',
      resource_type: resourceType
    };

    const result = await uploadToCloudinary(file.path, uploadOptions);

    // Clean up temporary file
    fs.unlinkSync(file.path);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to upload file',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        url: result.url,
        public_id: result.public_id,
        resource_type: result.resource_type,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        created_at: result.created_at,
        original_filename: file.originalname,
        mimetype: file.mimetype
      }
    });
  } catch (error) {
    // Clean up temporary file if it exists
    if (req.file && req.file.path) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up temp file:', cleanupError);
      }
    }
    
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Upload multiple files
 * @route   POST /api/upload/multiple
 * @access  Private
 */
export const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { files } = req;
    const { folder } = req.body;
    const uploadResults = [];

    // Upload each file to Cloudinary
    for (const file of files) {
      try {
        // Define document MIME types that should be treated as 'raw' resources
        const rawDocumentMimeTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'text/plain',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-powerpoint',
          'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'text/csv',
          'application/rtf',
          'application/zip',
          'application/x-rar-compressed',
          'application/x-7z-compressed'
        ];

        let resourceType = 'auto';
        if (rawDocumentMimeTypes.includes(file.mimetype)) {
          resourceType = 'raw';
        }

        const uploadOptions = {
          folder: folder ? `student-info/${folder}` : 'student-info',
          resource_type: resourceType
        };

        const result = await uploadToCloudinary(file.path, uploadOptions);

        // Clean up temporary file
        fs.unlinkSync(file.path);

        if (result.success) {
          uploadResults.push({
            success: true,
            url: result.url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
            size: result.bytes,
            width: result.width,
            height: result.height,
            created_at: result.created_at,
            original_filename: file.originalname,
            mimetype: file.mimetype
          });
        } else {
          uploadResults.push({
            success: false,
            original_filename: file.originalname,
            error: result.error
          });
        }
      } catch (fileError) {
        // Clean up temporary file
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
        
        uploadResults.push({
          success: false,
          original_filename: file.originalname,
          error: fileError.message
        });
      }
    }

    const successCount = uploadResults.filter(result => result.success).length;
    const failureCount = uploadResults.length - successCount;

    res.json({
      success: failureCount === 0,
      message: `Upload completed. ${successCount} successful, ${failureCount} failed.`,
      data: {
        total: uploadResults.length,
        successful: successCount,
        failed: failureCount,
        results: uploadResults
      }
    });
  } catch (error) {
    // Clean up temporary files if they exist
    if (req.files) {
      req.files.forEach(file => {
        try {
          fs.unlinkSync(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up temp file:', cleanupError);
        }
      });
    }
    
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete file from Cloudinary
 * @route   DELETE /api/upload/:publicId
 * @access  Private
 */
export const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    const { resourceType } = req.query;

    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId, resourceType || 'image');

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to delete file',
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'File deleted successfully',
      data: {
        public_id: publicId,
        result: result.result
      }
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get upload statistics
 * @route   GET /api/upload/stats
 * @access  Private/Admin
 */
export const getUploadStats = async (req, res) => {
  try {
    // This would typically come from a database where you track uploads
    // For now, returning a placeholder response
    res.json({
      success: true,
      message: 'Upload statistics retrieved successfully',
      data: {
        total_uploads: 0,
        total_size: 0,
        uploads_today: 0,
        uploads_this_month: 0,
        storage_used: '0 MB',
        storage_limit: '10 GB'
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}; 
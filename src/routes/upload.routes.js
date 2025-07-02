import express from 'express';
import { 
  uploadSingleFile, 
  uploadMultipleFiles, 
  deleteFile, 
  getUploadStats 
} from '../controllers/upload.controller.js';
import { uploadSingle, uploadMultiple } from '../middlewares/upload.middleware.js';
import { authenticate, isAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UploadResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *         message:
 *           type: string
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: Cloudinary URL of uploaded file
 *             public_id:
 *               type: string
 *               description: Cloudinary public ID
 *             resource_type:
 *               type: string
 *               description: Type of resource (image, video, raw)
 *             format:
 *               type: string
 *               description: File format
 *             size:
 *               type: number
 *               description: File size in bytes
 *             width:
 *               type: number
 *               description: Image width (for images)
 *             height:
 *               type: number
 *               description: Image height (for images)
 *             created_at:
 *               type: string
 *               format: date-time
 *             original_filename:
 *               type: string
 *               description: Original filename
 *             mimetype:
 *               type: string
 *               description: MIME type
 */

/**
 * @swagger
 * /upload:
 *   post:
 *     summary: Upload a file (default single file upload)
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               folder:
 *                 type: string
 *                 description: Optional folder name for organization
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Upload failed
 */
router.post('/', authenticate, uploadSingle('file'), uploadSingleFile);

/**
 * @swagger
 * /upload/single:
 *   post:
 *     summary: Upload a single file
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: File to upload
 *               folder:
 *                 type: string
 *                 description: Optional folder name for organization
 *             required:
 *               - file
 *     responses:
 *       200:
 *         description: File uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadResponse'
 *       400:
 *         description: No file uploaded or invalid file
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Upload failed
 */
router.post('/single', authenticate, uploadSingle('file'), uploadSingleFile);

/**
 * @swagger
 * /upload/multiple:
 *   post:
 *     summary: Upload multiple files
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               files:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Files to upload (max 10)
 *               folder:
 *                 type: string
 *                 description: Optional folder name for organization
 *             required:
 *               - files
 *     responses:
 *       200:
 *         description: Files upload completed
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *                     results:
 *                       type: array
 *                       items:
 *                         oneOf:
 *                           - $ref: '#/components/schemas/UploadResponse'
 *                           - type: object
 *                             properties:
 *                               success:
 *                                 type: boolean
 *                                 example: false
 *                               original_filename:
 *                                 type: string
 *                               error:
 *                                 type: string
 *       400:
 *         description: No files uploaded or invalid files
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Upload failed
 */
router.post('/multiple', authenticate, uploadMultiple('files', 10), uploadMultipleFiles);

/**
 * @swagger
 * /upload/{publicId}:
 *   delete:
 *     summary: Delete a file from Cloudinary
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: publicId
 *         schema:
 *           type: string
 *         required: true
 *         description: Cloudinary public ID of the file to delete
 *       - in: query
 *         name: resourceType
 *         schema:
 *           type: string
 *           enum: [image, video, raw]
 *           default: image
 *         description: Type of resource to delete
 *     responses:
 *       200:
 *         description: File deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     public_id:
 *                       type: string
 *                     result:
 *                       type: string
 *       400:
 *         description: Public ID is required
 *       401:
 *         description: Not authenticated
 *       500:
 *         description: Delete failed
 */
router.delete('/:publicId', authenticate, deleteFile);

/**
 * @swagger
 * /upload/stats:
 *   get:
 *     summary: Get upload statistics
 *     tags: [Upload]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Upload statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     total_uploads:
 *                       type: number
 *                     total_size:
 *                       type: number
 *                     uploads_today:
 *                       type: number
 *                     uploads_this_month:
 *                       type: number
 *                     storage_used:
 *                       type: string
 *                     storage_limit:
 *                       type: string
 *       401:
 *         description: Not authenticated
 *       403:
 *         description: Admin access required
 */
router.get('/stats', authenticate, isAdmin, getUploadStats);

export default router; 
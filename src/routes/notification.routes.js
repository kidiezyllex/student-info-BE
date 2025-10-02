import express from 'express';
import {
  getAllNotifications,
  getNotificationById,
  createNotification,
  updateNotification,
  deleteNotification,
  saveNotification,
  unsaveNotification,
  getSavedNotifications
} from '../controllers/notification.controller.js';
import { 
  authenticate, 
  isAdminOrCoordinator,
  isAnyUser,
  checkCoordinatorDepartmentAccess 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     summary: Lấy tất cả thông báo
 *     tags: [Notifications]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Lọc theo loại thông báo
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Lọc theo ID của ngành
 *     responses:
 *       200:
 *         description: Danh sách thông báo
 */
router.get('/', authenticate, isAnyUser, getAllNotifications);

/**
 * @swagger
 * /notifications/{id}:
 *   get:
 *     summary: Lấy chi tiết thông báo theo ID
 *     tags: [Notifications]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Chi tiết thông báo
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.get('/:id', authenticate, isAnyUser, getNotificationById);

/**
 * @swagger
 * /notifications:
 *   post:
 *     summary: Tạo thông báo mới
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [general, scholarship, event, department, notification]
 *               department:
 *                 type: string
 *                 description: ID của ngành (nếu có)
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isImportant:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Đã tạo thông báo mới
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, createNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   put:
 *     summary: Cập nhật thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [general, scholarship, event, department, notification]
 *               department:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               isImportant:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Đã cập nhật thông báo
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.put('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, updateNotification);

/**
 * @swagger
 * /notifications/{id}:
 *   delete:
 *     summary: Xóa thông báo
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Đã xóa thông báo
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.delete('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, deleteNotification);

/**
 * @swagger
 * /notifications/saved:
 *   get:
 *     summary: Lấy danh sách thông báo đã lưu
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách thông báo đã lưu
 */
router.get('/saved', authenticate, getSavedNotifications);

/**
 * @swagger
 * /notifications/{id}/save:
 *   put:
 *     summary: Lưu thông báo vào danh sách yêu thích
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Đã lưu thông báo
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.put('/:id/save', authenticate, saveNotification);

/**
 * @swagger
 * /notifications/{id}/unsave:
 *   put:
 *     summary: Xóa thông báo khỏi danh sách yêu thích
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của thông báo
 *     responses:
 *       200:
 *         description: Đã xóa thông báo khỏi danh sách yêu thích
 *       404:
 *         description: Không tìm thấy thông báo
 */
router.put('/:id/unsave', authenticate, unsaveNotification);

export default router; 
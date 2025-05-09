import express from 'express';
import {
  getAllEvents,
  getAllEventsAdmin,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent
} from '../controllers/event.controller.js';
import { 
  authenticate, 
  isAdminOrCoordinator,
  isAnyUser,
  checkCoordinatorDepartmentAccess 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /events:
 *   get:
 *     summary: Lấy tất cả sự kiện sắp diễn ra hoặc đang diễn ra
 *     tags: [Events]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Lọc theo ID của ngành
 *     responses:
 *       200:
 *         description: Danh sách sự kiện
 */
router.get('/', authenticate, isAnyUser, getAllEvents);

/**
 * @swagger
 * /events/all:
 *   get:
 *     summary: Lấy tất cả sự kiện (bao gồm cả đã kết thúc)
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Lọc theo ID của ngành
 *     responses:
 *       200:
 *         description: Danh sách tất cả sự kiện
 */
router.get('/all', authenticate, isAdminOrCoordinator, getAllEventsAdmin);

/**
 * @swagger
 * /events/{id}:
 *   get:
 *     summary: Lấy chi tiết sự kiện theo ID
 *     tags: [Events]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sự kiện
 *     responses:
 *       200:
 *         description: Chi tiết sự kiện
 *       404:
 *         description: Không tìm thấy sự kiện
 */
router.get('/:id', authenticate, isAnyUser, getEventById);

/**
 * @swagger
 * /events:
 *   post:
 *     summary: Tạo sự kiện mới
 *     tags: [Events]
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
 *               - description
 *               - startDate
 *               - endDate
 *               - location
 *               - organizer
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               department:
 *                 type: string
 *                 description: ID của ngành (nếu có)
 *               organizer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đã tạo sự kiện mới
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, createEvent);

/**
 * @swagger
 * /events/{id}:
 *   put:
 *     summary: Cập nhật sự kiện
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sự kiện
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               department:
 *                 type: string
 *               organizer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật sự kiện
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sự kiện
 */
router.put('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, updateEvent);

/**
 * @swagger
 * /events/{id}:
 *   delete:
 *     summary: Xóa sự kiện
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của sự kiện
 *     responses:
 *       200:
 *         description: Đã xóa sự kiện
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy sự kiện
 */
router.delete('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, deleteEvent);

export default router; 
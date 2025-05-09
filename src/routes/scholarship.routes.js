import express from 'express';
import {
  getAllScholarships,
  getAllScholarshipsAdmin,
  getScholarshipById,
  createScholarship,
  updateScholarship,
  deleteScholarship
} from '../controllers/scholarship.controller.js';
import { 
  authenticate, 
  isAdminOrCoordinator,
  isAnyUser,
  checkCoordinatorDepartmentAccess 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /scholarships:
 *   get:
 *     summary: Lấy tất cả học bổng còn hạn
 *     tags: [Scholarships]
 *     parameters:
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Lọc theo ID của ngành
 *     responses:
 *       200:
 *         description: Danh sách học bổng
 */
router.get('/', authenticate, isAnyUser, getAllScholarships);

/**
 * @swagger
 * /scholarships/all:
 *   get:
 *     summary: Lấy tất cả học bổng (bao gồm cả hết hạn)
 *     tags: [Scholarships]
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
 *         description: Danh sách tất cả học bổng
 */
router.get('/all', authenticate, isAdminOrCoordinator, getAllScholarshipsAdmin);

/**
 * @swagger
 * /scholarships/{id}:
 *   get:
 *     summary: Lấy chi tiết học bổng theo ID
 *     tags: [Scholarships]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của học bổng
 *     responses:
 *       200:
 *         description: Chi tiết học bổng
 *       404:
 *         description: Không tìm thấy học bổng
 */
router.get('/:id', authenticate, isAnyUser, getScholarshipById);

/**
 * @swagger
 * /scholarships:
 *   post:
 *     summary: Tạo học bổng mới
 *     tags: [Scholarships]
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
 *               - requirements
 *               - value
 *               - applicationDeadline
 *               - provider
 *               - eligibility
 *               - applicationProcess
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               requirements:
 *                 type: string
 *               value:
 *                 type: string
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               provider:
 *                 type: string
 *               department:
 *                 type: string
 *                 description: ID của ngành (nếu có)
 *               eligibility:
 *                 type: string
 *               applicationProcess:
 *                 type: string
 *     responses:
 *       201:
 *         description: Đã tạo học bổng mới
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, createScholarship);

/**
 * @swagger
 * /scholarships/{id}:
 *   put:
 *     summary: Cập nhật học bổng
 *     tags: [Scholarships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của học bổng
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
 *               requirements:
 *                 type: string
 *               value:
 *                 type: string
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               provider:
 *                 type: string
 *               department:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               applicationProcess:
 *                 type: string
 *     responses:
 *       200:
 *         description: Đã cập nhật học bổng
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy học bổng
 */
router.put('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, updateScholarship);

/**
 * @swagger
 * /scholarships/{id}:
 *   delete:
 *     summary: Xóa học bổng
 *     tags: [Scholarships]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của học bổng
 *     responses:
 *       200:
 *         description: Đã xóa học bổng
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy học bổng
 */
router.delete('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, deleteScholarship);

export default router; 
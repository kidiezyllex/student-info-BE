import express from 'express';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  getCoordinatorStats
} from '../controllers/department.controller.js';
import { authenticate, isAdmin, isAdminOrCoordinator } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /departments/{id}/stats:
 *   get:
 *     summary: Get coordinator dashboard statistics
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Department ID
 *     responses:
 *       200:
 *         description: Department statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     department:
 *                       type: object
 *                     activeTopics:
 *                       type: number
 *                     studentsCount:
 *                       type: number
 *                     tickets:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         pending:
 *                           type: number
 *                         resolved:
 *                           type: number
 *                         closed:
 *                           type: number
 *       403:
 *         description: Not authorized
 *       404:
 *         description: Department not found
 */
router.get('/:id/stats', authenticate, isAdminOrCoordinator, getCoordinatorStats);

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Lấy danh sách tất cả ngành học
 *     tags: [Departments]
 *     responses:
 *       200:
 *         description: Danh sách ngành học
 */
router.get('/', getAllDepartments);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Lấy thông tin ngành học theo ID
 *     tags: [Departments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của ngành học
 *     responses:
 *       200:
 *         description: Thông tin chi tiết ngành học
 *       404:
 *         description: Không tìm thấy ngành học
 */
router.get('/:id', getDepartmentById);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Tạo ngành học mới
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - description
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               coordinatorId:
 *                 type: string
 *                 description: ID của người phụ trách ngành (nếu có)
 *     responses:
 *       201:
 *         description: Đã tạo ngành học thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, isAdmin, createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Cập nhật thông tin ngành học
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của ngành học
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               description:
 *                 type: string
 *               coordinatorId:
 *                 type: string
 *                 description: ID của người phụ trách ngành (nếu có)
 *     responses:
 *       200:
 *         description: Đã cập nhật ngành học thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy ngành học
 */
router.put('/:id', authenticate, isAdmin, updateDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Xóa ngành học
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của ngành học
 *     responses:
 *       200:
 *         description: Đã xóa ngành học thành công
 *       401:
 *         description: Không có quyền truy cập
 *       404:
 *         description: Không tìm thấy ngành học
 */
router.delete('/:id', authenticate, isAdmin, deleteDepartment);

export default router; 
import express from 'express';
import {
  getAllDataset,
  getDatasetById,
  createDataset,
  updateDataset,
  deleteDataset
} from '../controllers/dataset.controller.js';
import { 
  authenticate, 
  isAdminOrCoordinator,
  checkCoordinatorDepartmentAccess,
  isAnyUser
} from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /dataset:
 *   get:
 *     summary: Lấy tất cả dữ liệu trong dataset
 *     tags: [Dataset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Lọc theo category
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Lọc theo ID của ngành
 *     responses:
 *       200:
 *         description: Danh sách dữ liệu
 */
router.get('/', authenticate, isAnyUser, getAllDataset);

/**
 * @swagger
 * /dataset/{id}:
 *   get:
 *     summary: Lấy chi tiết dữ liệu theo ID
 *     tags: [Dataset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dữ liệu
 *     responses:
 *       200:
 *         description: Chi tiết dữ liệu
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.get('/:id', authenticate, isAnyUser, getDatasetById);

/**
 * @swagger
 * /dataset:
 *   post:
 *     summary: Thêm dữ liệu mới vào dataset
 *     tags: [Dataset]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - key
 *               - value
 *               - category
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [general, scholarship, event, department, faq]
 *               department:
 *                 type: string
 *                 description: ID của ngành (nếu có)
 *     responses:
 *       201:
 *         description: Đã thêm dữ liệu thành công
 *       400:
 *         description: Dữ liệu không hợp lệ
 */
router.post('/', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, createDataset);

/**
 * @swagger
 * /dataset/{id}:
 *   put:
 *     summary: Cập nhật dữ liệu trong dataset
 *     tags: [Dataset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dữ liệu
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               key:
 *                 type: string
 *               value:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [general, scholarship, event, department, faq]
 *               department:
 *                 type: string
 *                 description: ID của ngành (nếu có)
 *     responses:
 *       200:
 *         description: Đã cập nhật dữ liệu thành công
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.put('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, updateDataset);

/**
 * @swagger
 * /dataset/{id}:
 *   delete:
 *     summary: Xóa dữ liệu khỏi dataset
 *     tags: [Dataset]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của dữ liệu
 *     responses:
 *       200:
 *         description: Đã xóa dữ liệu thành công
 *       404:
 *         description: Không tìm thấy dữ liệu
 */
router.delete('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, deleteDataset);

export default router; 
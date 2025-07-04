import express from 'express';
import { trainingAI, getTrainingHistory, checkAIStatus } from '../controllers/ai.controller.js';
import { authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /ai:
 *   post:
 *     summary: Kiểm tra trạng thái và thông tin AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Thông tin trạng thái AI
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
 *                     status:
 *                       type: string
 *                     totalTrainings:
 *                       type: number
 *                     lastTraining:
 *                       type: object
 *                     capabilities:
 *                       type: array
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, checkAIStatus);

/**
 * @swagger
 * /ai/train:
 *   post:
 *     summary: Training AI từ dataset
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [general, scholarship, event, department, faq]
 *                 description: Danh sách các danh mục dữ liệu muốn dùng để training
 *               departmentId:
 *                 type: string
 *                 description: ID của ngành (nếu muốn giới hạn dữ liệu theo ngành)
 *     responses:
 *       200:
 *         description: Đã hoàn thành quá trình training
 *       401:
 *         description: Không có quyền truy cập
 *       500:
 *         description: Lỗi server
 */
router.post('/train', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, trainingAI);

/**
 * @swagger
 * /ai/training-history:
 *   get:
 *     summary: Lấy danh sách các lần training AI
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các lần training
 *       401:
 *         description: Không có quyền truy cập
 */
router.get('/training-history', authenticate, isAdminOrCoordinator, getTrainingHistory);

export default router; 
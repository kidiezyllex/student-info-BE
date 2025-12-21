import express from 'express';
import { checkAIStatus } from '../controllers/ai.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /ai:
 *   post:
 *     summary: Kiểm tra trạng thái và thông tin AI (RAG-based)
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
 *                     method:
 *                       type: string
 *                       description: Phương thức AI đang sử dụng
 *                     capabilities:
 *                       type: array
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, checkAIStatus);

export default router; 
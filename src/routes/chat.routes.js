import express from 'express';
import {
  askQuestion,
  getChatHistory,
  getChatSession,
  rateAnswer,
  deleteChatSession
} from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /chat/ask:
 *   post:
 *     summary: Gửi câu hỏi đến AI và nhận câu trả lời
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - question
 *             properties:
 *               question:
 *                 type: string
 *                 description: Câu hỏi của người dùng
 *               sessionId:
 *                 type: string
 *                 description: ID của phiên chat (nếu là phiên chat đã tồn tại)
 *               category:
 *                 type: string
 *                 description: Danh mục dữ liệu muốn tìm kiếm
 *               departmentId:
 *                 type: string
 *                 description: ID của ngành (nếu muốn giới hạn dữ liệu theo ngành)
 *     responses:
 *       200:
 *         description: Câu trả lời từ AI
 *       400:
 *         description: Thiếu câu hỏi
 */
router.post('/ask', authenticate, askQuestion);

/**
 * @swagger
 * /chat/history:
 *   get:
 *     summary: Lấy lịch sử chat của người dùng
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách các phiên chat
 */
router.get('/history', authenticate, getChatHistory);

/**
 * @swagger
 * /chat/session/{id}:
 *   get:
 *     summary: Lấy chi tiết một phiên chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phiên chat
 *     responses:
 *       200:
 *         description: Chi tiết phiên chat
 *       403:
 *         description: Không có quyền truy cập phiên chat này
 *       404:
 *         description: Không tìm thấy phiên chat
 */
router.get('/session/:id', authenticate, getChatSession);

/**
 * @swagger
 * /chat/rate:
 *   put:
 *     summary: Đánh giá câu trả lời của AI
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sessionId
 *               - messageIndex
 *               - isAccurate
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: ID của phiên chat
 *               messageIndex:
 *                 type: integer
 *                 description: Index của tin nhắn cần đánh giá
 *               isAccurate:
 *                 type: boolean
 *                 description: Đánh giá câu trả lời có chính xác không
 *     responses:
 *       200:
 *         description: Đã cập nhật đánh giá
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền đánh giá phiên chat này
 *       404:
 *         description: Không tìm thấy phiên chat
 */
router.put('/rate', authenticate, rateAnswer);

/**
 * @swagger
 * /chat/session/{id}:
 *   delete:
 *     summary: Xóa một phiên chat
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của phiên chat
 *     responses:
 *       200:
 *         description: Đã xóa phiên chat
 *       403:
 *         description: Không có quyền xóa phiên chat này
 *       404:
 *         description: Không tìm thấy phiên chat
 */
router.delete('/session/:id', authenticate, deleteChatSession);

export default router; 
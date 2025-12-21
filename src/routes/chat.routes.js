import express from 'express';
import {
  askQuestion,
  createChatSession,
  getChatHistory,
  getChatSession,
  rateAnswer,
  deleteChatSession,
  searchTopics
} from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /chat:
 *   post:
 *     summary: Tạo phiên chat mới
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Tiêu đề cho phiên chat (tùy chọn)
 *     responses:
 *       201:
 *         description: Tạo phiên chat thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.post('/', authenticate, createChatSession);

/**
 * @swagger
 * /chat/ask:
 *   post:
 *     summary: Gửi câu hỏi đến AI và nhận câu trả lời (sử dụng Groq RAG)
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
 *               type:
 *                 type: string
 *                 enum: [event, scholarship, notification, job, advertisement, internship, recruitment, volunteer, extracurricular]
 *                 description: Loại topic muốn tìm kiếm
 *               departmentId:
 *                 type: string
 *                 description: ID của ngành (nếu muốn giới hạn dữ liệu theo ngành)
 *               includeExpired:
 *                 type: boolean
 *                 description: Có bao gồm các topic đã hết hạn không
 *     responses:
 *       200:
 *         description: Câu trả lời từ AI với RAG context
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

/**
 * @swagger
 * /chat/search-topics:
 *   get:
 *     summary: Tìm kiếm topics nâng cao (hỗ trợ RAG)
 *     tags: [Chat]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Từ khóa tìm kiếm
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [event, scholarship, notification, job, advertisement, internship, recruitment, volunteer, extracurricular]
 *         description: Loại topic
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *         description: ID của ngành
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Số lượng kết quả tối đa
 *       - in: query
 *         name: includeExpired
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Có bao gồm các topic đã hết hạn không
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [relevance, date, title]
 *           default: relevance
 *         description: Cách sắp xếp kết quả
 *     responses:
 *       200:
 *         description: Danh sách topics tìm được
 */
router.get('/search-topics', authenticate, searchTopics);

export default router; 
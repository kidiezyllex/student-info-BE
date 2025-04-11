import express from 'express';
import {
  sendMessage,
  getMessageHistory,
  getConversations,
  markMessageAsRead,
  markAllMessagesAsRead
} from '../controllers/message.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /messages:
 *   get:
 *     summary: Lấy danh sách các cuộc trò chuyện
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách cuộc trò chuyện
 */
router.get('/', authenticate, getConversations);

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Lấy lịch sử tin nhắn với một người dùng
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người dùng
 *     responses:
 *       200:
 *         description: Lịch sử tin nhắn
 *       404:
 *         description: Không tìm thấy người dùng
 */
router.get('/:userId', authenticate, getMessageHistory);

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Gửi tin nhắn
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 description: ID của người nhận
 *               content:
 *                 type: string
 *                 description: Nội dung tin nhắn
 *     responses:
 *       201:
 *         description: Đã gửi tin nhắn
 *       400:
 *         description: Dữ liệu không hợp lệ
 *       403:
 *         description: Không có quyền gửi tin nhắn cho người này
 *       404:
 *         description: Không tìm thấy người nhận
 */
router.post('/', authenticate, sendMessage);

/**
 * @swagger
 * /messages/{messageId}/read:
 *   put:
 *     summary: Đánh dấu tin nhắn đã đọc
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của tin nhắn
 *     responses:
 *       200:
 *         description: Đã đánh dấu tin nhắn đã đọc
 *       403:
 *         description: Không có quyền đánh dấu tin nhắn này
 *       404:
 *         description: Không tìm thấy tin nhắn
 */
router.put('/:messageId/read', authenticate, markMessageAsRead);

/**
 * @swagger
 * /messages/{userId}/read-all:
 *   put:
 *     summary: Đánh dấu tất cả tin nhắn từ một người đã đọc
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID của người gửi
 *     responses:
 *       200:
 *         description: Đã đánh dấu tất cả tin nhắn đã đọc
 */
router.put('/:userId/read-all', authenticate, markAllMessagesAsRead);

export default router; 
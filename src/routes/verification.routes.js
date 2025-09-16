import express from 'express';
import { sendCode, verifyCode, sendPasswordReset } from '../controllers/verification.controller.js';
import { authRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /verification/send-code:
 *   post:
 *     summary: Gửi mã xác thực đến email
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email để gửi mã xác thực
 *     responses:
 *       200:
 *         description: Mã xác thực đã được gửi thành công
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
 *                     email:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi hệ thống khi gửi mã xác thực
 */
router.post('/send-code', authRateLimit, sendCode);

/**
 * @swagger
 * /verification/verify-code:
 *   post:
 *     summary: Xác thực mã được nhập
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - code
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email
 *               code:
 *                 type: string
 *                 description: Mã xác thực 6 chữ số
 *     responses:
 *       200:
 *         description: Xác thực thành công
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
 *                     email:
 *                       type: string
 *                     verified:
 *                       type: boolean
 *       400:
 *         description: Mã xác thực không đúng hoặc đã hết hạn
 *       500:
 *         description: Lỗi hệ thống khi xác thực mã
 */
router.post('/verify-code', authRateLimit, verifyCode);

/**
 * @swagger
 * /verification/send-password-reset:
 *   post:
 *     summary: Gửi mã đặt lại mật khẩu đến email
 *     tags: [Verification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: Địa chỉ email để gửi mã đặt lại mật khẩu
 *     responses:
 *       200:
 *         description: Mã đặt lại mật khẩu đã được gửi thành công
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
 *                     email:
 *                       type: string
 *                     expiresAt:
 *                       type: string
 *                       format: date-time
 *       400:
 *         description: Dữ liệu đầu vào không hợp lệ
 *       500:
 *         description: Lỗi hệ thống khi gửi mã đặt lại mật khẩu
 */
router.post('/send-password-reset', authRateLimit, sendPasswordReset);

export default router;

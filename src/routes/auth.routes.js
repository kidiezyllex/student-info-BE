import express from 'express';
import { login, register, getProfile, completeRegistration } from '../controllers/auth.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';
import { authRateLimit } from '../middlewares/rateLimit.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: User login
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successful login
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authRateLimit, login);

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *               role:
 *                 type: string
 *                 enum: [student, coordinator, admin]
 *                 default: student
 *                 description: Role of the user
 *     responses:
 *       200:
 *         description: Registration successful
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
 *                     _id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     fullName:
 *                       type: string
 *                     email:
 *                       type: string
 *                     studentId:
 *                       type: string
 *                     role:
 *                       type: string
 *                     department:
 *                       type: object
 *                     avatar:
 *                       type: string
 *                     emailVerified:
 *                       type: boolean
 *                     token:
 *                       type: string
 *       400:
 *         description: Bad request - invalid input or user already exists
 *       500:
 *         description: Failed to process registration request
 */
router.post('/register', authRateLimit, register);

/**
 * @swagger
 * /auth/complete-registration:
 *   post:
 *     summary: Complete user registration with verification token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - verificationToken
 *             properties:
 *               name:
 *                 type: string
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 6
 *                 description: User's password (minimum 6 characters)
 *               verificationToken:
 *                 type: string
 *                 description: Verification token received after email verification
 *               role:
 *                 type: string
 *                 enum: [student, coordinator, admin]
 *                 default: student
 *                 description: User's role
 *     responses:
 *       200:
 *         description: Registration completed successfully
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
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         name:
 *                           type: string
 *                         email:
 *                           type: string
 *                         role:
 *                           type: string
 *                         emailVerified:
 *                           type: boolean
 *       400:
 *         description: Bad request - invalid input or verification token
 *       500:
 *         description: Internal server error
 */
router.post('/complete-registration', authRateLimit, completeRegistration);

/**
 * @swagger
 * /auth/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Not authorized
 */
router.get('/profile', authenticate, getProfile);

export default router; 
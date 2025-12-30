import express from 'express';
import { getActivityLogs } from '../controllers/activityLog.controller.js';
import { authenticate, isAdminOrCoordinator } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /activity-logs:
 *   get:
 *     summary: Get activity logs (Admin/Coordinator only)
 *     tags: [Activity Logs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: action
 *         schema:
 *           type: string
 *           enum: [CREATE, UPDATE, DELETE]
 *       - in: query
 *         name: resource
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of activity logs
 *       403:
 *         description: Access denied
 */
router.get('/', authenticate, isAdminOrCoordinator, getActivityLogs);

export default router;

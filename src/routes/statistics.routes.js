import express from 'express';
import { getStatisticsSummary } from '../controllers/statistics.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /statistics/summary:
 *   get:
 *     summary: Get statistics summary
 *     tags: [Statistics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics summary (students, departments, coordinators, topics)
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
 *                     studentsCount:
 *                       type: integer
 *                     departmentsCount:
 *                       type: integer
 *                     coordinatorsCount:
 *                       type: integer
 *                     topicsCount:
 *                       type: integer
 *                     topicsByType:
 *                       type: object
 */
router.get('/summary', getStatisticsSummary);

export default router;

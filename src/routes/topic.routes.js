import express from 'express';
import {
  getAllTopics,
  getAllTopicsAdmin,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  saveTopic,
  unsaveTopic,
  getSavedTopics
} from '../controllers/topic.controller.js';
import { 
  authenticate, 
  isAdminOrCoordinator,
  isAnyUser,
  checkCoordinatorDepartmentAccess 
} from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /topics:
 *   get:
 *     summary: Get all topics
 *     tags: [Topics]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [event, scholarship, notification, job, advertisement, internship, recruitment, volunteer, extracurricular]
 *         description: Filter by topic type
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *     responses:
 *       200:
 *         description: List of topics
 */
router.get('/', authenticate, isAnyUser, getAllTopics);

/**
 * @swagger
 * /topics/all:
 *   get:
 *     summary: Get all topics (including expired)
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *         description: Filter by topic type
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *         description: Filter by department ID
 *     responses:
 *       200:
 *         description: List of all topics
 */
router.get('/all', authenticate, isAdminOrCoordinator, getAllTopicsAdmin);

/**
 * @swagger
 * /topics/saved:
 *   get:
 *     summary: Get saved topics list
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of saved topics
 */
router.get('/saved', authenticate, getSavedTopics);

/**
 * @swagger
 * /topics/{id}:
 *   get:
 *     summary: Get topic by ID
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic details
 *       404:
 *         description: Topic not found
 */
router.get('/:id', authenticate, isAnyUser, getTopicById);

/**
 * @swagger
 * /topics:
 *   post:
 *     summary: Create new topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - type
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *                 enum: [event, scholarship, notification, job, advertisement, internship, recruitment, volunteer, extracurricular]
 *               department:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date-time
 *               endDate:
 *                 type: string
 *                 format: date-time
 *               applicationDeadline:
 *                 type: string
 *                 format: date-time
 *               location:
 *                 type: string
 *               organizer:
 *                 type: string
 *               requirements:
 *                 type: string
 *               value:
 *                 type: string
 *               provider:
 *                 type: string
 *               eligibility:
 *                 type: string
 *               applicationProcess:
 *                 type: string
 *               isImportant:
 *                 type: boolean
 *               company:
 *                 type: string
 *               salary:
 *                 type: string
 *               position:
 *                 type: string
 *               contactInfo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Topic created
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, createTopic);

/**
 * @swagger
 * /topics/{id}:
 *   put:
 *     summary: Update topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               type:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       200:
 *         description: Topic updated
 *       400:
 *         description: Invalid data
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Topic not found
 */
router.put('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, updateTopic);

/**
 * @swagger
 * /topics/{id}:
 *   delete:
 *     summary: Delete topic
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Topic not found
 */
router.delete('/:id', authenticate, isAdminOrCoordinator, checkCoordinatorDepartmentAccess, deleteTopic);

/**
 * @swagger
 * /topics/{id}/save:
 *   put:
 *     summary: Save topic to favorites
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic saved
 *       404:
 *         description: Topic not found
 */
router.put('/:id/save', authenticate, saveTopic);

/**
 * @swagger
 * /topics/{id}/unsave:
 *   put:
 *     summary: Remove topic from favorites
 *     tags: [Topics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Topic ID
 *     responses:
 *       200:
 *         description: Topic removed from favorites
 *       404:
 *         description: Topic not found
 */
router.put('/:id/unsave', authenticate, unsaveTopic);

export default router;


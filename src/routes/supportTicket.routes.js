import express from 'express';
import {
  createSupportTicket,
  getSupportTickets,
  getSupportTicketById,
  updateTicketStatus,
  addAdminNote,
  resolveTicket,
  assignTicket,
  deleteSupportTicket,
  getTicketStats
} from '../controllers/supportTicket.controller.js';
import { authenticate, isAdmin, isAdminOrCoordinator } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /support-tickets/stats:
 *   get:
 *     summary: Get ticket statistics
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 */
router.get('/stats', authenticate, isAdminOrCoordinator, getTicketStats);

/**
 * @swagger
 * /support-tickets:
 *   post:
 *     summary: Create new support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               category:
 *                 type: string
 *                 enum: [academic, technical, administrative, other]
 *               aiConversation:
 *                 type: object
 *                 properties:
 *                   userQuery:
 *                     type: string
 *                   aiResponse:
 *                     type: string
 *                   conversationId:
 *                     type: string
 *               contactInfo:
 *                 type: object
 *                 properties:
 *                   email:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *     responses:
 *       201:
 *         description: Support ticket created successfully
 *       400:
 *         description: Invalid data or student not assigned to department
 */
router.post('/', authenticate, createSupportTicket);

/**
 * @swagger
 * /support-tickets:
 *   get:
 *     summary: Get all support tickets (filtered by role)
 *     tags: [Support Tickets]
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
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, resolved, closed]
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [academic, technical, administrative, other]
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of support tickets
 */
router.get('/', authenticate, getSupportTickets);

/**
 * @swagger
 * /support-tickets/{id}:
 *   get:
 *     summary: Get support ticket by ID
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Support ticket details
 *       404:
 *         description: Ticket not found
 *       403:
 *         description: Not authorized
 */
router.get('/:id', authenticate, getSupportTicketById);

/**
 * @swagger
 * /support-tickets/{id}/status:
 *   put:
 *     summary: Update ticket status
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, resolved, closed]
 *     responses:
 *       200:
 *         description: Status updated successfully
 *       403:
 *         description: Not authorized
 */
router.put('/:id/status', authenticate, isAdminOrCoordinator, updateTicketStatus);

/**
 * @swagger
 * /support-tickets/{id}/notes:
 *   post:
 *     summary: Add admin note to ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - note
 *             properties:
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note added successfully
 *       403:
 *         description: Not authorized
 */
router.post('/:id/notes', authenticate, isAdminOrCoordinator, addAdminNote);

/**
 * @swagger
 * /support-tickets/{id}/resolve:
 *   put:
 *     summary: Resolve support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resolutionNote:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket resolved successfully
 *       403:
 *         description: Not authorized
 */
router.put('/:id/resolve', authenticate, isAdminOrCoordinator, resolveTicket);

/**
 * @swagger
 * /support-tickets/{id}/assign:
 *   put:
 *     summary: Assign ticket to admin
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminId
 *             properties:
 *               adminId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket assigned successfully
 *       403:
 *         description: Not authorized
 */
router.put('/:id/assign', authenticate, isAdminOrCoordinator, assignTicket);

/**
 * @swagger
 * /support-tickets/{id}:
 *   delete:
 *     summary: Delete support ticket
 *     tags: [Support Tickets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ticket deleted successfully
 *       403:
 *         description: Not authorized (Admin only)
 */
router.delete('/:id', authenticate, isAdmin, deleteSupportTicket);

export default router;

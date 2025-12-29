import express from 'express';
import { getCalendarEvents } from '../controllers/calendar.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/calendar/events:
 *   get:
 *     summary: Get events from Google Calendar
 *     tags: [Calendar]
 *     parameters:
 *       - in: query
 *         name: calendarId
 *         required: true
 *         schema:
 *           type: string
 *         description: Google Calendar ID
 *       - in: query
 *         name: maxResults
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Maximum number of events to return
 *       - in: query
 *         name: timeMin
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Lower bound for event start time (ISO 8601 format)
 *       - in: query
 *         name: timeMax
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Upper bound for event start time (ISO 8601 format)
 *     responses:
 *       200:
 *         description: Calendar events retrieved successfully
 *       400:
 *         description: Calendar ID is required
 *       403:
 *         description: Access denied
 *       404:
 *         description: Calendar not found
 *       500:
 *         description: Server error
 */
router.get('/events', getCalendarEvents);

export default router;

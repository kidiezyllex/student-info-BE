import { google } from 'googleapis';

const GOOGLE_CALENDAR_API_KEY = 'AIzaSyBRj35LHHD2E0kRxtk93Qepc4JnQpFmo1Q';

/**
 * @desc    Get events from Google Calendar
 * @route   GET /api/calendar/events
 * @access  Public
 */
export const getCalendarEvents = async (req, res) => {
  try {
    const { calendarId, maxResults = 10, timeMin, timeMax } = req.query;

    if (!calendarId) {
      return res.status(400).json({
        success: false,
        message: 'Calendar ID is required'
      });
    }

    // Initialize Google Calendar API with API Key
    const calendar = google.calendar({
      version: 'v3',
      auth: GOOGLE_CALENDAR_API_KEY
    });

    // Prepare request parameters
    const params = {
      calendarId: calendarId,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime'
    };

    // Add time range if provided
    if (timeMin) {
      params.timeMin = new Date(timeMin).toISOString();
    } else {
      // Default to current time
      params.timeMin = new Date().toISOString();
    }

    if (timeMax) {
      params.timeMax = new Date(timeMax).toISOString();
    }

    // Fetch events from Google Calendar
    const response = await calendar.events.list(params);

    const events = response.data.items || [];

    // Format events for easier consumption
    const formattedEvents = events.map(event => ({
      id: event.id,
      summary: event.summary,
      description: event.description,
      location: event.location,
      start: event.start.dateTime || event.start.date,
      end: event.end.dateTime || event.end.date,
      creator: event.creator,
      organizer: event.organizer,
      attendees: event.attendees,
      htmlLink: event.htmlLink,
      status: event.status,
      created: event.created,
      updated: event.updated
    }));

    res.status(200).json({
      success: true,
      message: 'Calendar events retrieved successfully',
      data: {
        calendarId: calendarId,
        calendarName: formattedEvents.length > 0 ? formattedEvents[0].organizer?.displayName : null,
        totalEvents: formattedEvents.length,
        events: formattedEvents
      }
    });

  } catch (error) {
    console.error('Calendar API error:', error);
    
    // Handle specific Google API errors
    if (error.code === 404) {
      return res.status(404).json({
        success: false,
        message: 'Calendar not found or not accessible'
      });
    }

    if (error.code === 403) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Please check API key and calendar permissions'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to fetch calendar events',
      error: error.message
    });
  }
};

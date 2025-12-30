import ActivityLog from '../models/activityLog.model.js';

/**
 * @desc    Helper function to create activity log
 * @param   {Object} data - { user, action, resource, resourceId, details, req }
 */
export const logActivity = async (data) => {
  try {
    const { user, action, resource, resourceId, details, req } = data;

    // Only log for admin and coordinator roles if user object is provided
    if (user && (user.role === 'admin' || user.role === 'coordinator')) {
      await ActivityLog.create({
        user: user._id,
        action,
        resource,
        resourceId,
        details,
        ipAddress: req ? (req.headers['x-forwarded-for'] || req.socket.remoteAddress) : null,
        userAgent: req ? req.headers['user-agent'] : null
      });
      
      // Mark request as logged to prevent auto-logger from duplicating
      if (req) {
        req.activityLogged = true;
      }
    }
  } catch (error) {
    console.error('[ActivityLog] Error creating log:', error);
    // Don't block main flow if logging fails
  }
};

/**
 * @desc    Get all activity logs
 * @route   GET /api/activity-logs
 * @access  Admin, Coordinator
 */
export const getActivityLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const { action, resource, userId, startDate, endDate } = req.query;
    
    const query = {};
    
    if (action) query.action = action;
    if (resource) query.resource = resource;
    if (userId) query.user = userId;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Role-based filtering logic (optional)
    // If we strictly want coordinators to only see their own logs or department logs, handle here.
    // For now, per requirement "xem chung", proceed to show all logs.

    const total = await ActivityLog.countDocuments(query);
    
    const logs = await ActivityLog.find(query)
      .populate('user', 'name email role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
      
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: logs,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting activity logs:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default {
  getActivityLogs,
  logActivity
};

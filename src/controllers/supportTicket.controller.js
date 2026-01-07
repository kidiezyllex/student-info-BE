import SupportTicket from '../models/supportTicket.model.js';
import User from '../models/user.model.js';
import Department from '../models/department.model.js';

/**
 * @desc    Create new support ticket
 * @route   POST /api/support-tickets
 * @access  Private (Student)
 */
export const createSupportTicket = async (req, res) => {
  try {
    const {
      subject,
      description,
      aiConversation,
      priority,
      category,
      contactInfo
    } = req.body;

    // Get student's department
    const student = await User.findById(req.user._id).populate('department');
    
    if (!student.department) {
      return res.status(400).json({
        status: false,
        message: 'Student must be assigned to a department to create a support ticket'
      });
    }

    // Get department coordinator as default assignee
    const department = await Department.findById(student.department._id).populate('coordinator');
    
    const ticketData = {
      student: req.user._id,
      department: student.department._id,
      subject,
      description,
      priority: priority || 'medium',
      category: category || 'other',
      contactInfo: {
        email: contactInfo?.email || student.email,
        phoneNumber: contactInfo?.phoneNumber || student.phoneNumber
      }
    };

    // Add AI conversation context if provided
    if (aiConversation) {
      ticketData.aiConversation = aiConversation;
    }

    // Assign to department coordinator if exists
    if (department.coordinator) {
      ticketData.assignedTo = department.coordinator._id;
    }

    const ticket = await SupportTicket.create(ticketData);
    
    // Populate ticket data for response
    await ticket.populate([
      { path: 'student', select: 'name email studentId' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.status(201).json({
      status: true,
      message: 'Support ticket created successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get all support tickets (with filters)
 * @route   GET /api/support-tickets
 * @access  Private
 */
export const getSupportTickets = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const { status, priority, category, department } = req.query;

    // Build filter based on user role
    const filter = {};
    
    // Students can only see their own tickets
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    }
    
    // Coordinators can see tickets from their department
    if (req.user.role === 'coordinator' && req.user.department) {
      filter.department = req.user.department;
    }
    
    // Admins can see all tickets (no filter needed)
    
    // Apply query filters
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (department && req.user.role === 'admin') filter.department = department;

    const total = await SupportTicket.countDocuments(filter);
    const tickets = await SupportTicket.find(filter)
      .populate('student', 'name email studentId')
      .populate('department', 'name code')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(total / limit);

    res.json({
      status: true,
      message: 'Support tickets retrieved successfully',
      data: tickets,
      pagination: {
        total,
        page,
        limit,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get support ticket by ID
 * @route   GET /api/support-tickets/:id
 * @access  Private
 */
export const getSupportTicketById = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id)
      .populate('student', 'name email studentId phoneNumber')
      .populate('department', 'name code description')
      .populate('assignedTo', 'name email')
      .populate('adminNotes.admin', 'name email')
      .populate('resolution.resolvedBy', 'name email');

    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: 'Support ticket not found'
      });
    }

    // Check authorization
    const isStudent = req.user._id.toString() === ticket.student._id.toString();
    const isAssignedAdmin = ticket.assignedTo && req.user._id.toString() === ticket.assignedTo._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isCoordinatorOfDept = req.user.role === 'coordinator' && 
                                 req.user.department?.toString() === ticket.department._id.toString();

    if (!isStudent && !isAssignedAdmin && !isAdmin && !isCoordinatorOfDept) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to view this ticket'
      });
    }

    res.json({
      status: true,
      message: 'Support ticket retrieved successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Update support ticket status
 * @route   PUT /api/support-tickets/:id/status
 * @access  Private (Admin/Coordinator)
 */
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['open', 'in_progress', 'resolved', 'closed'].includes(status)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status value'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: 'Support ticket not found'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCoordinatorOfDept = req.user.role === 'coordinator' && 
                                 req.user.department?.toString() === ticket.department.toString();

    if (!isAdmin && !isCoordinatorOfDept) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to update this ticket'
      });
    }

    ticket.status = status;
    
    if (status === 'closed') {
      ticket.closedAt = new Date();
    }

    await ticket.save();
    await ticket.populate([
      { path: 'student', select: 'name email studentId' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.json({
      status: true,
      message: 'Ticket status updated successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Add admin note to ticket
 * @route   POST /api/support-tickets/:id/notes
 * @access  Private (Admin/Coordinator)
 */
export const addAdminNote = async (req, res) => {
  try {
    const { note } = req.body;
    
    if (!note) {
      return res.status(400).json({
        status: false,
        message: 'Note content is required'
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: 'Support ticket not found'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCoordinatorOfDept = req.user.role === 'coordinator' && 
                                 req.user.department?.toString() === ticket.department.toString();

    if (!isAdmin && !isCoordinatorOfDept) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to add notes to this ticket'
      });
    }

    ticket.adminNotes.push({
      admin: req.user._id,
      note,
      createdAt: new Date()
    });

    await ticket.save();
    await ticket.populate([
      { path: 'student', select: 'name email studentId' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'adminNotes.admin', select: 'name email' }
    ]);

    res.json({
      status: true,
      message: 'Admin note added successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Resolve support ticket
 * @route   PUT /api/support-tickets/:id/resolve
 * @access  Private (Admin/Coordinator)
 */
export const resolveTicket = async (req, res) => {
  try {
    const { resolutionNote } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: 'Support ticket not found'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCoordinatorOfDept = req.user.role === 'coordinator' && 
                                 req.user.department?.toString() === ticket.department.toString();

    if (!isAdmin && !isCoordinatorOfDept) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to resolve this ticket'
      });
    }

    ticket.status = 'resolved';
    ticket.resolution = {
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      resolutionNote: resolutionNote || 'Ticket resolved'
    };

    await ticket.save();
    await ticket.populate([
      { path: 'student', select: 'name email studentId' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' },
      { path: 'resolution.resolvedBy', select: 'name email' }
    ]);

    res.json({
      status: true,
      message: 'Ticket resolved successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Assign ticket to admin
 * @route   PUT /api/support-tickets/:id/assign
 * @access  Private (Admin/Coordinator)
 */
export const assignTicket = async (req, res) => {
  try {
    const { adminId } = req.body;
    
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: 'Support ticket not found'
      });
    }

    // Check if admin exists and has appropriate role
    const admin = await User.findById(adminId);
    if (!admin || !['admin', 'coordinator'].includes(admin.role)) {
      return res.status(400).json({
        status: false,
        message: 'Invalid admin user'
      });
    }

    // Check authorization
    const isAdmin = req.user.role === 'admin';
    const isCoordinatorOfDept = req.user.role === 'coordinator' && 
                                 req.user.department?.toString() === ticket.department.toString();

    if (!isAdmin && !isCoordinatorOfDept) {
      return res.status(403).json({
        status: false,
        message: 'Not authorized to assign this ticket'
      });
    }

    ticket.assignedTo = adminId;
    await ticket.save();
    
    await ticket.populate([
      { path: 'student', select: 'name email studentId' },
      { path: 'department', select: 'name code' },
      { path: 'assignedTo', select: 'name email' }
    ]);

    res.json({
      status: true,
      message: 'Ticket assigned successfully',
      data: ticket
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Delete support ticket
 * @route   DELETE /api/support-tickets/:id
 * @access  Private (Admin only)
 */
export const deleteSupportTicket = async (req, res) => {
  try {
    const ticket = await SupportTicket.findById(req.params.id);
    
    if (!ticket) {
      return res.status(404).json({
        status: false,
        message: 'Support ticket not found'
      });
    }

    await SupportTicket.deleteOne({ _id: ticket._id });
    
    res.json({
      status: true,
      message: 'Support ticket deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

/**
 * @desc    Get ticket statistics
 * @route   GET /api/support-tickets/stats
 * @access  Private (Admin/Coordinator)
 */
export const getTicketStats = async (req, res) => {
  try {
    const filter = {};
    
    // Coordinators can only see stats from their department
    if (req.user.role === 'coordinator' && req.user.department) {
      filter.department = req.user.department;
    }

    const stats = await SupportTicket.aggregate([
      { $match: filter },
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          byCategory: [
            { $group: { _id: '$category', count: { $sum: 1 } } }
          ],
          total: [
            { $count: 'count' }
          ]
        }
      }
    ]);

    res.json({
      status: true,
      message: 'Ticket statistics retrieved successfully',
      data: {
        total: stats[0].total[0]?.count || 0,
        byStatus: stats[0].byStatus,
        byPriority: stats[0].byPriority,
        byCategory: stats[0].byCategory
      }
    });
  } catch (error) {
    res.status(500).json({
      status: false,
      message: error.message
    });
  }
};

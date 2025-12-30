import Topic from '../models/topic.model.js';
import Department from '../models/department.model.js';
import User from '../models/user.model.js';
import { logActivity } from './activityLog.controller.js';

/**
 * @desc    Get all topics
 * @route   GET /api/topics
 * @access  Public
 */
export const getAllTopics = async (req, res) => {
  try {
    const { type, department, search, q } = req.query;
    const searchTerm = search || q;
    
    console.log(`[getAllTopics] Params: type=${type}, dept=${department}, search=${searchTerm}, page=${req.query.page}`);

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    const andConditions = [];
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by department if provided
    if (department) {
      andConditions.push({
        $or: [
          { department },
          { department: null } // General topics
        ]
      });
    }
    
    // Search in title, description, organizer, company, provider
    if (searchTerm) {
      const searchRegex = new RegExp(searchTerm, 'i');
      console.log(`[getAllTopics] Applying regex search for: "${searchTerm}"`);
      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { organizer: searchRegex },
          { company: searchRegex },
          { provider: searchRegex }
        ]
      });
    }
    
    const now = new Date();
    if (type === 'event') {
      query.endDate = { $gt: now };
    } else if (type === 'scholarship') {
      andConditions.push({
        $or: [
          { applicationDeadline: { $exists: false } },
          { applicationDeadline: null },
          { applicationDeadline: { $gt: now } }
        ]
      });
    } else if (type === 'notification') {
      // Only show notifications that haven't expired
      andConditions.push({
        $or: [
          { endDate: { $exists: false } },
          { endDate: null },
          { endDate: { $gt: now } }
        ]
      });
    }
    
    // Combine all conditions with $and if needed
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    
    console.log('[DEBUG] Final Query:', query);

    const total = await Topic.countDocuments(query);
    console.log('[DEBUG] Total Matches:', total);
    
    // Determine sort order based on type
    let sortOrder = { createdAt: -1 };
    if (type === 'event') {
      sortOrder = { startDate: 1 };
    } else if (type === 'scholarship') {
      sortOrder = { applicationDeadline: 1 };
    } else if (type === 'notification') {
      sortOrder = { isImportant: -1, createdAt: -1 };
    }
    
    const topics = await Topic.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort(sortOrder)
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: topics,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting topics list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get all topics (including expired)
 * @route   GET /api/topics/all
 * @access  Admin, Coordinator
 */
export const getAllTopicsAdmin = async (req, res) => {
  try {
    const { type, department, search } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const query = {};
    const andConditions = [];
    
    // Filter by type if provided
    if (type) {
      query.type = type;
    }
    
    // Filter by department if provided
    if (department) {
      query.department = department;
    }
    
    // If coordinator, only show topics from their department
    if (req.user.role === 'coordinator') {
      query.department = req.user.department;
    }
    
    // Search in title, description, organizer, company, provider
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      andConditions.push({
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { organizer: searchRegex },
          { company: searchRegex },
          { provider: searchRegex }
        ]
      });
    }
    
    // Combine all conditions with $and if needed
    if (andConditions.length > 0) {
      query.$and = andConditions;
    }
    
    const total = await Topic.countDocuments(query);
    
    const topics = await Topic.find(query)
      .populate('department', 'name code')
      .populate('createdBy', 'name role')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: topics,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting all topics:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get topic by ID
 * @route   GET /api/topics/:id
 * @access  Public
 */
export const getTopicById = async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id)
      .populate('department', 'name code')
      .populate('createdBy', 'name role');
    
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: topic
    });
  } catch (error) {
    console.error('Error getting topic details:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Create new topic
 * @route   POST /api/topics
 * @access  Admin, Coordinator
 */
export const createTopic = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      department,
      startDate,
      endDate,
      applicationDeadline,
      location,
      organizer,
      requirements,
      value,
      provider,
      eligibility,
      applicationProcess,
      isImportant,
      company,
      salary,
      position,
      contactInfo,
      metadata
    } = req.body;
    
    // Validate type
    const validTypes = ['event', 'scholarship', 'notification', 'job', 'advertisement', 'internship', 'recruitment', 'volunteer', 'extracurricular'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: `Invalid type. Allowed types: ${validTypes.join(', ')}`
      });
    }
    
    // Validate dates based on type
    if (type === 'event') {
      if (!startDate || !endDate) {
        return res.status(400).json({
          success: false,
          message: 'Start date and end date are required for events'
        });
      }
      if (new Date(startDate) >= new Date(endDate)) {
        return res.status(400).json({
          success: false,
          message: 'End date must be after start date'
        });
      }
    } else if (type === 'scholarship') {
      if (!applicationDeadline) {
        return res.status(400).json({
          success: false,
          message: 'Application deadline is required for scholarships'
        });
      }
    }
    
    // Check department if provided
    if (department) {
      const existingDepartment = await Department.findById(department);
      if (!existingDepartment) {
        return res.status(400).json({
          success: false,
          message: 'Department not found'
        });
      }
      
      // If coordinator, check permission
      if (req.user.role === 'coordinator') {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        if (userDepartment !== department) {
          return res.status(403).json({
            success: false,
            message: 'No permission to create topics for other departments'
          });
        }
      }
    }
    
    // Build topic data
    const topicData = {
      title,
      description,
      type,
      department: department || null,
      createdBy: req.user._id
    };
    
    // Add type-specific fields
    if (startDate) topicData.startDate = startDate;
    if (endDate) topicData.endDate = endDate;
    if (applicationDeadline) topicData.applicationDeadline = applicationDeadline;
    if (location) topicData.location = location;
    if (organizer) topicData.organizer = organizer;
    if (requirements) topicData.requirements = requirements;
    if (value) topicData.value = value;
    if (provider) topicData.provider = provider;
    if (eligibility) topicData.eligibility = eligibility;
    if (applicationProcess) topicData.applicationProcess = applicationProcess;
    if (isImportant !== undefined) topicData.isImportant = isImportant;
    if (company) topicData.company = company;
    if (salary) topicData.salary = salary;
    if (position) topicData.position = position;
    if (contactInfo) topicData.contactInfo = contactInfo;
    if (metadata) topicData.metadata = metadata;
    
    // Create topic
    const topic = await Topic.create(topicData);
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'CREATE',
      resource: 'Topic',
      resourceId: topic._id.toString(),
      details: `Created topic: ${topic.title} (Type: ${topic.type})`,
      req
    });
    
    res.status(201).json({
      success: true,
      message: 'New topic created',
      data: topic
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Update topic
 * @route   PUT /api/topics/:id
 * @access  Admin, Coordinator
 */
export const updateTopic = async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      department,
      startDate,
      endDate,
      applicationDeadline,
      location,
      organizer,
      requirements,
      value,
      provider,
      eligibility,
      applicationProcess,
      isImportant,
      company,
      salary,
      position,
      contactInfo,
      metadata
    } = req.body;
    
    // Find topic
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'coordinator') {
      // If topic has department
      if (topic.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const topicDepartment = topic.department.toString();
        
        // If not user's department
        if (userDepartment !== topicDepartment) {
          return res.status(403).json({
            success: false,
            message: 'No permission to update topics from other departments'
          });
        }
      }
      // If general topic, only admin can update
      else if (!topic.department) {
        return res.status(403).json({
          success: false,
          message: 'No permission to update general topics, only Admin has permission'
        });
      }
      
      // Cannot change department
      if (department && topic.department && department !== topic.department.toString()) {
        return res.status(403).json({
          success: false,
          message: 'No permission to change the department of the topic'
        });
      }
    }
    
    // Validate dates if provided
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      });
    }
    
    // Update topic fields
    if (title !== undefined) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (type !== undefined) topic.type = type;
    if (startDate !== undefined) topic.startDate = startDate;
    if (endDate !== undefined) topic.endDate = endDate;
    if (applicationDeadline !== undefined) topic.applicationDeadline = applicationDeadline;
    if (location !== undefined) topic.location = location;
    if (organizer !== undefined) topic.organizer = organizer;
    if (requirements !== undefined) topic.requirements = requirements;
    if (value !== undefined) topic.value = value;
    if (provider !== undefined) topic.provider = provider;
    if (eligibility !== undefined) topic.eligibility = eligibility;
    if (applicationProcess !== undefined) topic.applicationProcess = applicationProcess;
    if (isImportant !== undefined) topic.isImportant = isImportant;
    if (company !== undefined) topic.company = company;
    if (salary !== undefined) topic.salary = salary;
    if (position !== undefined) topic.position = position;
    if (contactInfo !== undefined) topic.contactInfo = contactInfo;
    if (metadata !== undefined) topic.metadata = metadata;
    
    // Only admin can change department
    if (req.user.role === 'admin' && department !== undefined) {
      topic.department = department || null;
    }
    
    await topic.save();
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'UPDATE',
      resource: 'Topic',
      resourceId: topic._id.toString(),
      details: `Updated topic: ${topic.title}`,
      req
    });
    
    res.status(200).json({
      success: true,
      message: 'Topic updated successfully',
      data: topic
    });
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Delete topic
 * @route   DELETE /api/topics/:id
 * @access  Admin, Coordinator
 */
export const deleteTopic = async (req, res) => {
  try {
    // Find topic
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    // Check permissions
    if (req.user.role === 'coordinator') {
      // If topic has department
      if (topic.department) {
        const userDepartment = req.user.department ? req.user.department.toString() : null;
        const topicDepartment = topic.department.toString();
        
        // If not user's department
        if (userDepartment !== topicDepartment) {
          return res.status(403).json({
            success: false,
            message: 'No permission to delete topics from other departments'
          });
        }
      }
      // If general topic, only admin can delete
      else if (!topic.department) {
        return res.status(403).json({
          success: false,
          message: 'No permission to delete general topics, only Admin has permission'
        });
      }
    }
    
    await Topic.deleteOne({ _id: req.params.id });
    
    // Remove topic from saved lists
    await User.updateMany(
      { savedTopics: topic._id },
      { $pull: { savedTopics: topic._id } }
    );
    
    // Log activity
    await logActivity({
      user: req.user,
      action: 'DELETE',
      resource: 'Topic',
      resourceId: topic._id.toString(),
      details: `Deleted topic: ${topic.title}`,
      req
    });
    
    res.status(200).json({
      success: true,
      message: 'Topic deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Save topic to favorites
 * @route   PUT /api/topics/:id/save
 * @access  Private
 */
export const saveTopic = async (req, res) => {
  try {
    // Check if topic exists
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    // Add to saved list if not already there
    const user = await User.findById(req.user._id);
    if (!user.savedTopics) {
      user.savedTopics = [];
    }
    if (!user.savedTopics.includes(topic._id)) {
      user.savedTopics.push(topic._id);
      await user.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Topic saved to favorites'
    });
  } catch (error) {
    console.error('Error saving topic:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Remove topic from favorites
 * @route   PUT /api/topics/:id/unsave
 * @access  Private
 */
export const unsaveTopic = async (req, res) => {
  try {
    // Check if topic exists
    const topic = await Topic.findById(req.params.id);
    if (!topic) {
      return res.status(404).json({
        success: false,
        message: 'Topic not found'
      });
    }
    
    // Remove from saved list
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { savedTopics: topic._id }
    });
    
    res.status(200).json({
      success: true,
      message: 'Topic removed from favorites'
    });
  } catch (error) {
    console.error('Error removing topic from favorites:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * @desc    Get saved topics list
 * @route   GET /api/topics/saved
 * @access  Private
 */
export const getSavedTopics = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const user = await User.findById(req.user._id)
      .populate({
        path: 'savedTopics',
        populate: [
          { path: 'department', select: 'name code' },
          { path: 'createdBy', select: 'name role' }
        ]
      });
    
    const savedTopics = user.savedTopics || [];
    const total = savedTopics.length;
    const paginatedTopics = savedTopics.slice(skip, skip + limit);
    const totalPages = Math.ceil(total / limit);
    
    res.status(200).json({
      success: true,
      data: paginatedTopics,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error getting saved topics list:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};


import User from '../models/user.model.js';
import Department from '../models/department.model.js';
import Topic from '../models/topic.model.js';

/**
 * @desc    Get statistics summary
 * @route   GET /api/statistics/summary
 * @access  Public (or Protected depending on requirements, usually Admin/Coordinator)
 */
export const getStatisticsSummary = async (req, res) => {
  try {
    const studentsCount = await User.countDocuments({ role: 'student' });
    const departmentsCount = await Department.countDocuments({});
    const coordinatorsCount = await User.countDocuments({ role: 'coordinator' });
    const topicsCount = await Topic.countDocuments({});

    // Count topics by type
    const topicsAggregation = await Topic.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    // Initialize default types with 0
    const topicsByType = {
      event: 0,
      scholarship: 0,
      notification: 0,
      job: 0,
      advertisement: 0,
      internship: 0,
      recruitment: 0,
      volunteer: 0,
      extracurricular: 0
    };

    // Map aggregation results to the object
    topicsAggregation.forEach(item => {
      if (item._id) {
        topicsByType[item._id] = item.count;
      }
    });

    res.status(200).json({
      success: true,
      message: 'Get statistics summary successfully',
      data: {
        studentsCount,
        departmentsCount,
        coordinatorsCount,
        topicsCount,
        topicsByType
      }
    });
  } catch (error) {
    console.error('Error getting statistics summary:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

export default {
  getStatisticsSummary
};

import { dataStore } from '../services/dataStore.js';

// @desc    Get all registered students
// @route   GET /api/students
// @access  Private/Admin
export const getAllStudents = async (req, res, next) => {
  try {
    const students = await dataStore.user.find({ role: 'student' });
    res.status(200).json({
      success: true,
      count: students.length,
      data: students,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update student preferred route or profile
// @route   PUT /api/students/:id/preferred-route
// @access  Private (Student or Admin)
export const updatePreferredRoute = async (req, res, next) => {
  try {
    const { preferredRoute } = req.body;
    const userId = req.params.id;

    const user = await dataStore.user.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Student not found.',
      });
    }

    // Allow user to update their own route, or admin
    if (req.user.role !== 'admin' && req.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to modify another user profile.',
      });
    }

    // In dataStore, if user is in memory:
    user.preferredRoute = preferredRoute;
    const updated = await dataStore.user.findById(userId);

    res.status(200).json({
      success: true,
      message: 'Preferred route updated successfully.',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

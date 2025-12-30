import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';
import { logActivity } from '../controllers/activityLog.controller.js';

dotenv.config();

/**
 * Middleware xác thực người dùng
 */
export const authenticate = async (req, res, next) => {
  try {
    let token;
    
    // Lấy token từ Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Kiểm tra token tồn tại
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'No token, access denied'
      });
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm người dùng từ token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User does not exist'
      });
    }
    
    // Kiểm tra tài khoản có hoạt động không
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Account has been locked'
      });
    }
    
    // Gán thông tin người dùng vào request
    req.user = user;
    
    // AUTO ACTIVITY LOGGING HOOK
    // Only for Admin/Coordinator and modifying methods (POST, PUT, PATCH, DELETE)
    if ((user.role === 'admin' || user.role === 'coordinator') && 
        ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      
      res.on('finish', () => {
        // Only log successful requests (2xx codes) and if not already logged manually
        if (res.statusCode >= 200 && res.statusCode < 300 && !req.activityLogged) {
          
          let action = 'UPDATE'; // Default
          if (req.method === 'POST') action = 'CREATE';
          else if (req.method === 'DELETE') action = 'DELETE';
          
          // Infer resource name from URL (e.g., /api/users -> User)
          // Simple heuristic: get the second segment of path
          const pathSegments = req.originalUrl.split('/').filter(Boolean);
          let resource = 'Unknown';
          if (pathSegments.length >= 2 && pathSegments[0] === 'api') {
            // Capitalize first letter of resource, e.g., 'users' -> 'Users'
            resource = pathSegments[1].charAt(0).toUpperCase() + pathSegments[1].slice(1);
          }
          
          logActivity({
            user: req.user,
            action,
            resource,
            resourceId: req.params.id || null, // Best effort capture
            details: `Auto-logged: ${action} on ${req.originalUrl}`,
            req
          });
        }
      });
    }

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    }
    
    console.error('Lỗi xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra vai trò admin
 */
export const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied, only Admin has permission'
    });
  }
};

/**
 * Middleware kiểm tra vai trò coordinator
 */
export const isCoordinator = (req, res, next) => {
  if (req.user && req.user.role === 'coordinator') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied, only Coordinator has permission'
    });
  }
};

/**
 * Middleware kiểm tra vai trò student
 */
export const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied, only Student has permission'
    });
  }
};

/**
 * Middleware kiểm tra vai trò admin hoặc coordinator
 */
export const isAdminOrCoordinator = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'coordinator')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied, only Admin or Coordinator has permission'
    });
  }
};

/**
 * Middleware kiểm tra quyền truy cập cho tất cả người dùng (public)
 */
export const isAnyUser = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'coordinator' || req.user.role === 'student')) {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  }
};

/**
 * Middleware kiểm tra coordinator chỉ truy cập dữ liệu thuộc ngành mình
 */
export const checkDepartmentAccess = async (req, res, next) => {
  try {
    // Nếu là admin, cho phép truy cập tất cả
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Nếu là coordinator, kiểm tra ngành
    if (req.user.role === 'coordinator') {
      const departmentId = req.params.departmentId || req.body.department;
      
      // Nếu không có departmentId, cho phép truy cập (sẽ được xử lý trong controller)
      if (!departmentId) {
        return next();
      }
      
      const userDepartment = req.user.department ? req.user.department.toString() : null;
      
      // Kiểm tra xem người dùng có thuộc ngành được truy cập không
      if (userDepartment !== departmentId) {
        return res.status(403).json({
          success: false,
          message: 'No permission to access data from other departments'
        });
      }
      
      return next();
    }
    
    // Nếu vai trò khác, từ chối truy cập
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    console.error('Lỗi kiểm tra quyền truy cập ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Middleware kiểm tra coordinator chỉ được thao tác với dữ liệu thuộc ngành mình
 */
export const checkCoordinatorDepartmentAccess = async (req, res, next) => {
  try {
    // Nếu là admin, cho phép truy cập tất cả
    if (req.user.role === 'admin') {
      return next();
    }
    
    // Nếu là coordinator, kiểm tra ngành
    if (req.user.role === 'coordinator') {
      const userDepartment = req.user.department ? req.user.department.toString() : null;
      
      // Lưu department của user để sử dụng trong controller
      req.userDepartment = userDepartment;
      
      return next();
    }
    
    // Nếu vai trò khác, từ chối truy cập
    res.status(403).json({
      success: false,
      message: 'Access denied'
    });
  } catch (error) {
    console.error('Lỗi kiểm tra quyền truy cập:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
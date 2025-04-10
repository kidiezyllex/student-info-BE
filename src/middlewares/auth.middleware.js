import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import dotenv from 'dotenv';

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
        message: 'Không có token, từ chối truy cập'
      });
    }
    
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Tìm người dùng từ token
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Người dùng không tồn tại'
      });
    }
    
    // Kiểm tra tài khoản có hoạt động không
    if (!user.active) {
      return res.status(401).json({
        success: false,
        message: 'Tài khoản đã bị khóa'
      });
    }
    
    // Gán thông tin người dùng vào request
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token không hợp lệ'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token đã hết hạn'
      });
    }
    
    console.error('Lỗi xác thực:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
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
      message: 'Không có quyền truy cập, chỉ Admin mới có quyền'
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
      message: 'Không có quyền truy cập, chỉ Coordinator mới có quyền'
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
      message: 'Không có quyền truy cập, chỉ Admin hoặc Coordinator mới có quyền'
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
          message: 'Không có quyền truy cập dữ liệu của ngành khác'
        });
      }
      
      return next();
    }
    
    // Nếu vai trò khác, từ chối truy cập
    res.status(403).json({
      success: false,
      message: 'Không có quyền truy cập'
    });
  } catch (error) {
    console.error('Lỗi kiểm tra quyền truy cập ngành:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server',
      error: error.message
    });
  }
}; 
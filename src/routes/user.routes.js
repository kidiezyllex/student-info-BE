import express from 'express';
import { 
  getUsers, 
  createUser,
  getUserById, 
  updateUser, 
  updateUserProfile,
  deleteUser,
  getUsersByRole,
  getUsersByDepartment
} from '../controllers/user.controller.js';
import { authenticate, isAdmin, isAdminOrCoordinator } from '../middlewares/auth.middleware.js';

const router = express.Router();

/**
 * @swagger
 * /users:
 *   post:
 *     summary: Create new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, coordinator, admin]
 *                 default: student
 *               studentId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               department:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: User already exists or invalid data
 *       401:
 *         description: Not authorized
 */
router.post('/', authenticate, isAdmin, createUser);

/**
 * @swagger
 * /users:
 *   get:
 *     summary: Get all users (Admin sees all, Coordinator sees only their department)
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, coordinator, admin]
 *       - in: query
 *         name: department
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of users
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
 *       401:
 *         description: Not authorized
 */
router.get('/', authenticate, isAdminOrCoordinator, getUsers);

/**
 * @swagger
 * /users/role/{role}:
 *   get:
 *     summary: Get users by role
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, coordinator, admin]
 *         required: true
 *         description: User role
 *     responses:
 *       200:
 *         description: List of users by role
 *       400:
 *         description: Invalid role specified
 *       401:
 *         description: Not authorized
 */
router.get('/role/:role', authenticate, isAdmin, getUsersByRole);

/**
 * @swagger
 * /users/department/{departmentId}:
 *   get:
 *     summary: Get users by department
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: departmentId
 *         schema:
 *           type: string
 *         required: true
 *         description: Department ID
 *     responses:
 *       200:
 *         description: List of users in department
 *       401:
 *         description: Not authorized
 */
router.get('/department/:departmentId', authenticate, getUsersByDepartment);

/**
 * @swagger
 * /users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User data
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: User not found
 */
router.get('/:id', authenticate, getUserById);

/**
 * @swagger
 * /users/{id}:
 *   put:
 *     summary: Update user basic information
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               studentId:
 *                 type: string
 *               fullName:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               avatar:
 *                 type: string
 *               role:
 *                 type: string
 *                 enum: [student, coordinator, admin]
 *               department:
 *                 type: string
 *               active:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: User updated
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized
 */
router.put('/:id', authenticate, updateUser);

/**
 * @swagger
 * /users/{id}/profile:
 *   put:
 *     summary: Update user profile (comprehensive)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               avatar:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   ward:
 *                     type: string
 *                   district:
 *                     type: string
 *                   city:
 *                     type: string
 *                   zipCode:
 *                     type: string
 *               emergencyContact:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   relationship:
 *                     type: string
 *                   phoneNumber:
 *                     type: string
 *               studentInfo:
 *                 type: object
 *                 description: Only for students
 *               coordinatorInfo:
 *                 type: object
 *                 description: Only for coordinators
 *               profileSettings:
 *                 type: object
 *                 properties:
 *                   isPublic:
 *                     type: boolean
 *                   showEmail:
 *                     type: boolean
 *                   showPhone:
 *                     type: boolean
 *                   allowMessages:
 *                     type: boolean
 *                   emailNotifications:
 *                     type: boolean
 *               socialLinks:
 *                 type: object
 *                 properties:
 *                   facebook:
 *                     type: string
 *                   linkedin:
 *                     type: string
 *                   github:
 *                     type: string
 *                   website:
 *                     type: string
 *     responses:
 *       200:
 *         description: User profile updated
 *       404:
 *         description: User not found
 *       403:
 *         description: Not authorized
 */
router.put('/:id/profile', authenticate, updateUserProfile);

/**
 * @swagger
 * /users/{id}:
 *   delete:
 *     summary: Delete user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted
 *       404:
 *         description: User not found
 *       400:
 *         description: Cannot delete admin user
 */
router.delete('/:id', authenticate, isAdmin, deleteUser);

export default router; 
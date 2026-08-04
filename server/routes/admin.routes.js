import express from 'express';
import verifyToken from '../middleware/verifyToken.js';
import checkRole from '../middleware/checkRole.js';
import { getPlatformStats, listAllEvents } from '../controller/admin.controller.js';
import { listUsers, getUserById, updateUserRole, deactivateUser, deleteUser } from '../controller/user.controller.js';

const router = express.Router();

router.use(verifyToken, checkRole(['admin']));

router.get('/stats', getPlatformStats);
router.get('/events', listAllEvents);

router.get('/users', listUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/deactivate', deactivateUser);
router.delete('/users/:id', deleteUser);

export default router;

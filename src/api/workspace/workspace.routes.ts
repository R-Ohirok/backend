import Router from 'koa-router';
import authMiddleware from '../../middleware/authMiddleware.js';
import { addUserToWorkspace, createWorkspace, getAllWorkspaces, getUserWorkspaces, removeUserFromWorkspace } from './workspace.controllers.js';

const router = new Router();

router.get('/workspace/all', authMiddleware, getAllWorkspaces);
router.get('/workspace/user', authMiddleware, getUserWorkspaces);
router.post('/workspace/create', authMiddleware, createWorkspace);
router.post('/workspace/add-user', authMiddleware, addUserToWorkspace);
router.post('/workspace/remove-user', authMiddleware, removeUserFromWorkspace);

export default router;
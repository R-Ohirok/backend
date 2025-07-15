import Router from 'koa-router';
import authMiddleware from '../../middleware/authMiddleware.js';
import { addUserToWorkspace, createWorkspace, removeUserFromWorkspace } from './workspace.controllers.js';

const router = new Router();

// POST /workspaces/create-with-user
router.post('/workspace/create', authMiddleware, createWorkspace);

// POST /workspaces/add-user
router.post('workspace//add-user', authMiddleware, addUserToWorkspace);

// POST /workspaces/remove-user
router.post('workspace/remove-user', authMiddleware, removeUserFromWorkspace);

export default router;
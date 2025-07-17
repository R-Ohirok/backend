import Router from 'koa-router';
import authMiddleware from '../../middleware/authMiddleware.js';
import { joinWorkspace, createWorkspace, getAllWorkspaces } from './workspace.controllers.js';

const router = new Router();

router.get('/workspace/all', authMiddleware, getAllWorkspaces);
router.post('/workspace/create', authMiddleware, createWorkspace);
router.post('/workspace/add-user', authMiddleware, joinWorkspace);

export default router;
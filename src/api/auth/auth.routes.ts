import Router from 'koa-router';
import { verifyEmail, login, register, refresh, logout } from './auth.controller.js';

const router = new Router();

router.post('/auth/register', register);
router.post('/auth/verifyemail', verifyEmail);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/refresh', refresh);

export default router;
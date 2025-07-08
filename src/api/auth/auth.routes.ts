import Router from 'koa-router';
import { verifyEmail, login, register, refresh } from './auth.controller.js';

const router = new Router();

router.post('/auth/register', register);
router.post('/auth/verifyemail', verifyEmail);
router.post('/auth/login', login);
router.get('/auth/refresh', refresh);

export default router;
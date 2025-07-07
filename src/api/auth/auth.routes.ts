import Router from 'koa-router';
import { verifyEmail, login, register } from './auth.controller.js';

const router = new Router();

router.post('/auth/register', register);
router.post('/auth/verifyemail', verifyEmail);
router.post('/auth/login', login);

export default router;
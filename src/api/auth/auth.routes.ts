import Router from 'koa-router';
import { findUser, login, register } from './auth.controller.js';

const router = new Router();

router.post('/auth/register', register);
router.post('/auth/finduser', findUser);
router.post('/auth/login', login);

export default router;
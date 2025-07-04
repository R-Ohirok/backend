import Router from 'koa-router';
import { register } from './auth.controller.js';

const router = new Router();

router.post('/auth/register', register);

export default router;
import Router from "koa-router";
import { getTodos } from './todos.controllers.js';


const router = new Router();

router.get("/todos", getTodos);

export default router;
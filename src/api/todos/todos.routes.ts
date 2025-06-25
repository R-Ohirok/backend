import Router from "koa-router";
import { getTodos, postTodo } from './todos.controllers.js';


const router = new Router();

router.get("/todos", getTodos);
router.post('/todos', postTodo);

export default router;
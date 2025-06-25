import Router from "koa-router";
import { deleteTodo, getTodos, postTodo } from './todos.controllers.js';


const router = new Router();

router.get("/todos", getTodos);
router.post('/todos', postTodo);
router.delete('/todos/:id', deleteTodo);

export default router;
import Router from "koa-router";
import { deleteTodo, getTodos, createTodo } from './todos.controllers.js';


const router = new Router();

router.get("/todos", getTodos);
router.post('/todos', createTodo);
router.delete('/todos/:id', deleteTodo);

export default router;
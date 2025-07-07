import Router from "koa-router";
import { deleteTodo, getTodos, createTodo, updateTodo } from './todos.controllers.js';
import authMiddleware from "../../middleware/authMiddleware.js";


const router = new Router();

router.get('/todos', authMiddleware, getTodos);
router.post('/todos', authMiddleware, createTodo);
router.delete('/todos/:id', authMiddleware, deleteTodo);
router.patch('/todos/:id', authMiddleware, updateTodo);

export default router;
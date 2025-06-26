import type { Context } from 'koa';
import { z } from 'zod';

type ToDoType = {
  id: string;
  title: string;
  is_completed: boolean;
};

const todos: ToDoType[] = [
  {
    id: "1",
    title: "test 1",
    is_completed: false,
  },
  {
    id: "2",
    title: "test 2",
    is_completed: true,
  },
  {
    id: "3",
    title: "test 3",
    is_completed: false,
  },
  {
    id: "4",
    title: "test 4",
    is_completed: true,
  },
  {
    id: "5",
    title: "test 5",
    is_completed: false,
  },
];

const GetTodosQuerySchema = z.object({
  page: z.string().optional().default('1'),
  status: z.string().optional().default('All'),
  title: z.string().optional().default(''),
});

const CreateToDoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  is_completed: z.boolean(),
});

export const getTodos = async (ctx: Context) => {
  const queryValidation = GetTodosQuerySchema.safeParse(ctx.query);

  // const { page, status, title } = queryValidation.data;

  ctx.status = 200;
  ctx.body = todos;
};

export const createTodo = async (ctx: Context) => {
  const bodyValidation = CreateToDoSchema.safeParse(ctx.request.body);

  if (!bodyValidation.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid ToDo data', errors: bodyValidation.error.format() };
    return;
  }

  const newTodo = bodyValidation.data;
  todos.push(newTodo);

  ctx.status = 200;
};

export const deleteTodo = async (ctx:Context) => {
  const idToDelete = ctx.params.id;

  const index = todos.findIndex(todo => todo.id === idToDelete);

  if (index === -1) {
    ctx.status = 404;
    ctx.body = { message: 'ToDo not found' };
    return;
  }

  todos.splice(index, 1);

  ctx.status = 200;
};

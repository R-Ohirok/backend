import type { Context } from 'koa';
import { z } from 'zod';
import { client } from '../../utils/dataBase.js';

type ToDoType = {
  id: string;
  title: string;
  is_completed: boolean;
};

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


  const { rows } = await client.query(`
    SELECT *
    FROM todos
  `);

  // const { page, status, title } = queryValidation.data;
  
  ctx.status = 200;
  ctx.body = rows;
};

export const createTodo = async (ctx: Context) => {
  const bodyValidation = CreateToDoSchema.safeParse(ctx.request.body);

  if (!bodyValidation.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid ToDo data', errors: bodyValidation.error.format() };
    return;
  }

  const { id, title, is_completed } = bodyValidation.data;

  const { rows } = await client.query<ToDoType>(`
    INSERT INTO todos
    (id, title, is_completed)
    VALUES ($1, $2, $3)
    RETURNING *`,
    [id, title, is_completed]
  );

  ctx.status = 200;
  ctx.body = rows[0];
};

export const deleteTodo = async (ctx:Context) => {
  const idToDelete = ctx.params.id;

  await client.query(`
    DELETE 
    FROM todos 
    WHERE id = $1`,
    [idToDelete]
  );

  ctx.status = 200;
};


import type { Context } from 'koa';
import { z } from 'zod';
import ToDo from '../../config/models/ToDo.js';

const GetTodosQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => {
      const parsed = Number(val);
      return Number.isInteger(parsed) && parsed > 0 ? parsed : 1;
    }),
  status: z.string().optional().default('All'),
  title: z.string().optional().default(''),
});

const CreateToDoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  is_completed: z.boolean(),
});

const ITEMS_PER_PAGE = 5;

export const getTodos = async (ctx: Context) => {
  const parsed = GetTodosQuerySchema.safeParse(ctx.query);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid query', errors: parsed.error.format() };
    return;
  }

  let { status, title, page = 1 } = parsed.data;


  let baseQuery = ToDo.query();

  if (status === 'Completed') {
    baseQuery = baseQuery.where('is_completed', true);
  } else if (status === 'Active') {
    baseQuery = baseQuery.where('is_completed', false);
  }

  if (title) {
    baseQuery = baseQuery.where('title', 'ilike', `%${title}%`);
  }

  const totalCount = await baseQuery.resultSize();
  const pagesCount = Math.ceil(totalCount / ITEMS_PER_PAGE);

  while (page > pagesCount && page > 1) {
    page--;
  }

  const todos = await baseQuery
    .limit(ITEMS_PER_PAGE)
    .offset((page - 1) * ITEMS_PER_PAGE);

  ctx.status = 200;
  ctx.body = {
    pagesCount,
    activePage: page,
    todos,
  };
};
export const createTodo = async (ctx: Context) => {
  const parsed = CreateToDoSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid ToDo data', errors: parsed.error.format() };
    return;
  }

  const todo = await ToDo.query().insert(parsed.data);

  ctx.status = 200;
  ctx.body = todo;
};

export const deleteTodo = async (ctx: Context) => {
  const id = ctx.params.id;

  await ToDo.query().deleteById(id);

  ctx.status = 200;
};
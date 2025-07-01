import type { Context } from 'koa';
import { z } from 'zod';
import ToDo from '../../config/models/ToDo.js';

const GetTodosQuerySchema = z.object({
  status: z.string().optional().default('All'),
  title: z.string().optional().default(''),
  limit: z.preprocess(
    (val) => {
      if (typeof val === 'string') return Number(val);
      return val;
    },
    z
      .number({
        invalid_type_error: 'Limit must be a number',
      })
      .int({ message: 'Limit must be an integer' })
      .positive({ message: 'Limit must be greater than 0' })
      .optional()
      .default(5)
  ),

  offset: z.preprocess(
    (val) => {
      if (typeof val === 'string') return Number(val);
      return val;
    },
    z
      .number({
        invalid_type_error: 'Offset must be a number',
      })
      .int({ message: 'Offset must be an integer' })
      .min(0, { message: 'Offset must be 0 or greater' })
      .optional()
      .default(0)
  ),
});

const CreateToDoSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  is_completed: z.boolean(),
});

const UpdateToDoSchema = z.object({
  title: z.string().min(1).optional(),
  is_completed: z.boolean().optional(),
});

export const getTodos = async (ctx: Context) => {
  const parsed = GetTodosQuerySchema.safeParse(ctx.query);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = { message: 'Invalid query', errors: parsed.error.format() };

    return;
  }

  let { status, title, limit, offset } = parsed.data;


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
  const pagesCount = Math.ceil(totalCount / limit);

  const todos = await baseQuery
    .limit(limit)
    .offset(offset)
    .orderBy('id');;

  ctx.status = 200;
  ctx.body = {
    pagesCount,
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

export const updateTodo = async (ctx: Context) => {
  const id = ctx.params.id;

  const parsed = UpdateToDoSchema.safeParse(ctx.request.body);

  if (!parsed.success) {
    ctx.status = 400;
    ctx.body = {
      message: 'Invalid update data',
      errors: parsed.error.format(),
    };

    return;
  }

  const updatedData = parsed.data;

  const updatedTodo = await ToDo.query()
    .patchAndFetchById(id, updatedData);

  if (!updatedTodo) {
    ctx.status = 404;
    ctx.body = { message: 'ToDo not found' };

    return;
  }

  ctx.status = 200;
};
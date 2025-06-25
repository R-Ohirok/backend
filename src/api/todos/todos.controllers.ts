import type { Context } from 'koa';

type ToDoType = {
  id: string;
  title: string;
  is_completed: boolean;
}

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

export const getTodos = async (ctx: Context) => {
  const { page = '1', status = 'All', title = '' } = ctx.query;
  
  ctx.body = todos;
};

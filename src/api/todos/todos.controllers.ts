import type { Context } from 'koa';

const todos = [
  {
    id: "1",
    title: "test 1",
    isCompleted: "false",
  },
  {
    id: "2",
    title: "test 2",
    isCompleted: "true",
  },
  {
    id: "3",
    title: "test 3",
    isCompleted: "false",
  },
  {
    id: "4",
    title: "test 4",
    isCompleted: "true",
  },
  {
    id: "5",
    title: "test 5",
    isCompleted: "false",
  },
];

export const getTodos = async (ctx: Context) => {
  const { page = '1', status = 'All', title = '' } = ctx.query;
  
  ctx.body = todos;
};

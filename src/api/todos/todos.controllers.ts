import type { Context } from 'koa';

type ToDoType = {
  id: string;
  title: string;
  isCompleted: boolean;
}

const todos: ToDoType[] = [
  {
    id: "1",
    title: "test 1",
    isCompleted: false,
  },
  {
    id: "2",
    title: "test 2",
    isCompleted: true,
  },
  {
    id: "3",
    title: "test 3",
    isCompleted: false,
  },
  {
    id: "4",
    title: "test 4",
    isCompleted: true,
  },
  {
    id: "5",
    title: "test 5",
    isCompleted: false,
  },
];

export const getTodos = async (ctx: Context) => {
  const { page = '1', status = 'All', title = '' } = ctx.query;
  
  ctx.body = todos;
};

export const postTodo = async (ctx: Context) => {
  const { id, title, isCompleted } = ctx.request.body as ToDoType;

  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof isCompleted !== 'boolean'
  ) {
    throw new Error('Invalid ToDo data');
  }

  const newTodo: ToDoType = { id, title, isCompleted };

  todos.push(newTodo);

  ctx.status = 201;
  ctx.body = newTodo;
};

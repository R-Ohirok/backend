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

export const postTodo = async (ctx: Context) => {
  const { id, title, is_completed } = ctx.request.body as ToDoType;

  if (
    typeof id !== 'string' ||
    typeof title !== 'string' ||
    typeof is_completed !== 'boolean'
  ) {
    throw new Error('Invalid ToDo data');
  }

  const newTodo: ToDoType = { id, title, is_completed };

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
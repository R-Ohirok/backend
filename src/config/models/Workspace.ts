import { Model } from 'objection';
import User from './User.js';
import ToDo from './ToDo.js';

class Workspace extends Model {
  static tableName = 'workspace';
  id!: number;
  name!: string;

  users?: User[];
  todos?: ToDo[];

  static relationMappings = () => ({
    users: {
      relation: Model.HasManyRelation,
      modelClass: User,
      join: {
        from: 'workspace.id',
        to: 'users.workspace_id',
      },
    },
    todos: {
      relation: Model.HasManyRelation,
      modelClass: ToDo,
      join: {
        from: 'workspace.id',
        to: 'todos.workspace_id',
      },
    },
  });
}

export default Workspace;

import { Model } from 'objection';
import User from './User.js';
import ToDo from './ToDo.js';

class Workspace extends Model {
  static tableName = 'workspace';

  static relationMappings = () => ({
    users: {
      relation: Model.ManyToManyRelation,
      modelClass: User,
      join: {
        from: 'workspace.id',
        through: {
          from: 'workspace_users.workspace_id',
          to: 'workspace_users.user_id',
        },
        to: 'users.id',
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
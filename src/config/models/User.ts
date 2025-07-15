import { Model } from 'objection';
import Workspace from './Workspace.js';

class User extends Model {
  id!: number;
  email!: string;
  password!: string;
  workspaces?: Workspace[];

  static tableName = 'users';

  static relationMappings = () => ({
    workspaces: {
      relation: Model.ManyToManyRelation,
      modelClass: Workspace,
      join: {
        from: 'users.id',
        through: {
          from: 'workspace_users.user_id',
          to: 'workspace_users.workspace_id',
        },
        to: 'workspace.id',
      },
    },
  });
}

export default User;

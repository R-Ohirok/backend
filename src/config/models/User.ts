import { Model } from 'objection';
import Workspace from './Workspace.js';

class User extends Model {
  id!: number;
  email!: string;
  password!: string;
  workspace_id!: number | null;  // нове поле

  static tableName = 'users';

  static relationMappings = () => ({
    workspace: {
      relation: Model.BelongsToOneRelation,
      modelClass: Workspace,
      join: {
        from: 'users.workspace_id',
        to: 'workspaces.id',
      },
    },
  });
}

export default User;

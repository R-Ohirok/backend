import { Model } from 'objection';
import Workspace from './Workspace.js';

class ToDo extends Model {
  id!: string;
  title!: string;
  is_completed!: boolean;
  workspace_id!: number;

  static get tableName() {
    return 'todos';
  }

  static get idColumn() {
    return 'id';
  }

  static relationMappings = () => ({
    workspace: {
      relation: Model.BelongsToOneRelation,
      modelClass: Workspace,
      join: {
        from: 'todos.workspace_id',
        to: 'workspaces.id',
      },
    },
  });
}

export default ToDo;
import { Model } from 'objection';

class ToDo extends Model {
  id!: string;
  title!: string;
  is_completed!: boolean;

  static get tableName() {
    return 'todos';
  };

  static get idColumn() {
    return 'id';
  };
};

export default ToDo;
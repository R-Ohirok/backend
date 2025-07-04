import { Model } from 'objection';

class User extends Model {
  id!: number;
  email!: string;
  password!: string;

  static get tableName() {
    return 'users';
  };
}

export default User;

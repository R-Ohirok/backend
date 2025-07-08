import { Model } from 'objection';

class TokenBlacklist extends Model {
  id!: number;
  token!: string;
  expires_at!: number;

  static get tableName() {
    return 'token_blacklist';
  };

}

export default TokenBlacklist;
/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  await knex.schema.createTable('workspace_users', (table) => {
    table.increments('id').primary();

    table.integer('workspace_id').unsigned().notNullable()
      .references('id').inTable('workspace').onDelete('CASCADE');

    table.integer('user_id').unsigned().notNullable()
      .references('id').inTable('users').onDelete('CASCADE');

    table.unique(['workspace_id', 'user_id']);

  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  await knex.schema.dropTableIfExists('workspace_users');
}
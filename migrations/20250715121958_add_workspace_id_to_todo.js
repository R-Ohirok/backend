/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.alterTable('todos', (table) => {
    table.integer('workspace_id').unsigned().notNullable()
      .references('id').inTable('workspaces').onDelete('CASCADE');
  });
}

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.alterTable('todos', (table) => {
    table.dropColumn('workspace_id');
  });
}

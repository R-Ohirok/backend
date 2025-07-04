/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function up(knex) {
  return knex.schema.createTable('users', (table) => {
    table.increments('id').primary();               // ➕ автоінкремент id
    table.text('email').notNullable().unique();     // ✉️ унікальний email
    table.text('password').notNullable();           // 🔒 хешований пароль
  });
}

/**
 * @param { import('knex').Knex } knex
 * @returns { Promise<void> }
 */
export async function down(knex) {
  return knex.schema.dropTable('users');
}
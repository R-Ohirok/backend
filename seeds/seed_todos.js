/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('table_name').del()
  await knex('table_name').insert([
    {
      id: 'todo-001',
      title: 'todo 1',
      is_completed: true,
    },
    {
      id: 'todo-002',
      title: 'todo 2',
      is_completed: false,
    },
    {
      id: 'todo-003',
      title: 'todo 3',
      is_completed: false,
    },
    {
      id: 'todo-004',
      title: 'todo 4',
      is_completed: true,
    },
    {
      id: 'todo-005',
      title: 'todo 5',
      is_completed: false,
    },
    {
      id: 'todo-006',
      title: 'todo 6',
      is_completed: true,
    },
  ]);
};

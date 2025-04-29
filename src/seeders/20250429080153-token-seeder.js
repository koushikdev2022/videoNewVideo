'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('tokens', [
      {
        plan_name: 'Video With Image',
        price:2,
        image_count: 1,
        image_action:1,
        is_active: 1,
        is_delete: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        plan_name: 'Runway Video',
        price:2,
        image_count: 1,
        image_action:1,
        is_active: 1,
        is_delete: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        plan_name: 'Video Two Video',
        price:2,
        image_count: 1,
        image_action:1,
        is_active: 1,
        is_delete: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        plan_name: 'Audio',
        price:2,
        image_count: 0,
        image_action:0,
        is_active: 0,
        is_delete: 0,
        created_at: new Date(),
        updated_at: new Date()
      },
     
    ], {});
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};

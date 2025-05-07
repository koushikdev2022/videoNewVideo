'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'access_key', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });
    await queryInterface.addColumn('users', 'secret_key', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'youtube_access_token', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });
    await queryInterface.addColumn('users', 'youtube_refresh_token', {
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

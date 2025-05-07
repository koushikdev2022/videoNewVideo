'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('videos', 'youtube_upload_status', {
      type: Sequelize.STRING, 
      allowNull: true, 
    });
    await queryInterface.addColumn('videos', 'youtube_upload_pid', {
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

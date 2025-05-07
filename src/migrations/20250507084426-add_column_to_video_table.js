'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    
      await queryInterface.addColumn('videos', 'youtube_upload_started_at', {
        type: Sequelize.DATE, 
        allowNull: true, 
      });
      await queryInterface.addColumn('videos', 'youtube_error', {
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

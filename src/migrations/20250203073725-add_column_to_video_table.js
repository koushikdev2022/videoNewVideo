'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('videos', 'title', {
      type: Sequelize.TEXT('long'), 
      allowNull: true,        
      after: 'thumbnail',
    });
    await queryInterface.addColumn('videos', 'description', {
      type: Sequelize.TEXT('long'), 
      allowNull: true,        
      after: 'title',
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

'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('tokens', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      plan_name:{
        allowNull: false,
        type: Sequelize.STRING,
      },
      price:{
        allowNull: false,
        type: Sequelize.FLOAT,
      },
      image_count:{
        allowNull: true,
        type: Sequelize.INTEGER,
      },
      image_action: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValues:0,
      },
      is_active: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValues:1,
      },
      is_delete: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValues:0,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
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

'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class Token extends Model {
    
    static associate(models) {
    
    }
  }
  Token.init({
    plan_name: DataTypes.STRING,
    price:DataTypes.FLOAT,
    image_count:DataTypes.INTEGER,
    image_action:DataTypes.INTEGER,
    is_active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    is_delete: {
        allowNull: false,
        type: Sequelize.INTEGER,
        defaultValues:0,
      },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.NOW,
    },
  }, {
    sequelize,
    modelName: 'Token',
    tableName: 'tokens',
    timestamps: false,
    underscored: true,
  });
  return Token;
};
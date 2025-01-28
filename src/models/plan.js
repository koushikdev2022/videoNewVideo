'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    
    static associate(models) {
      Plan.hasMany(models.Transaction,{
        foreignKey:"plan_id",
        as:"Transaction"
      })
    }
  }
  Plan.init({
    plan_name: DataTypes.STRING,
    credit:DataTypes.INTEGER,
    price:DataTypes.FLOAT,
    currency: {
      type: DataTypes.STRING,
      defaultValue: "usd",
    },
    is_active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
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
    modelName: 'Plan',
    tableName: 'plans',
    timestamps: false,
    underscored: true,
  });
  return Plan;
};
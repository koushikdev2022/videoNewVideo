'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
      User.hasMany(models.UserAddress, {
        foreignKey: "user_id",
        as: "UserAddress"
      })
      User.hasMany(models.Order,{
        foreignKey:"user_id",
        as:"Order"
      })
      User.hasMany(models.DelegateOrderMap,{
          foreignKey:"user_id",
          as:"DelegateOrderMap"
      })
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    fullname: DataTypes.STRING,
    email: DataTypes.STRING,
    phone: DataTypes.STRING,
    dob: DataTypes.DATE,
    avatar: DataTypes.STRING,
    otp: DataTypes.STRING,
    otp_expired_at: DataTypes.DATEONLY,
    refresh_token: DataTypes.TEXT,
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
    modelName: 'User',
    tableName: 'users',
    timestamps: false,
    underscored: true,
  });
  return User;
};
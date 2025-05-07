'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
        User.hasMany(models.Video,{
          foreignKey:"user_id",
          as:"Video"
        })
        User.hasMany(models.UserAddress,{
          foreignKey:"user_id",
          as:"UserAddress"
        })
        User.hasOne(models.Wallet,{
          foreignKey:"user_id",
          as:"Wallet"
        })
        User.hasMany(models.Transaction,{
          foreignKey:"user_id",
          as:"Transaction"
        })
    }
  }
  User.init({
   
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    youtube_access_token:DataTypes.STRING,
    youtube_refresh_token:DataTypes.STRING,
    access_key:DataTypes.STRING,
    secret_key:DataTypes.STRING,
    full_name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.INTEGER,
    dob: DataTypes.DATE,
    avatar: DataTypes.STRING,
    otp: DataTypes.STRING,
    otp_expaired_at: DataTypes.DATEONLY,
    refresh_token: DataTypes.TEXT,
    is_active: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
    },
    is_verify: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
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
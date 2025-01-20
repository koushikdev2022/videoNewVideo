'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
const bcrypt = require('bcrypt');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    
    static associate(models) {
      
    }
  }
  User.init({
    username: DataTypes.STRING,
    password: DataTypes.STRING,
    full_name: DataTypes.STRING,
    first_name: DataTypes.STRING,
    last_name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.INTEGER,
    phone: DataTypes.STRING,
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
  User.addHook(
    "beforeCreate",
    user => (user.password = bcrypt.hashSync(user.password, 10))
  );
  User.addHook('beforeUpdate', async (user) => {
    
          user.password = await bcrypt.hashSync(user.password, 10);
    
  });
  return User;
};
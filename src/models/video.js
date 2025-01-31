'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Video extends Model {
    
    static associate(models) {
        Video.belongsTo(models.User,{
            foreignKey:"user_id",
            as:"User"
        })
        Video.hasMany(models.AttributeVideo,{
            foreignKey:"video_id",
            as:"AttributeVideo"
        })
    }
  }
  Video.init({
    username: DataTypes.STRING,
    user_id: DataTypes.BIGINT,
    video: DataTypes.STRING,
    video_type:DataTypes.STRING,
    thumbnail:DataTypes.STRING,
    converted_video:DataTypes.STRING,
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
    modelName: 'Video',
    tableName: 'videos',
    timestamps: false,
    underscored: true,
  });
  return Video;
};
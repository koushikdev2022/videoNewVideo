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
    }
  }
  Video.init({
    user_id: DataTypes.BIGINT,
    video: DataTypes.STRING,
    video_type:DataTypes.STRING,
    youtube_upload_status:DataTypes.STRING,
    youtube_upload_pid:DataTypes.STRING,
    youtube_upload_started_at:DataTypes.DATE,
    youtube_error:DataTypes.STRING,
    thumbnail:DataTypes.TEXT('long'),
    title:DataTypes.TEXT('long'),
    description:DataTypes.TEXT('long'),
    converted_video:DataTypes.STRING,
    is_feature:{
      type: DataTypes.INTEGER,
      defaultValue: 0,
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
    modelName: 'Video',
    tableName: 'videos',
    timestamps: false,
    underscored: true,
  });
  return Video;
};
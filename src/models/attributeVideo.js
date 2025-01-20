'use strict';
const {
  Model,
  DataTypes, Sequelize
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class attributeVideo extends Model {
    
    static associate(models) {
      
    }
  }
  attributeVideo.init({
    username: DataTypes.STRING,
    video_id: DataTypes.BIGINT,
    attributes: DataTypes.JSON,
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
    modelName: 'attributeVideo',
    tableName: 'attribute_videos',
    timestamps: false,
    underscored: true,
  });
  return attributeVideo;
};
const mongoose = require("mongoose");

const subjectKitSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    unique: true,
  },
  ageGroup: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'AgeGroup'
  },
  description: {
    type: String,
  },
  thumbnail: {
    type: String,
    required: [true, 'Thumbnail is required']
  },
  introVideo: {
    type: String,
    required: [true, 'Kit intro video is required']
  },
  isActive: {
    type: Boolean,
    default: true,
  }
},{timestamps:true});

module.exports = mongoose.model('SubjectKit', subjectKitSchema);

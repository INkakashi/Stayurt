// models/File.js
const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema({
  title: String,
  filename: String,
  contentType: String,
  data: Buffer,
  Story: [{type: mongoose.Schema.Types.ObjectId, ref: "stories"}]
});

module.exports = mongoose.model('chapters', chapterSchema);

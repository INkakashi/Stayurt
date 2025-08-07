// models/File.js
const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  title: String,
  cover: String,
  chapters: [{type: mongoose.Schema.Types.ObjectId, ref: "chapters"}],
  user: [{type: mongoose.Schema.Types.ObjectId, ref: "user"}],
  theme: String
});

module.exports = mongoose.model('stories', storySchema);

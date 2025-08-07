const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/stayurt");

const userSchema = mongoose.Schema({
  username: String,
  name: String,
  email: String,
  password: String,
  profileImage: String,
  stories:[{type: mongoose.Schema.Types.ObjectId, ref: "stories"}],
  recentviews:[]
});

userSchema.plugin(plm)

module.exports = mongoose.model("user", userSchema);
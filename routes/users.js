const mongoose = require("mongoose");
const plm = require("passport-local-mongoose");

mongoose.connect("mongodb+srv://deewakarsharma687:deewakar123@cluster0.5wfxmh1.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");

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
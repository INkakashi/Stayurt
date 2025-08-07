var express = require('express');
var router = express.Router();
const userModel = require('./users');
const passport = require('passport');
const localStrategy = require('passport-local');
const upload = require('./multer')
const PDF = require('./chapters');
const stories = require('./stories');
const fs = require('fs');



passport.use(new localStrategy(userModel.authenticate()))

/* GET home page. */
router.get('/',isLoggedIn,function(req, res, next) {
  res.render('home');
});


router.get('/stories/:id',isLoggedIn, async function (req, res) {
  const Story = req.params.id;
  const storydata = await stories.findOne({ title: Story }).populate("chapters");
  res.render('pdfs', { storydata: storydata });
  });


router.get('/updatestory',isLoggedIn,admin,async (req,res) =>{
  const user = await userModel.findOne({username:req.session.passport.user}).populate("stories")
  res.render('updatestory',{user:user});
})


router.get('/replace',isLoggedIn,admin,async(req,res) =>{
  const user = await userModel.findOne({username:req.session.passport.user}).populate("stories")
  res.render('replace',{user:user});
})


router.get('/rdchap',isLoggedIn,admin,async (req,res)=>{
  console.log(req.session.Story)
  const story = await stories.findOne({tilte:req.session.Story}).populate("chapters")
  res.render('rdchap',{story:story})
})


router.get('/about',isLoggedIn,function(req, res, next) {
  res.render('about');
});

router.get('/contact',isLoggedIn,function(req, res, next) {
  res.render('contact');
});


router.get('/stories',isLoggedIn,async function(req, res, next) {
  const story = await stories.find()
  res.render('stories',{story:story});
});


router.get('/register',function(req,res,next){
  res.render('register');
})


router.get('/login',function(req,res,next){
  res.render('login');
})


router.get('/uploadchapters',isLoggedIn,admin,async function(req,res,next){
   const user = await userModel.findOne({username:req.session.passport.user}).populate("stories")
  res.render('upload',{user:user})
})


router.get('/makestories',isLoggedIn,admin, function(req,res,next){
  res.render('makestories')
})


router.post('/register',function(req, res){
  const userdata = new userModel({
  username: req.body.username,
  email: req.body.email
  })
  userModel.register(userdata, req.body.password)
  .then(function(registereduser){
    passport.authenticate("local")(req, res, function(){
      res.redirect("/");
    })
  })
})


router.post('/login', passport.authenticate("local",{
  successRedirect: "/",
  failureRedirect: "/login"
}),function(req, res){
});



router.get('/logout',isLoggedIn,function(req, res, next){
  req.logout(function(err){
    if (err) { return next(err);}
    res.redirect('/register');
  });
});



router.post("/makestories",isLoggedIn,admin,upload.single('image'), async (req,res)=>{
  const user = await userModel.findOne({username:req.session.passport.user})
  const storydata =  new stories({
    title: req.body.storyTitle,
    theme: req.body.Theme,
    cover: req.file.filename
  })
  await user.stories.push(storydata._id)
  await storydata.user.push(user._id)
  await user.save();
  await storydata.save();
  res.send("story done you can add chapters through /upload")
});


router.post("/upload",isLoggedIn,admin, upload.single('pdf'), async (req, res) => {
  const story= await stories.findOne({title:req.body.story})
  const pdf = await new PDF({
    title: req.body.title,
    data: req.file.buffer,
    contentType: req.file.mimetype,
    filename: req.file.filename
  });
  console.log(req.file.filename)
  await story.chapters.push(pdf._id)
  await pdf.Story.push(story._id)
  await pdf.save();
  await story.save();
  res.send("chapter uploaded and saved.");
});


router.post('/updatestory',isLoggedIn,admin,upload.single('image'), async function(req, res, next){
   const story = await stories.findOneAndUpdate(
  {title: req.body.story},
  {theme:req.body.Theme,title: req.body.storyTitle},
  { new: true}
);
if(req.file){
  fs.unlink(`./public/images/uploads/${story.cover}`, (err) => {
  if (err) {
    console.error('Error deleting file:', err);
    return;
  }
  console.log('File deleted successfully!');
});
  story.cover = req.file.filename;
}
await story.save();
res.redirect('/stories')
});


router.post("/replace",isLoggedIn,admin,(req,res)=>{
  req.session.story = req.body.story;
  res.redirect('/rdchap')
})


router.post("/rdchap",isLoggedIn,admin,async (req,res)=>{
  const d = await PDF.findOne({title: req.body.chap})
  await PDF.findOneAndDelete({ title: req.body.chap })
  .then((deletedDoc) => {
    if (deletedDoc) {
      console.log('Deleted:', deletedDoc);
    } else {
      console.log('No document found to delete.');
    }
  })
  .catch((err) => {
    console.error('Error deleting document:', err);
  });
  fs.unlink(`./public/images/uploads/${d.filename}`, (err) => {
  if (err) {
    console.error('Error deleting file:', err);
    return;
  }
  console.log('File deleted successfully!');
  res.redirect('/stories')
})
})

async function admin(req,res,next){
  const user = await userModel.findOne({username:req.session.passport.user})
  if(user.username=="Stayurt_24",
    user.email=="ayustartta24@gmail.com"
  ) return next();
  res.redirect("/");
}

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()) return next();
  res.redirect("/login");
}

module.exports = router;
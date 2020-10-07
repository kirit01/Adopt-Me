// Express is used to setup routes.
var express = require("express"),
  app = express(),
// Mongoose is used with for NoSQL databases   
  mongoose = require("mongoose"),
// body-parser is used for extracting the data from the the databases.
  bodyParser = require("body-parser"),
// MethodOverride is used for using PUT(EDIT) and DELETE(DESTROY) requests. 
  methodOverride = require('method-override'),
  port = 3000;

// ===========================================
//  Authentication via passport 
// ==========================================
var passport=require(`passport`),
passportLocalMongoose=require(`passport-local-mongoose`),
LocalStrategy= require(`passport-local`),
User=require(`./models/user`);

//================================================================
// using passport dependencies.
// ============================================================
app.use(require(`express-session`)({
  secret:"rio is good boy",
  resave:false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
// ===================================================================

// Applying ejs to the folder so the we don't need to explicitly apply ejs at the end of file
app.set("view engine", "ejs");
// creating mongoose database
mongoose.connect("mongodb://localhost:27017/donatePet", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.use(methodOverride('_method'));
app.use(express.static(`public`));

// In express 4.o we have bodyParser is added hence it can be used using express
app.use(express.urlencoded({ extended: true }));
// To extract jason object
app.use(bodyParser.json());

// Creating mongoose database to solve
// title (Puppy name)
// puppy age
// puppy breed
// owner name
// owner number
// Pet location
// Stats:( donate/ NotDonated)


// mongo database will save all the data inside
var petSchema = new mongoose.Schema({
  pName: String,
  pAge: String,
  pPic: String,
  pBreed: String,
  pOwnerName: String,
  pOwnerNumber: String,
  pLocation: String,
  created: { type: Date, default: Date.now },
});

var Pet = new mongoose.model("Pet", petSchema);

// Pet.create({
//     pName:'Rio',
//     pAge:2,
//     pPic:'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1003&q=80',
//     pBreed:"GermanShepard",
//     pOwnerName:"Rio ki Mom",
//     pOwnerNumber:2333432234,
//     pLocation:"India(Hyderabad)"
//  })

// RESTFUL routes Path "/" redirect is used to send the path to allpets when we are on home screen
app.get("/", (req, res) => {
  res.redirect("/allpets");
});

app.get('/allpets/howto',(req,res)=>{
  res.render("howto")
 
 });

// REST INDEX route (this route shows all the lsi tof dogs)
app.get("/allpets", (req, res) => {

  //pet.find({},(err,pets)) is used to show are the elements in Pet Database
  
  Pet.find({}, (err, pets) => {
  
    // err will show if anything is going wrong
    // {pets:pets} (pets are right side indicates database values, left side relates  to the values  on index page )
  
    err ? console.log(err) : res.render("index", { pets: pets });
  
  });
});

// RESTFUL ROUTE NEW
app.get("/allpets/new", (req, res) => {

  // new.ejs is a form that is used to take data from the user

  res.render("new");
});

// RESTFUL POST ROUTE  CREATE a puppy profile and redirect it to main all /allpets route
app.post("/allpets", (req, res) => {

  // in create you are creating routes that will be added to pets you

  Pet.create(req.body.pet, (err, newPet) => {

    err ? console.log(err) : res.redirect("/allpets");
  });

  //  console.log(req.body);

});



//RESTFUL PATH SHOW  path(allpets/:id)(mongoose Pet.findById())
app.get('/allpets/:id',(req,res)=>{
//console.log(req.params.id);
Pet.findById(req.params.id,(err,foundPuppy)=>{
 err?console.log(err): res.render('show',{pet:foundPuppy})
// console.log(foundPuppy);
})

});

//RESTFUL PATH EDIT (allpets/:id/edit) Dog.findById()
app.get('/allpets/:id/edit',(req,res)=>{

  //req.params.id will get the id from the url
  // editPup will get the value from the editPup

Pet.findById(req.params.id,(err,editPup)=>{
  // all the values of editPup will be sent.

  err? res.redirect('/allpets'): res.render('edit',{pet:editPup});
})
console.log("edit in process")
});

// RESTFUL Route Edit and update
//update has to perform three functions find,edit and update.
// PUT cannot be directly used we need to install methodOverride 
app.put('/allpets/:id',(req,res)=>{
//finding the id and updating it (findByIdAndUpdate takes 2 parameters id and all the data (pet information))
// Pet database is updated by new information (firsts it finds the database later it updates the database)
  Pet.findByIdAndUpdate(req.params.id,req.body.pet,(err,newPet)=>{
//After the database is updated it redirects to the original allpets/id
  err ? console.log(err) : res.redirect('/allpets/'+req.params.id);
  });
});

// DELETE Path (Pet.findByIdAndRemove()) this deletes a from show where particular page is deleted
app.delete('/allpets/:id',(req,res)=>{
  Pet.findByIdAndRemove(req.params.id,(err)=>{
    err? res.redirect("/allpets"):res.redirect('/allpets');
  })
});

// =============================================================
//  Register Route
// =============================================================

app.get(`/register`,(req,res)=>{
res.render('register');
});


app.post(`/register`,(req,res)=>{
User.register(new User({username:req.body.username}),req.body.password,(err,user)=>{
  if(err){
        console.log(err);
        res.redirect(`/register`)
  }
  passport.authenticate(`local`)(req,res,()=>{
    res.redirect(`/allpets`)
  })

})

});


// create login ( logic , middleware)

app.get(`/login`,(req,res)=>{
   res.render(`login`);
})

app.post(`/login`,passport.authenticate(`local`,{
  successRedirect:`/allpets`,
  failureRedirect:`/login`
}),(req,res)=>{

});
// logout

app.get(`/logout`,(req,res)=>{

  req.logout();
  res.redirect(`/allpets`)
});


//Default path if any user gets lost while navigating

app.get("*", (req, res) => {

  res.send("Wrong path, get a Pet bowh...bowh...");

});

// Listening port used to check if server is functioning properly
app.listen(port, (req, res) => {
  console.log("this shit works");
});

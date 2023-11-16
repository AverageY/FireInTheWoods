const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Review = require('./models/review');
const Campground = require('./models/campground');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');
const userRoutes = require('./routes/users');
const session = require('express-session');
const flash = require('connect-flash'); 
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const app = express();

mongoose.connect('mongodb://127.0.0.1:27017/fire-camp')
  .then(() => console.log('Connected to DB!'))
    .catch(err => {
        console.log(`DB Connection Error: ${err.message}`);
    });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {

 console.log('Database connected');
});
app.engine('ejs', ejsMate);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

const sessionConfig = {
  secret: 'thisisasecret',
   resave: false,
   saveUninitialized: true,
   cookie: {
       httpOnly: true,
      // secure: true,
       expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
       maxAge: 1000 * 60 *60 * 24 * 7
   }
}

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req,res,next) => {
  res.locals.currentUser = req.user; // req.user is passport's user and now every template can access this since its in locals
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);


passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser()); // get user into session
passport.deserializeUser(User.deserializeUser()); //get user out of session



app.all('*', (req, res, next) => {
  next(new ExpressError('Page Not Found', 404))
});
app.use((err,req,res,next) => {
  if(!err.message) err.message = ('Oh No, Something Went Wrong!')
  const { statusCode=500} = err;
  res.status(statusCode).render('error', { err });
});
app.listen(3000, () => {

 console.log('Listening on port 3000');
});
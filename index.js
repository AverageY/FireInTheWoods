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
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//function to validate the campground using joi schema
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
      const msg = error.details.map(el => el.message).join(',')
      throw new ExpressError(msg, 400)
  } else {
      next();
  }
}


app.get('/campgrounds', catchAsync(async (req, res) => {

 const campgrounds = await Campground.find({});
 res.render('campgrounds/index', { campgrounds });
}));

  app.get('/campgrounds/new', (req, res) => {
    
   res.render('campgrounds/new');
  });


app.get('/campgrounds/:id', catchAsync(async (req, res) => {
    
     const campground = await Campground.findById(req.params.id).populate('reviews');
     res.render('campgrounds/show', { campground });
}));

app.get('/campgrounds/:id/edit', catchAsync(async (req, res) => {
    
     const campground = await Campground.findById(req.params.id);
     res.render('campgrounds/edit', { campground });
}));

app.post('/campgrounds', validateCampground, catchAsync(async (req, res) => {
    
 const campground = new Campground(req.body.campground);
 await campground.save();
 res.redirect(`/campgrounds/${campground._id}`)
}));

app.post('/campgrounds/:id/reviews',validateReview, catchAsync(async (req, res) => {
    
 const campground = await Campground.findById(req.params.id);
 const review = new Review(req.body.review);

 campground.reviews.push(review);
 
 await review.save();
 await campground.save();
 res.redirect(`/campgrounds/${campground._id}`)
}));

app.put('/campgrounds/:id',validateCampground, catchAsync(async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`)
}));

app.delete('/campgrounds/:id', catchAsync(async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
  await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}));

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
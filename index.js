const express = require('express');
const path = require('path');
const ejsMate = require('ejs-mate');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
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


app.get('/campgrounds', async (req, res) => {

 const campgrounds = await Campground.find({});
 res.render('campgrounds/index', { campgrounds });
});
try{
  app.get('/campgrounds/new', (req, res) => {
    
   res.render('campgrounds/new');
  });
  }catch(e){
      console.log(e);
  }

app.get('/campgrounds/:id', async (req, res) => {
    
     const campground = await Campground.findById(req.params.id);
     res.render('campgrounds/show', { campground });
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    
     const campground = await Campground.findById(req.params.id);
     res.render('campgrounds/edit', { campground });
});

app.post('/campgrounds', async (req, res) => {
    
 const campground = new Campground(req.body.campground);
 await campground.save();
 res.redirect(`/campgrounds/${campground._id}`)
});

app.put('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
  res.redirect(`/campgrounds/${campground._id}`)
});

app.delete('/campgrounds/:id', async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  res.redirect('/campgrounds');
});



app.listen(3000, () => {

 console.log('Listening on port 3000');
});
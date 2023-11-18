const Campground = require('../models/campground');
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding'); // geocoding service
const mapBoxToken = process.env.MAPBOX_TOKEN; // mapbox token
const geocoder = mbxGeocoding({ accessToken: mapBoxToken }); // geocoder object
const {campgroundSchema} = require('../schemas.js');

const index = async (req, res) => {

    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
   }

   const renderNewForm = (req, res) => {
    res.render('campgrounds/new');
}

const createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    const geocode = await geocoder.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send()
    campground.geometry = geocode.body.features[0].geometry;
    
    campground.author = req.user._id;
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }))
    await campground.save();
    req.flash('success', 'Successfully made a new campground!');
    res.redirect(`/campgrounds/${campground._id}`)
}

const showCampground = async (req, res,) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/show', { campground });
}

const renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
    if (!campground) {
        req.flash('error', 'Cannot find that campground!');
        return res.redirect('/campgrounds');
    }
    res.render('campgrounds/edit', { campground });
}

const updateCampground = async (req, res) => {
    const { id } = req.params;
    const { deleteImages, ...campground } = req.body.campground;
    const { error } = campgroundSchema.validate(campground); // Pass campground directly
    if (error) {
        // handle validation error
    }
    const updatedCampground = await Campground.findByIdAndUpdate(id, { ...campground });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }))
    updatedCampground.images.push(...imgs); // allows to spread array into individual elements
    if (deleteImages) {
        for (let filename of deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await updatedCampground.updateOne({ $pull: { images: { filename: { $in: deleteImages } } } }) // $pull removes from array
    }
    req.flash('success', 'Successfully updated campground!');
    res.redirect(`/campgrounds/${updatedCampground._id}`)
}
 
const deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted campground')
    res.redirect('/campgrounds');
}

module.exports = { index, renderNewForm, createCampground, showCampground, renderEditForm, updateCampground, deleteCampground }
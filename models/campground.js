const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');


//virtual property for thumbnail
const ImageSchema = new Schema({
    url: String,
    filename: String
})
ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
}) //to set the thumbnail to width 200

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author:{
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews:[{
        type: Schema.Types.ObjectId,
        ref: 'Review'
    }]
    });
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})
//middleware to ensure all reviews are deleted when a campground is deleted

module.exports = mongoose.model('Campground', campgroundSchema);
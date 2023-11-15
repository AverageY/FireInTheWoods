const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');
const campgroundSchema = new Schema({
    title: String,
    price: Number,
    description: String,
    location: String,
    image: String,
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
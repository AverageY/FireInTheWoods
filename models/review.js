const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    rating:
    {
        type: Number,
       
    },  
    body:
    {
        type: String,
        
    },
})

module.exports = mongoose.model('Review', reviewSchema);
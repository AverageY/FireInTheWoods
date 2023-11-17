const cloudinary = require('cloudinary').v2;
const {CloudinaryStorage} = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // from .env file
    api_key: process.env.CLOUDINARY_KEY, // from .env file
    api_secret: process.env.CLOUDINARY_SECRET // from .env file
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'FireCamp',
        allowedFormats: ['jpeg', 'png', 'jpg']
    }
});

module.exports = {
    cloudinary,
    storage
}
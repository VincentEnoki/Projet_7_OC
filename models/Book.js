const mongoose = require('mongoose');

const ratingSchema = mongoose.Schema({
    userId: { type: String, required: true},
    grade: { type: Number, required: true},
});
const bookSchema = mongoose.Schema({
    title: { type: String, required: true},
    author: { type: String, required: true},
    year: { type: Number, required: true},
    genre : { type: String, required: true},
    ratings: [ratingSchema],
    averageRating: { type: Number, required: true},
    imageUrl: { type: String, required: true},
    userId: { type: String, required: true, unique: true},
});

module.exports = mongoose.model('Book', bookSchema);
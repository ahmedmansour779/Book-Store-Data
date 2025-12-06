const mongoose = require("mongoose")

const ratingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    jobDescription: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        enum: [1, 2, 3, 4, 5],
        default: 5,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    created: {
        type: String
    }
});

module.exports = mongoose.model('rating', ratingSchema);
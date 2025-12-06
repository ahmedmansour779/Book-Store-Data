const mongoose = require("mongoose");
const { designProgramming, marketing, print } = require("../utils/portfolio.category");

const PortfolioSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: [designProgramming, marketing, print]
    },
    created: {
        type: String
    }
});

module.exports = mongoose.model('Portfolio', PortfolioSchema);
const mongoose = require("mongoose")

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        type: String,
        // required: true
    },
    date: {
        type: String,
    },
    category: {
        type: String,
        required: true
    },
    items: [{
        type: {
            title: String,
            items: [String]
        },
        required: true
    }],
    author: {
        type: String,
    },
    editedBy: {
        type: String,
    },
});

module.exports = mongoose.model('Blog', blogSchema);
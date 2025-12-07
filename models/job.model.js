const mongoose = require("mongoose")

const jobSchema = new mongoose.Schema({
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
        required: true
    },
    created: {
        type: String,
    },
    updated: {
        type: String,
    },
    employmentType: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    author: {
        type: String,
    }
});

module.exports = mongoose.model('Job', jobSchema);
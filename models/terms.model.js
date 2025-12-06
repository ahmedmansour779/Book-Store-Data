const mongoose = require("mongoose")

const termsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    items: [{
        type: [String],
        required: true
    }],
    created: {
        created: {
            type: String
        }
    }
});

module.exports = mongoose.model('Term', termsSchema);
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const multer = require("multer");

const routesBlogs = require('./routes/blog.routes');
const routesUsers = require('./routes/auth.routes');
const routesTerms = require('./routes/term.routes');
const routesTestimonials = require('./routes/testimonials.routes');
const routesPortfolio = require('./routes/portfolio.routes');
const routesContact = require('./routes/contact.routes');
const routesJobs = require('./routes/jobs.routes');

const httpStatusText = require("./utils/http.status.text")

const app = express();
const url = process.env.MONGO_URL;

// -------------------- MongoDB --------------------
mongoose.connect(url, {
    serverSelectionTimeoutMS: 30000
})
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.error(err));

// -------------------- Middlewares --------------------

// أي port يسمح بالـ requests
app.use(cors());

// لقبول form data
app.use(express.urlencoded({ extended: true }));

// لقبول json
app.use(express.json());

// -------------------- Routes --------------------
app.use("/api/blogs", routesBlogs);
app.use("/api/auth", routesUsers);
app.use("/api/terms", routesTerms);
app.use("/api/testimonials", routesTestimonials);
app.use("/api/portfolio", routesPortfolio);
app.use("/api/contact", routesContact);
app.use("/api/jobs", routesJobs);

// -------------------- 404 Not Found --------------------
app.use((req, res) => {
    res.status(404).json({
        status: httpStatusText.ERROR,
        message: "Route not found"
    });
});

// -------------------- Error Handler --------------------
app.use((err, req, res, next) => {
    // التعامل مع MulterError لما حد يرفع أكتر من ملف
    if (err instanceof multer.MulterError && err.code === "LIMIT_UNEXPECTED_FILE") {
        return res.status(400).json({
            status: "fail",
            message: "Only one file is allowed"
        });
    }

    res.status(err.statusCode || 500).json({
        status: httpStatusText.ERROR,
        message: err.message || "Internal Server Error"
    });
});

// -------------------- Run Server --------------------
app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});
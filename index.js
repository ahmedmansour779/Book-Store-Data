require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require("multer");

const routesCourses = require('./routes/courser.routes');
const routesUsers = require('./routes/users.routes');
const httpStatusText = require("./utils/httpStatusText");

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

// لعرض الصور المحلية
app.use("/uploads", express.static(path.join(__dirname, 'uploads')));

// -------------------- Routes --------------------
app.use("/api/courses", routesCourses);
app.use("/api/users", routesUsers);

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

    console.error(err);

    res.status(err.statusCode || 500).json({
        status: httpStatusText.ERROR,
        message: err.message || "Internal Server Error"
    });
});

// -------------------- Run Server --------------------
app.listen(process.env.PORT, () => {
    console.log(`Server running at http://localhost:${process.env.PORT}`);
});

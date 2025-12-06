let express = require('express')
const multer = require("multer");
const validateImage = require('../middlewares/validate.Image');
const verifyToken = require('../middlewares/verify.token');
const { addOneTestimonials, getAllTestimonials, getOneTestimonial, updateTestimonial, deleteOneTestimonial } = require('../controllers/testimonials.controller');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router()

router.route("/")
    .post(verifyToken, upload.single("image"), validateImage, addOneTestimonials)
    .get(getAllTestimonials)

router.route("/:id")
    .get(getOneTestimonial)
    .patch(verifyToken, upload.single("image"), validateImage, updateTestimonial)
    .delete(verifyToken, deleteOneTestimonial)


module.exports = router
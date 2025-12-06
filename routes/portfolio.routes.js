let express = require('express')
const multer = require("multer");
const verifyToken = require('../middlewares/verify.token');
const { addOnePortfolio, getAllPortfolio, getOnePortfolio, updatePortfolio, deleteOnePortfolio } = require('../controllers/portfolio.controller');
const validateImage = require('../middlewares/validate.Image');

const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

const router = express.Router()

router.route("/")
    .post(verifyToken, upload.single("image"), validateImage, addOnePortfolio)
    .get(getAllPortfolio)

router.route("/:id")
    .get(getOnePortfolio)
    .patch(verifyToken, upload.single("image"), validateImage, updatePortfolio)
    .delete(verifyToken, deleteOnePortfolio)


module.exports = router
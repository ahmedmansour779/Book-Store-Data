const express = require('express');
const verifyToken = require('../middlewares/virfay.token');
const { getAllUsers, register, login, setAdmin, deleteUser, updateUser } = require('../controllers/users.controller');
const verifySuperAdmin = require('../middlewares/verify.super.admin');
const multer = require("multer");
const validateImage = require('../middlewares/validate.Image');

const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.route("/")
    .get(verifyToken, verifySuperAdmin, getAllUsers);

router.route("/register")
    .post(upload.single("avatar"), validateImage, register);

router.route("/login")
    .post(upload.none(), login);

router.use("/:id", verifyToken);

router.route("/:id")
    .post(verifySuperAdmin, setAdmin)
    .delete(verifySuperAdmin, deleteUser)
    .patch(upload.single("avatar"), validateImage, updateUser);

module.exports = router;

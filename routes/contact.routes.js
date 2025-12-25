let express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verify.token');
const {
  addOneContact,
  getAllContact,
  getOneContact,
  deleteOneContact,
} = require('../controllers/contact.controller');

const upload = multer();

const router = express.Router();

router.route('/').post(upload.none(), addOneContact).get(verifyToken, getAllContact);

router.route('/:id').get(verifyToken, getOneContact).delete(verifyToken, deleteOneContact);

module.exports = router;

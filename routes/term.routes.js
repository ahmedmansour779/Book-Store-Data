let express = require('express');
const multer = require('multer');
const verifyToken = require('../middlewares/verify.token');
const {
  addOneTerm,
  getAllTerms,
  getOneTerm,
  updateTerm,
  deleteOneTerm,
} = require('../controllers/term.controller');

const upload = multer();

const router = express.Router();

router.route('/').post(upload.none(), verifyToken, addOneTerm).get(getAllTerms);

router
  .route('/:id')
  .get(getOneTerm)
  .patch(upload.none(), verifyToken, updateTerm)
  .delete(verifyToken, deleteOneTerm);

module.exports = router;

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const multer = require('../middleware/multer-config');

const stuffCtrl = require('../controllers/stuff');

router.get('/', stuffCtrl.getAllBooks);
router.post('/', auth, multer, stuffCtrl.createBook);
router.get('/:id', stuffCtrl.getOneBook);
router.put('/:id', auth, multer, stuffCtrl.modifyBook);
router.post('/:id/rating', auth, stuffCtrl.rateBook);
router.delete('/:id', auth, stuffCtrl.deleteBook);
router.get('/bestrating', stuffCtrl.getThreeBestBooks);

module.exports = router;
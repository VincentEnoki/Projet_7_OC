const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const multer = require("../middleware/multer-config");

const bookCtrl = require("../controllers/book");

router.get("/", bookCtrl.getAllBooks);
router.get("/bestrating", multer, bookCtrl.getThreeBestBooks);
router.post("/", auth, multer, bookCtrl.createBook);
router.get("/:id", bookCtrl.getOneBook);
router.put("/:id", auth, multer, bookCtrl.modifyBook);
router.post("/:id/rating", auth, multer, bookCtrl.rateBook);
router.delete("/:id", auth, bookCtrl.deleteBook);

module.exports = router;

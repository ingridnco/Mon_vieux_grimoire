const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const { upload, convertImageToWebp } = require("../middleware/multer-config")

const booksCtrl = require("../controllers/books")

router.post("/", auth, upload, convertImageToWebp, booksCtrl.createBook)
router.put("/:id", auth, upload, convertImageToWebp, booksCtrl.modifyBook)
router.delete("/:id", auth, booksCtrl.deleteBook)
router.get("/bestrating", booksCtrl.getBestRating)
router.get("/:id", booksCtrl.getOneBook)
router.get("/", booksCtrl.getAllBooks)
router.post("/:id/rating", auth, booksCtrl.rateBook)

module.exports = router

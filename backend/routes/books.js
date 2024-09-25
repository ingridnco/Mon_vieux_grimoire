const express = require("express")
const router = express.Router()

const auth = require("../middleware/auth")
const booksCtrl = require("../controllers/books")

router.post("/", booksCtrl.createBook)
router.put("/:id", auth, booksCtrl.modifyBook)
router.delete("/:id", auth, booksCtrl.deleteBook)
router.get("/:id", booksCtrl.getOneBook)
router.get("/", booksCtrl.getAllBooks)
// router.get("/bestrating", booksCtrl.getBestRatings)

module.exports = router

const multer = require("multer")
const path = require("path")
const sharp = require("sharp")
const fs = require("fs")

const MIME_TYPES = {
  "image/jpg": "jpg",
  "image/jpeg": "jpg",
  "image/png": "png",
}

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, "images")
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(" ").join("_")
    const extension = MIME_TYPES[file.mimetype]
    callback(null, name + Date.now() + "." + extension)
  },
})

const upload = multer({ storage }).single("image")

// Optimisation des images
const convertImageToWebp = async (req, res, next) => {
  if (!req.file) return next()

  const originalImgPath = req.file.path
  const webpImageName = `optimized_${path.basename(req.file.filename, path.extname(req.file.filename))}.webp`
  const webpImagePath = path.join("images", webpImageName)

  try {
    sharp.cache(false)
    await sharp(originalImgPath).webp({ quality: 80 }).resize(400).toFile(webpImagePath)

    req.file.filename = webpImageName

    // Suppr image initiale
    fs.unlink(originalImgPath, error => {
      if (error) {
        console.error("Impossible de supprimer l'image originale :", error)
        return next(error)
      }
      next()
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { upload, convertImageToWebp }

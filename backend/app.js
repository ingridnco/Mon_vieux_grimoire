require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const booksRoutes = require("./routes/books")
const userRoutes = require("./routes/user")
const path = require("path")
const app = express()

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Connexion à MongoDB réussie !"))
  .catch(() => console.log("Connexion à MongoDB échouée !"))

//middleware CORS
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*")
  res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization")
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS")
  next()
})

//middlewares gestion des JSON et fichiers images
app.use(express.json())
app.use("/images", express.static(path.join(__dirname, "images")))

app.use("/api/books", booksRoutes)
app.use("/api/auth", userRoutes)

module.exports = app

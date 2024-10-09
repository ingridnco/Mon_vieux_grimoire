const Book = require("../models/Book")
const fs = require("fs")

// Calcul de la note moyenne
const averageNote = ratings => {
  let total = 0
  for (const rating of ratings) {
    total += rating.grade
  }
  return (total / ratings.length).toFixed(1) // Arrondit à la décimale
}

// Création livre
exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book)
  delete bookObject._id // Supprime l'ID (MongoDB gère)
  delete bookObject._userId // Supprime le userId pour éviter toute modification non autorisée

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId, // Ajoute l'userId associée au livre
    imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Créa URL de image
    averageRating: bookObject.ratings[0].grade, // note moyenne
  })

  book
    .save()
    .then(() => res.status(201).json({ message: "Livre enregistré !" }))
    .catch(error => res.status(400).json({ error }))
}

// Modif livre
exports.modifyBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`, // Mise à jour image si besoin
      }
    : { ...req.body }

  delete bookObject._userId // Empêche modif du userId

  // Recherche livre (ID)
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" }) // si utilisateur !== créateur du livre
      }

      // Suppr ancienne image si nouvelle téléchargée
      if (req.file) {
        const oldImage = book.imageUrl.split("/images/")[1]
        fs.unlink(`images/${oldImage}`, error => {
          if (error) {
            return res.status(500).json({ error })
          }

          Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
            .then(() => res.status(200).json({ message: "Livre modifié !" }))
            .catch(error => res.status(400).json({ error }))
        })
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre modifié !" }))
          .catch(error => res.status(400).json({ error }))
      }
    })
    .catch(error => res.status(404).json({ error }))
}

// Suppr livre
exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId !== req.auth.userId) {
        return res.status(401).json({ message: "Non autorisé" })
      }

      const filename = book.imageUrl.split("/images/")[1] // créa nom de fichier image
      fs.unlink(`images/${filename}`, () => {
        Book.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: "Livre supprimé !" }))
          .catch(error => res.status(400).json({ error }))
      })
    })
    .catch(error => res.status(500).json({ error }))
}

// affichage d'un livre
exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => res.status(200).json(book)) // Retourne le livre cliqué
    .catch(error => res.status(404).json({ error }))
}

// affichage de tous les livres
exports.getAllBooks = (req, res, next) => {
  Book.find() // Recherche de tous les livres
    .then(books => res.status(200).json(books)) // Retourne tous les livres
    .catch(error => res.status(400).json({ error }))
}

// Notation livre
exports.rateBook = (req, res, next) => {
  const { rating, userId } = req.body

  // Vérifie si note comprise entre 0 et 5
  if (rating >= 0 && rating <= 5) {
    Book.findOne({ _id: req.params.id })
      .then(book => {
        if (!book) {
          return res.status(404).json({ message: "Livre non trouvé !" })
        }

        // Vérifie si livre déjà noté par cet utilisateur
        const hasAlreadyRated = book.ratings.some(rating => rating.userId.toString() === userId)
        if (hasAlreadyRated) {
          return res.status(400).json({ message: "Vous avez déjà noté ce livre." })
        }

        // Ajout nouvelle note et mise à jour de la moyenne
        book.ratings.push({ userId, grade: rating })
        book.averageRating = averageNote(book.ratings)

        book
          .save()
          .then(() => res.status(200).json(book))
          .catch(error => res.status(400).json({ error }))
      })
      .catch(error => res.status(400).json({ error }))
  } else {
    return res.status(400).json({ message: "La note doit être comprise entre 0 et 5." })
  }
}

// Obtenir livres les mieux notés
exports.getBestRating = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 }) // Tri note moyenne décroissante
    .limit(3) // 3 meilleurs livres uniquement
    .then(books => res.status(200).json(books))
    .catch(error => res.status(400).json({ error }))
}

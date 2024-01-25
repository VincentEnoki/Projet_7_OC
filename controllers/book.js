const Book = require("../models/Book");
const fs = require("fs");
const sharp = require("sharp");

exports.createBook = async (req, res) => {
  try {
    const bookObject = JSON.parse(req.body.book);
    delete bookObject._id;
    delete bookObject._userId;

    const imagePath = `images/${req.file.filename}`;
    const compressedImagePath = `images/compressed_${req.file.filename}`;

    // Utilise Sharp pour comprimer l'image
    await sharp(imagePath)
      .jpeg({ quality: 80 }) // ajustez la qualité selon vos besoins
      .toFile(compressedImagePath);

    const book = new Book({
      ...bookObject,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get("host")}/${compressedImagePath}`,
    });

    await book.save();
    res.status(201).json({ message: "Image enregistrée!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.getOneBook = (req, res) => {
  Book.findOne({
    _id: req.params.id,
  })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => {
      res.status(404).json({
        error: error,
      });
    });
};

exports.modifyBook = async (req, res) => {
  try {
    const bookObject = req.file
      ? {
          ...JSON.parse(req.body.book),
          imageUrl: `${req.protocol}://${req.get("host")}/images/compressed_${
            req.file.filename
          }`,
        }
      : { ...req.body };
    delete bookObject._userId;

    const imagePath = `images/${req.file.filename}`;
    const compressedImagePath = `images/compressed_${req.file.filename}`;
    await sharp(imagePath)
      .jpeg({ quality: 80 })
      .toFile(compressedImagePath);

    const book = await Book.findOne({ _id: req.params.id });

    if (!book) {
      return res.status(404).json({ message: "Livre non trouvé" });
    }

    if (book.userId !== req.auth.userId) {
      return res.status(401).json({ message: "Requête non autorisée" });
    }

    await Book.updateOne(
      { _id: req.params.id },
      { ...bookObject, _id: req.params.id }
    );

    res.status(201).json({ message: "Livre mis à jour avec succès!" });
  } catch (error) {
    res.status(400).json({ error });
  }
};

exports.rateBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const { rating } = req.body;
      const { userId } = req.body;
      const oldRating = book.ratings.find((grade) => grade.userId === userId);
      if (oldRating) return;
      book.ratings.push({ userId, grade: rating });
      const averageRating = book.ratings.reduce((accumulator, newGrade) => accumulator + newGrade.grade, 0) / book.ratings.length; // recursive function new grade + accumulator / length
      const roundedAverageRating = Math.round(averageRating);
      book.averageRating = roundedAverageRating;
      book.save()
        .then(() => { res.status(201).json(book); })
        .catch((error) => { res.status(400).json({ error }); });
    })
    .catch((error) => {
      res.status(400).json({ error });
    });
};

exports.deleteBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Not authorized" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "images supprimé !" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => {
      res.status(500).json({ error });
    });
};

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

exports.getThreeBestBooks = (req, res) => {
  Book.find({ averageRating: { $exists: true } })
    .sort({ averageRating: -1 })
    .limit(3)
    .then((books) => {
      res.status(200).json(books);
    })
    .catch((error) => {
      res.status(400).json({
        error: error,
      });
    });
};

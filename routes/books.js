const express = require("express");
const router = express.Router();
const multer = require('multer')
const path = require('path')
const fs = require('fs') //FileSystem (for deleting files)
const Author = require("../models/author");
const Book = require("../models/book");
const uploadPath = path.join('public', Book.coverImageBasePath)
const imageMimeTypes = ['image/jpeg','image/png','image/gif']
const upload = multer({
  dest: uploadPath,
  fileFilter: (req, file, callback) => {
    callback(null, imageMimeTypes.includes(file.mimetype))
  }
})

//All Books Route
router.get("/", async (req, res) => {
  let query = Book.find()

  if(req.query.title != null && req.query.title != ''){
    //Buscar via GET
    query = query.regex('title', new RegExp(req.query.title, 'i'))
  }

  if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
    //Buscar via GET
    query = query.lte('publishDate', req.query.publishedBefore)
  }

  if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
    //Buscar via GET
    console.log("PUBLISHED AFTER")
    query = query.gte('publishDate', req.query.publishedAfter)
  }

  console.log("BEFORE: ", req.query.publishedBefore)
  console.log("AFTER: ", req.query.publishedAfter)
  



  try {
    
    //const books = await Book.find({})
    const books = await query.exec()
    console.log(books)
    

    res.render('books/index', {
      books: books,
      searchOptions: req.query
    })
  }catch {

    res.redirect('/')
    
  }
});

//New Book Route
router.get("/new", async (req, res) => {
  
  renderNewPage(res, new Book())

});

//Create Book Route
router.post("/", upload.single('cover'), async (req, res) => {
  
  console.log("REQ FILE",req.file);
  const fileName = req.file != null ? req.file.filename : null

  const book = new Book({
    title: req.body.title,
    author: req.body.author,
    publishDate: new Date(req.body.publishDate),
    pageCount: req.body.pageCount,
    coverImageName: fileName,
    description: req.body.description
  })

  try {
    
    const newBook = await book.save()
    //res.redirect(`books/${newBook.id}`)
    res.redirect('books')

  }catch (err) {
      if(book.coverImageName != null){
        removeBookCover(book.coverImageName)
      }
      renderNewPage(res, book, true)
  }
});

function removeBookCover(fileName){
  fs.unlink(path.join(uploadPath, fileName), err => {
    if(err) console.log(err)
  })
}

async function renderNewPage(res, book, hasError = false) {
  try {
    const authors = await Author.find({});
    const params = {
      authors: authors, 
      book: book
    }
    if(hasError) params.errorMessage = "Error creating book"

    res.render('books/new', params)

  
  }catch {
    renderNewPage(res, book, true)
  }
}


module.exports = router;

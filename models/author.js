const mongoose = require('mongoose')
const Book = require('./book')

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    }
})

authorSchema.pre('remove', function(next){
    Book.find({ author: this.id}, (err, books) => {

        if(err) {
            next(err)
        }else if( books.length > 0) {
            //DONT ALLOW REMOVE AUTHOR IF THERES a BOOK ASSOCIATING TO THIS AUTHOR
            next(new Error('There are books with this author still '))
        }else {
            next() //Proceed, all fine!
        }

    })
})

module.exports = mongoose.model('Author', authorSchema)

import express from "express";
import collection from '../server.js'
import { calculateRead } from "../utils/calculateBooks.js";
import { uid } from 'uid';
const app = express();


// Get All books by date
app.get('/books', async (req, res) => {

  const { date } = req.query
    
  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { books, booksToRead } = user
  
  const booksWithDate = books.filter(book => {
    const booksDate = new Date(book.date)
    booksDate.setHours(0,0,0,0)
    
    const dateFiltered = new Date(date)
    dateFiltered.setHours(0,0,0,0)
   return booksDate.getTime() === dateFiltered.getTime()
  })
    
  const buildCorrectResponse = booksToRead.map(book => {
    const bookFounded = booksWithDate.find(booksWithDate => booksWithDate.id === book.id)
  
    if(bookFounded) {
      return bookFounded
    }
    
    return book
  })
  
  
  res.json({ books: buildCorrectResponse })
})

app.post('/new-book', async (req, res) => {
 
 const { title, total, date } = req.body
 
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const newBook = { title, total, current: 0, date: new Date(date) }
  
  const copyOfUser = {...usuario, books: [...usuario.books]}
  copyOfUser.books.push(newBook)
  
  const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, copyOfUser)
      
  // Ver aqui que carajo hacer, que mando, vuelvo a pedir libros por fecha o reinicio al dia actual?
  res.json(result)
})


app.post('/add-books-updated', async (req, res) => {
  
  const { booksUpdated } = req.body
  // Viene solo los libros modificados con la fecha que hayamos seteado porque al pedirlos tampoco estamos pidiendolos por fecha
  
  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { books } = user
  
  
  const booksUpdatedRecords = [...books, ...booksUpdated]
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, books: booksUpdatedRecords })
  
  res.json({});
});

app.get('/books-records', async (req, res) => {

  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfBooks = [...user.books]
  
  const { books, booksToRead } = user
  
  const buildCorrectResponse = booksToRead.map(book => {
  
    const booksById = books.filter(recordBook => recordBook.id === book.id)

    if(booksById.length > 0) {
      const bestRecordBook = booksById.sort((bookA, bookB) => bookB.current - bookA.current)[0]
      
      return bestRecordBook
    }
   
    return book
  })
  
  
  res.json({ books: buildCorrectResponse, average: calculateRead(copyOfBooks, booksToRead) })


})


export default app


import express from "express";
import collection from '../server.js'
import { formatDate } from "../utils.js";
import { calculateRead } from "../utils/calculateBooks.js";
import { uid } from 'uid';
const app = express();

// Get All books by date
app.get('/books', async (req, res) => {

  const { date } = req.query
    
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfBooks = [...usuario.books]
    
  const titles = [...new Set(copyOfBooks.map(book => book.title))]
  
  const updatedBooks = titles.map(title => {
  
  const filteredByName = copyOfBooks.filter(book => book.title === title)
  
  const sortByLowest = filteredByName.sort((bookA, bookB) =>   parseFloat(bookB.current) - parseFloat(bookA.current))[0]
  
  
  return {
    ...sortByLowest,
    total: parseFloat(sortByLowest.total)
  }
  
  })
  
  const finalResponse = {
    average: calculateRead(copyOfBooks),
    books: updatedBooks
  } 
  

  res.json(finalResponse)
})


app.post('/summary-books', async (req, res) => {

  const { month } = req.body
      
  const usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfBooks = [...usuario.books]
  
  const filterByMonth = copyOfBooks.filter((book) => {
    const fixDateCauseIsANumber = book.date.split('-')[1] - 1
  return fixDateCauseIsANumber === month
  } )
  
  const listOfBookNames = [...new Set(filterByMonth.map(book => book.title))]
  
  
  const orderedBooks = listOfBookNames.map(bookName => {
  
  const filteredByName = filterByMonth.filter(book => book.title === bookName)
  
  const sortByLowest = filteredByName.sort((bookA, bookB) =>  parseFloat(bookA.current) - parseFloat(bookB.current))
  
  // const lowestRegister =  parseInt(sortByLowest[0].current)
  
  const highestRegister = parseInt(sortByLowest[sortByLowest.length - 1].current)
  
  // const pagesReadByMonth = highestRegister - lowestRegister
  

  
  return {
    title: bookName,
    total: filteredByName[0].total,
    percentaje: highestRegister * 100 / filteredByName[0].total,
    registers: filteredByName,
    // lowestRegister,
    highestRegister,
    // pagesReadByMonth
  }
  
  })
  

  
  let percentaje = orderedBooks.map(book => book.percentaje).reduce((acc, percentaje) => acc + parseFloat(percentaje), 0) / orderedBooks.length

  res.json({ books: orderedBooks, percentajeTotal: percentaje })


})

app.post('/new-book', async (req, res) => {
 
 const { title, total, date } = req.body
 
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const newBook = { title, total, current: 0, date: formatDate(date) }
  
  const copyOfUser = {...usuario, books: [...usuario.books]}
  copyOfUser.books.push(newBook)
  
  const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, copyOfUser)
      
  // Ver aqui que carajo hacer, que mando, vuelvo a pedir libros por fecha o reinicio al dia actual?
  res.json(result)
})


app.post('/all-books', async (req, res) => {
  
  const { allBooks } = req.body
  
   
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfUser = {...usuario}
  
    
  const updateBooksFormated = allBooks.map(book => {
    return {...book, date: formatDate(book.date)}
  })
  
  
  let currentBooks = [...copyOfUser.books]
  
  currentBooks = currentBooks.map(currentBook => {
  
  const findBookWithSameDate = updateBooksFormated.find(newBook => {
    const { title, date } = newBook
    return currentBook.title === title && currentBook.date === date
  })
  
  if(findBookWithSameDate) {
    return findBookWithSameDate
  }
  
  return currentBook
  
  })
  
  
  updateBooksFormated.forEach(newBook => {
  
  const { title, date } = newBook
  

  const bookWithDifferentDate = currentBooks.find(currentBook => {
    return currentBook.title === title && currentBook.date === date
  })
  if (!bookWithDifferentDate) {
    currentBooks.push(newBook);
  }
  })
  
  const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...copyOfUser, books: currentBooks })
  
  res.json({});
});


app.get('/fix-books', async (req, res) => {
 
  
   let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
   
   const { books } = usuario
   
   const copyOfUser = {...usuario}
   
   
   
   
  //const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...copyOfUser, books: fixBooks })
  
   res.json({ books })
 })


export default app

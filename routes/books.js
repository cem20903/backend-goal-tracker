
import express from "express";
import collection from '../server.js'
import { formatDate } from "../utils.js";
const app = express();
// Get All books by date
app.get('/books', async (req, res) => {

  console.log('Get Books')

  const { date } = req.query
    
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfBooks = [...usuario.books]

  const booksFiltered = usuario.books.filter(book => book.date === formatDate(date))
  
  // const response = []
  
  //  copyOfBooks.forEach(book => {
  //   if(book.date === formatDate(date)) {
  //     response.push(book)
  //   }
  // })
  
  const response = copyOfBooks.filter(book => book.date === formatDate(date))
  
  const getBooksTodayFirstTime = formatDate(date) === formatDate(new Date()) && response.length === 0
  
  
  if(getBooksTodayFirstTime) {
    res.json(usuario.booksUpdated)
    return
  }

  if(usuario.booksUpdated.length > booksFiltered.length) {
    
    const buildBooks = usuario.booksUpdated.map(book => {
      const findBook = booksFiltered.find(currentBook => currentBook.title === book.title)
      
      if(findBook) {
        return findBook
      }
      return book
    })
    
    res.json(buildBooks)
    return
  }
    

  console.log('Books sended:', booksFiltered)
  res.json(booksFiltered)
})


app.post('/summary-books', async (req, res) => {

  const { month } = req.body
      
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfBooks = [...usuario.books]
  
  const filterByMonth = copyOfBooks.filter((book) => {
    const fixDateCauseIsANumber = book.date.split('-')[1] - 1
  return fixDateCauseIsANumber === month
  } )
  
  const listOfBookNames = [...new Set(filterByMonth.map(book => book.title))]
  
  
  const orderedBooks = listOfBookNames.map(bookName => {
  
  const filteredByName = filterByMonth.filter(book => book.title === bookName)
  
  const sortByLowest = filteredByName.sort((bookA, bookB) =>  parseInt(bookA.current) - parseInt(bookB.current))
  
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
  
  // const totalPages = orderedBooks.reduce((acc, book) => {
  //   return book.pagesReadByMonth + acc
  // }, 0)
  
  // filterByMonth
  
  // Read by Day
  
  
  let percentaje = orderedBooks.map(book => book.percentaje).reduce((acc, percentaje) => acc + parseInt(percentaje), 0) / orderedBooks.length

  console.log(orderedBooks.map(book => book.percentaje), 'ESTO')
  
  console.log(percentaje, 'POCENTAJE')

  // const booksFiltered = usuario.books.filter(book => book.date === formatDate(date))
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
  

    
  // Recupero de la BBDD

  
  
  // Devuelvo el objeto actualizado
  res.json({});
});


export default app

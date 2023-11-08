import express from "express";
import cors from 'cors';
import dotenv from "dotenv";

import bodyParser from 'body-parser'
import connectDB from "./services/connectDB.js";
import { formatDate } from "./utils.js";

dotenv.config()
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())


const collection = await connectDB()

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
  
  const copyOfUser = {...usuario, books: [...usuario.books], booksUpdaded: [...usuario.booksUpdated, newBook]}
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


app.post('/set-records', async (req, res) => {


  console.log('Seteo Records Ingles')
  let { currentRecords } = req.body

  currentRecords = currentRecords.map(currentRecord => {
    return {
      ...currentRecord,
      date: formatDate(currentRecord.date)
    }
  
  })
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  
  let currentEnglishRecords = [...usuario.englishRecords]
  
  let existNewRecord = false
  
  const searchAndReplace = currentEnglishRecords.map(current => {
  
    const newRecordFounded = currentRecords.find(newRecord => current.title === newRecord.title && current.date === newRecord.date)
    
    if(newRecordFounded) {
      existNewRecord = true
      return newRecordFounded
    }
    
    return current
  })

  if(!existNewRecord) {
    currentRecords.forEach(newRecord => {
      searchAndReplace.push(newRecord)
    })
  }
  
  

  console.log('Datos actuales', currentRecords, 'CON ESTO')
  
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...usuario, englishRecords: searchAndReplace })

  console.log('Se mando el resultado')
  
  res.json({})

})



app.get('/english-records', async(req, res) => {

  const { date } = req.query
  
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  
  
  let currentEnglishRecords = [...usuario.englishRecords]
  
  
  const recordsFilterByDate = currentEnglishRecords.filter(record => {
    if(record === null) {
      return false
    }
    
    return record.date === formatDate(date)
  })
  
  console.log(recordsFilterByDate.length, 'ESTO', currentEnglishRecords.length)
  
  if(recordsFilterByDate.length === 0) {
    res.json([{
      title: 'Estudiar',
      record: 0,
      date
    }, {
      title: 'Escuchar',
      record: 0,
      date
    },{
      title: 'Leer',
      record: 0,
      date
    },{
      title: 'Escribir',
      record: 0,
      date
    },{
      title: 'Clases',
      record: 0,
      date
    }])
    return
  }
  
  return res.json(recordsFilterByDate)
})

app.post('/english-summary-records', async (req, res) => {

  const { month } = req.body
  
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { englishRecords } = usuario
  
  const filterByMonth = englishRecords.filter((record) => {
    const fixDateCauseIsANumber = record.date.split('-')[1] - 1
    return fixDateCauseIsANumber === month
  } )
  
  const allTitles = [...new Set(filterByMonth.map(record => record.title))]
  
  
  const summary = allTitles.map(title => {
    
    const onlyTitle = filterByMonth.filter(record => record.title === title)
  
    return {
      title,
      total: onlyTitle.reduce((acc, record) => record.record + acc, 0 )
    }
  
  })
  
  res.json(summary)
  

})


// Start the server on port configured in .env (recommend port 8000)
app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
});

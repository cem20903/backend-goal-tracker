
import express from "express";
import collection from '../server.js'
import { calculateRead } from "../utils/calculateBooks.js";
import { uid } from 'uid';
const app = express();


// Get All books by date
// app.get('/books', async (req, res) => {

//   const { date } = req.query
    
//   let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
//   const { books, booksToRead } = user
  
//   const booksWithDate = books.filter(book => {
//     const booksDate = new Date(book.date)
//     booksDate.setHours(0,0,0,0)
    
//     const dateFiltered = new Date(date)
//     dateFiltered.setHours(0,0,0,0)
//    return booksDate.getTime() === dateFiltered.getTime()
//   })
    
//   const buildCorrectResponse = booksToRead.map(book => {
//     const bookFounded = booksWithDate.find(booksWithDate => booksWithDate.id === book.id)
  
//     if(bookFounded) {
//       return bookFounded
//     }
    
//     return book
//   })
  
  
//   res.json({ books: buildCorrectResponse })
// })

// app.post('/new-book', async (req, res) => {
 
//  const { title, total, date } = req.body
 
//   let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
//   const { booksToRead } = user
  
//   const newBook = { title, total: parseFloat(total), current: 0, date: new Date(date), id: uid() }
  
//   const copyBooksToRead = [...booksToRead]
  
//   copyBooksToRead.push(newBook)
  
//   await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, booksToRead: copyBooksToRead })
  
//   res.json(newBook)
// })


// app.post('/add-books-updated', async (req, res) => {
  
//   const { booksUpdated } = req.body
  
//   let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
//   const { books } = user
  
//   const booksUpdatedRecords = [...books, ...booksUpdated]
  
//   await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, books: booksUpdatedRecords })
  
//   res.json({});
// });

app.get('/hs-books-records', async (req, res) => {

  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
    
  const { HSBooks } = user
  
  // const buildCorrectResponse = booksToRead.map(book => {
  
  //   const booksById = books.filter(recordBook => recordBook.id === book.id)

  //   if(booksById.length > 0) {
  //     const bestRecordBook = booksById.sort((bookA, bookB) => bookB.current - bookA.current)[0]
      
  //     return bestRecordBook
  //   }
   
  //   return book
  // })
  
  const totalPages = HSBooks.map(book => book.total).reduce((acc, pages) => acc + pages,0)
  
  const totalCurrent = HSBooks.map(book => book.current).reduce((acc, pages) => acc + pages,0)
  
  console.log(totalPages, 'TOTAL PAGINAS', totalCurrent)
  
  const average = Math.round((totalCurrent * 100 / totalPages) * 100) / 100
  
  res.json({ books: HSBooks, average })
})


const recordOnFutureBackend = [{
  id: 'DAYS_WORKED',
  date: new Date(),
  record: 0
}]

app.get('/hs-records', async (req, res) => {


  let { HSRecords } = await collection.findOne({ email: 'cem20903@gmail.com' });

const recordsWithUpdates = HSRecords.map(record => {

  const totalRecords = recordOnFutureBackend.filter(trackRecord => trackRecord.id === record.id)
  
  const sumTotal = totalRecords.reduce((acc, record) => acc + record.record, 0)
  
  const percentaje = Math.round((sumTotal * 100 / record.record) * 100) / 100

  return {
    ...record,
    current: sumTotal,
    percentaje
  }

})


res.json({ records: recordsWithUpdates })

})



export default app

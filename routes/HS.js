
import express from "express";
import collection from '../server.js'
import { calculateRead } from "../utils/calculateBooks.js";
import { uid } from 'uid';
const app = express();


app.get('/hs-books-records', async (req, res) => {

  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
    
  const { HSBooks, HSBooksToRead } = user
  
  const buildCorrectResponse = HSBooksToRead.map(book => {
  
    const booksById = HSBooks.filter(recordBook => recordBook.id === book.id)

    if(booksById.length > 0) {
      const bestRecordBook = booksById.sort((bookA, bookB) => bookB.current - bookA.current)[0]
      
      return bestRecordBook
    }
   
    return book
  })
  
  const totalPages = HSBooks.map(book => book.total).reduce((acc, pages) => acc + pages,0)
  
  const totalCurrent = HSBooks.map(book => book.current).reduce((acc, pages) => acc + pages,0)
    
  const average = Math.round((totalCurrent * 100 / totalPages) * 100) / 100
  
  res.json({ books: buildCorrectResponse, average })
})


const recordOnFutureBackend = [{
  id: 'DAYS_WORKED',
  date: new Date(),
  record: 0
}]

app.get('/hs-records', async (req, res) => {


let { HSRecords, HSRecordsTracking } = await collection.findOne({ email: 'cem20903@gmail.com' });

const recordsWithUpdates = HSRecords.map(record => {

  const totalRecords = HSRecordsTracking.filter(trackRecord => trackRecord.id === record.id)
  
  const sumTotal = totalRecords.reduce((acc, record) => acc + record.record, 0)
  
  const percentaje = Math.round((sumTotal * 100 / record.record) * 100) / 100
// El current tendria que ser 0 o el que haya
  return {
    ...record,
    record: sumTotal,
    percentaje,
    total: record.record
  }
})

const average = Math.round((recordsWithUpdates.reduce((acc, record) => acc + record.percentaje, 0) / recordsWithUpdates.length) * 100) / 100

res.json({ records: recordsWithUpdates, avg: average })

})

app.get('/hs-books', async (req, res) => {

  const { date } = req.query
    
  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { HSBooks, HSBooksToRead } = user
  
  const booksWithDate = HSBooks.filter(book => {
    const booksDate = new Date(book.date)
    booksDate.setHours(0,0,0,0)
    
    const dateFiltered = new Date(date)
    dateFiltered.setHours(0,0,0,0)
   return booksDate.getTime() === dateFiltered.getTime()
  })
    
  const buildCorrectResponse = HSBooksToRead.map(book => {
    const bookFounded = booksWithDate.find(booksWithDate => booksWithDate.id === book.id)
  
    if(bookFounded) {
      return bookFounded
    }
    
    return book
  })
  
  
  res.json({ books: buildCorrectResponse })
})


app.post('/hs-new-book', async (req, res) => {
 
  const { title, total, date } = req.body
  
   let user = await collection.findOne({ email: 'cem20903@gmail.com' });
   
   const { HSBooksToRead } = user
   
   const newBook = { title, total: parseFloat(total), current: 0, date: new Date(date), id: uid() }
   
   const copyBooksToRead = [...HSBooksToRead]
   
   copyBooksToRead.push(newBook)
   
   await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, HSBooksToRead: copyBooksToRead })
   
   res.json(newBook)
 })
 
 app.post('/add-hs-books-updated', async (req, res) => {
  
  const { booksUpdated } = req.body
  
  let user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { HSBooks } = user
  
  const booksUpdatedRecords = [...HSBooks, ...booksUpdated]
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, HSBooks: booksUpdatedRecords })
  
  res.json({});
});

app.post('/set-hs-records', async (req, res) => {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  let { HSRecordsTracking, HSRecords } = user

  let { currentRecords } = req.body
  
  console.log(currentRecords, 'ESTO DE AQUI')
  
  currentRecords = currentRecords.map(currentRecord => {
    return {
      ...currentRecord,
      date: new Date(currentRecord.date),
      record: currentRecord.record
    }
    
    
  
  })

   currentRecords = HSRecords.map(baseRecord => {
   
   const exist = currentRecords.find(currentRecord => currentRecord.title === baseRecord.title)
   
   if(exist) {
    return {...exist} 
  }
  
  return {...baseRecord}
   
   
   })
   

  
  
  let currentHSRecords = [...HSRecordsTracking]
  
  let existNewRecord = false
  
  const searchAndReplace = currentHSRecords.map(current => {
  
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
  
    
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, HSRecordsTracking: searchAndReplace })
  
  res.json({})

})


export default app

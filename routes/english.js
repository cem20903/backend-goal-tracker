
import express from "express";
import collection from '../server.js'
import { formatDate } from "../utils.js";
const app = express();

const baseRecords = [{
  title: 'Estudiar',
  record: 0,
}, {
  title: 'Escuchar',
  record: 0,

},{
  title: 'Leer',
  record: 0,

},{
  title: 'Escribir',
  record: 0,

},{
  title: 'Clases',
  record: 0,

}]

app.post('/set-records', async (req, res) => {

  let { currentRecords } = req.body
  
  
  currentRecords = currentRecords.map(currentRecord => {
    return {
      ...currentRecord,
      date: new Date(currentRecord.date)
    }
    
    
  
  })

   currentRecords = baseRecords.map(baseRecord => {
   
   const exist = currentRecords.find(currentRecord => currentRecord.title === baseRecord.title)
   
   if(exist) {
    return {...exist} 
  }
  
  return {...baseRecord}
   
   
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



app.get('/english-records', async (req, res) => {

  const { date } = req.query
  
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  
  
  let currentEnglishRecords = [...usuario.englishRecords]
  
  
  const recordsFilterByDate = currentEnglishRecords.filter(record => {
    if(record === null) {
      return false
    }
    
    return record.date === formatDate(date)
  })
  
  console.log('Los datos QUE MANDO', recordsFilterByDate)
  
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

app.get('/summary-records', async (req, res) => {

  console.log('Pido resumen de todos los records')

  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { englishRecords } = usuario
  
  const allTitles = [...new Set(englishRecords.map(record => record.title))] 
  
  const summary = allTitles.map(title => {
    
    const onlyTitle = englishRecords.filter(record => {
    
      
    return record.title === title && new Date(record.date).getFullYear() === 2024 }
    )
  
    return {
      title,
      total: onlyTitle.reduce((acc, record) => record.record + acc, 0 )
    }
  
  })
  
  console.log('Mando summary Records')
  
  return  res.json(summary)
 
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

export default app


import express from "express";
import collection from '../server.js'
import { uid } from 'uid';
const app = express();

const baseRecords = [{
  title: 'Estudiar',
  record: 61,
}, {
  title: 'Escuchar',
  record: 2585,

},{
  title: 'Leer',
  record: 519,

},{
  title: 'Escribir',
  record: 7760,

},{
  title: 'Clases',
  record: 99,
}]


function calculateRead (books) {

  const totalPagesToRead = books.reduce((acc, book) => acc + parseFloat(book.total), 0)
  const totalPagesReaded = books.reduce((acc, book) => acc + parseFloat(book.current), 0)
  
  return Math.round((totalPagesReaded * 100 / totalPagesToRead) * 100) / 100
  
}

function calculateOthers (otherGoals, name) {

  const appCI = otherGoals.filter(goal => goal.goalName === name)
  
  const tasksCompleted = appCI.filter(goal => goal.completed)
  const appCIPercentage =  Math.round((tasksCompleted.length * 100 / appCI.length) * 100) / 100

  return appCIPercentage
}

function calculateTotal (results) {

  const percentage = results.reduce((acc, goal) => acc + goal.percentage, 0) / results.length
  
  return Math.round(percentage * 100) / 100
}

function calculateEnglish(englishRecords) {
  
  const allTitles = [...new Set(englishRecords.map(record => record.title))] 
  
  const summary = allTitles.map(title => {
    
    const onlyTitle = englishRecords.filter(record => {  
    return record.title === title && new Date(record.date).getFullYear() === 2024 }
    )
    
    const current = onlyTitle.reduce((acc, record) => record.record + acc, 0 )
    const total = baseRecords.find(baseRecord => baseRecord.title === title).record

    const percentage = current * 100 / total
  
    return {
      title,
      percentage
    }
  
  })
  
  const totalpercentage = summary.reduce((acc, percentage) => acc + percentage.percentage, 0) / summary.length

  
  return Math.round(totalpercentage * 100) / 100

}

app.get('/summary', async (req, res) => {
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, books, englishRecords } = user
  
  const readPercantage = { title: 'Lectura', percentage: calculateRead(books) }
  const englishPercentage = { title: 'Ingles', percentage: calculateEnglish(englishRecords) }
  const appCIPercentage = { title: 'App Coeficiente Iron', percentage: calculateOthers(otherGoals, 'APP_CI') } 
  const goalTrackerPercentage = { title: 'App Goal Tracker', percentage: calculateOthers(otherGoals, 'GOAL_TRACKER') }
  
  const CI = { title: 'Coeficiente Iron (beta)', percentage: 50.58 }
  const weight = { title: 'Peso (beta)', percentage: 50.58 }
  const economy = { title: 'Economia (beta) ', percentage: 41 }
  
  
  // Son ToDo
  
  const work = { title: 'Carrera Laboral', percentage: calculateOthers(otherGoals, 'WORK') }
  const instaAlfara = { title: 'Instagram Alfara', percentage: calculateOthers(otherGoals, 'INSTAALFARA') }
  const first = { title: 'First', percentage: calculateOthers(otherGoals, 'FIRST') }
  const sport = { title: 'Deporte', percentage: calculateOthers(otherGoals, 'SPORTS') }
  const house = { title: 'Cosas de Casa', percentage: calculateOthers(otherGoals, 'HOUSE') }
  


  const results = [CI, weight, economy, work, first, house, sport, readPercantage, instaAlfara, englishPercentage, appCIPercentage, goalTrackerPercentage]
  
  const total = calculateTotal(results)


 
  res.json({ results, total })

})


app.post('/save-summary', async (req, res) => {

  const { currentSummary } = req.body
  
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { summary } = user
  
  summary.push({ summary: currentSummary, date: new Date() })
  
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, summary })
  
  res.json({})

})


function getWeekNumber(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  target.setDate(target.getDate() + 4 - (target.getDay() || 7));
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);

  return weekNumber;
}

app.get('/summary-by', async (_, res) => {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, englishRecords, diaryTasks } = user
  
  const tasksCompleted = otherGoals.filter(task => task.completed)
  
  const currentWeek = getWeekNumber(new Date())
  
  const tasksWithWeekNumber = tasksCompleted.map(task => {
    return {
    ...task,
    week: getWeekNumber(task.finishedAt)
    }
  })
  
  const tasksByWeek = tasksWithWeekNumber.filter(task => task.week === currentWeek)
  
  const englishRecordsWithWeekNumber = englishRecords.map(record => {
    return {
      ...record,
      week: getWeekNumber(record.date)
    }
  })
  
  const englishRecordsByWeek = englishRecordsWithWeekNumber.filter(task => task.week === currentWeek)
  
  
  const diaryTasksWithWeekNumber = diaryTasks.map(task => {
    return {
    ...task,
    week: getWeekNumber(task.date)
    }
  })
  
  const diaryTasksByWeek = diaryTasksWithWeekNumber.filter(task => task.week === currentWeek)
  
  
  res.json({ diaryTasksByWeek, englishRecordsByWeek, tasksByWeek })

})







export default app

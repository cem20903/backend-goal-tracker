
import express from "express";
import collection from '../server.js'
import { calculateRead } from "../utils/calculateBooks.js";
import { calculateOthers, calculateTotal, calculateEnglish, getWeekEnglishNumbers, getTasksNumbers, buildEnglishComparative, getBuildTasksComparative  } from "../utils/calculateSummary.js";
import { getWeekNumber } from '../utils/dates.js'
import comparativeWeeks from "../controllers/comparativeWeeks.js";

const app = express();

app.get('/summary', async (req, res) => {
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, books, englishRecords, booksToRead } = user
  
  const readPercantage = { title: 'Lectura', percentage: calculateRead(books, booksToRead) }
  const englishPercentage = { title: 'Ingles', percentage: calculateEnglish(englishRecords) }
  const appCIPercentage = { title: 'App Coeficiente Iron', percentage: calculateOthers(otherGoals, 'APP_CI') } 
  const goalTrackerPercentage = { title: 'App Goal Tracker', percentage: calculateOthers(otherGoals, 'GOAL_TRACKER') }
  
  const CI = { title: 'Coeficiente Iron (beta)', percentage: 67.95 }
  const weight = { title: 'Peso (beta)', percentage: 50.58 }
  const economy = { title: 'Economia (beta) ', percentage: 50 }
  
  
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

app.get('/summary-by', async (_, res) => {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, englishRecords, diaryTasks } = user
  
  const currentWeek = getWeekNumber(new Date())
  const tasksByWeek = getTasksNumbers(otherGoals)
  
  
  // Diary Task
  const diaryTasksWithWeekNumber = diaryTasks.map(task => {
    return {
      ...task,
      week: getWeekNumber(task.date)
    }
  })
  
  const diaryTasksByWeek = diaryTasksWithWeekNumber.filter(task => task.week === currentWeek)
  
  const englishRecordsJoined = getWeekEnglishNumbers(englishRecords)
  
  res.json({ diaryTasksByWeek, englishRecordsByWeek: englishRecordsJoined, tasksByWeek })

})

app.get('/comparative-weeks', comparativeWeeks)

app.get('/comparative-percentages', async (req, res) => {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  const { summary } = user
  
  res.json(summary)
})

export default app

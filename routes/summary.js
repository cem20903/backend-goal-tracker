
import express from "express";
import collection from '../server.js'
import { calculateRead } from "../utils/calculateBooks.js";
import { calculateOthers, calculateTotal, calculateEnglish, getWeekEnglishNumbers, getTasksNumbers, buildEnglishComparative, getBuildTasksComparative  } from "../utils/calculateSummary.js";
import { getWeekNumber } from '../utils/dates.js'
import comparativeWeeks from "../controllers/comparativeWeeks.js";
import comparativeWeeeksAllTime from '../controllers/comparativeWeeeksAllTime.js'
import fetch from "node-fetch";

const app = express();

app.get('/summary', async (req, res) => {
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, books, englishRecords, booksToRead } = user
  
  const readPercantage = { title: 'Lectura', percentage: calculateRead(books, booksToRead) }
  const englishPercentage = { title: 'Ingles', percentage: calculateEnglish(englishRecords) }
  const appCIPercentage = { title: 'App Coeficiente Iron', percentage: calculateOthers(otherGoals, 'APP_CI') } 
  const goalTrackerPercentage = { title: 'App Goal Tracker', percentage: calculateOthers(otherGoals, 'GOAL_TRACKER') }
  
  
  const response = await fetch('https://fitnessworkout.onrender.com/info-for-gt')
  const { percentajeWeight, percentajeCI } = await response.json()
  
  console.log(percentajeWeight, percentajeCI, 'ESTO')
  
  
  const CI = { title: 'Coeficiente Iron', percentage: percentajeCI }
  const weight = { title: 'Peso', percentage: percentajeWeight }
  const economy = { title: 'Economia (beta) ', percentage: 51 }
  
  
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
  
  const average = currentSummary.reduce((acc, record) => acc + record.percentage , 0) / currentSummary.length
  
  summary.push({ summary: currentSummary, date: new Date(), average })
  
  
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

app.get('/comparative-weeks-all-time', comparativeWeeeksAllTime)


app.get('/info-ci', async (req, res) => {

  const response = await fetch('http://localhost:4000/gt/train/records')
  const infoCI = await response.json()
  
  const { strongRecords, aerobicRecords, powerRecords } = infoCI
    
  const names = {
    PRESS_BANCA: 'Press banca',
    PRESS_MILITAR: 'Press militar',
    PESO_MUERTO: 'Peso muerto',
    DOMINADAS: 'Dominadas',
    SENTADILLA: 'Sentadilla'
  }
  
  const buildStrongRecords = strongRecords.map(strongRecord => {
  
  const { exercise, goal, record, ci } = strongRecord
  
  return {
    title: names[exercise],
    total: goal,
    current: record,
    percentaje: Math.round(ci * 100) / 100
  }
  
  })
  
  const buildAerobicRecords = {
    title: 'Correr',
    total: 25,
    current: Math.round((aerobicRecords.record.seconds / 60) * 100) / 100,
    percentaje: Math.round(aerobicRecords.ci * 100) / 100
  }
  
  const buildPowerRecord = {
    title: 'Sprint',
    total: 15,
    current: powerRecords.record,
    percentaje: Math.round(powerRecords.ci * 100) / 100
  }
  
  const allRecords = [...buildStrongRecords]
  allRecords.push(buildPowerRecord)
  allRecords.push(buildAerobicRecords)


  res.json({ allRecords })

})


export default app


import express from "express";
import collection from '../server.js'
import { calculateRead } from "../utils/calculateBooks.js";
import { calculateOthers, calculateTotal, calculateEnglish, getWeekEnglishNumbers, getTasksNumbers, buildEnglishComparative, getBuildTasksComparative  } from "../utils/calculateSummary.js";
import { getWeekNumber } from '../utils/dates.js'
import comparativeWeeks from "../controllers/comparativeWeeks.js";
import comparativeWeeeksAllTime from '../controllers/comparativeWeeeksAllTime.js'
import fetch from "node-fetch";
import { getInfoFitnessWorkout, getRecords } from "../services/fitnessWorkout.js";

const app = express();

const BACK_CI_URL = 'https://fitnessworkout.onrender.com'

// const BACK_CI_URL = 'http://localhost:4000'

function calculateStrikesHS (HSRecords, HSRecordsTracking) {


  const recordsWithUpdates = HSRecords.map(record => {

    const totalRecords = HSRecordsTracking.filter(trackRecord => trackRecord.id === record.id)
    
    const sumTotal = totalRecords.reduce((acc, record) => acc + record.record, 0)
    
    const percentaje = Math.round((sumTotal * 100 / record.record) * 100) / 100
  
    return {
      ...record,
      record: sumTotal,
      percentaje,
      total: record.record
    }
  })
  
  const average = Math.round((recordsWithUpdates.reduce((acc, record) => acc + record.percentaje, 0) / recordsWithUpdates.length) * 100) / 100
  
  return average

}

function calculateHSBooks (HSBooks) {
  
  const totalPages = HSBooks.map(book => book.total).reduce((acc, pages) => acc + pages,0)
  
  const totalCurrent = HSBooks.map(book => book.current).reduce((acc, pages) => acc + pages,0)
    
  const average = Math.round((totalCurrent * 100 / totalPages) * 100) / 100
  
  return average

}



app.get('/summary', async (req, res) => {
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, books, englishRecords, booksToRead, HSRecords, HSRecordsTracking, HSBooks } = user
  
  const readPercantage = { title: 'Lectura', percentage: calculateRead(books, booksToRead) }
  const englishPercentage = { title: 'Ingles', percentage: calculateEnglish(englishRecords) }
  const appCIPercentage = { title: 'App Coeficiente Iron', percentage: calculateOthers(otherGoals, 'APP_CI') } 
  const goalTrackerPercentage = { title: 'App Goal Tracker', percentage: calculateOthers(otherGoals, 'GOAL_TRACKER') }
  
  const { percentajeWeight, percentajeCI } = await getInfoFitnessWorkout()
  
    
  const CI = { title: 'Coeficiente Iron', percentage: percentajeCI, primary: true }
  const weight = { title: 'Peso', percentage: percentajeWeight, primary: true }
  const economy = { title: 'Economia (beta) ', percentage: 51 }
  
  
  // Son ToDo
  const personalBrand = { title: 'Marca Personal', percentage: calculateOthers(otherGoals, 'PRO_WORK') }
  const work = { title: 'Carrera Laboral', percentage: calculateOthers(otherGoals, 'WORK') }
  const instaAlfara = { title: 'Instagram Alfara', percentage: calculateOthers(otherGoals, 'INSTAALFARA') }
  const first = { title: 'First', percentage: calculateOthers(otherGoals, 'FIRST') }
  const sport = { title: 'Deporte', percentage: calculateOthers(otherGoals, 'SPORTS') }
  const house = { title: 'Cosas de Casa', percentage: calculateOthers(otherGoals, 'HOUSE') }
  

  const hsTotal = [calculateOthers(otherGoals, 'HS'), calculateOthers(otherGoals, 'HS_OTHERS'), calculateStrikesHS(HSRecords, HSRecordsTracking), calculateHSBooks(HSBooks)]
  
  const hsAverage = Math.round((hsTotal.reduce((acc, avg) => acc + avg, 0) / hsTotal.length) * 100) / 100
  
  const socialSkills = { title: 'Habilidades Sociales', percentage: hsAverage, primary: true }
  


  const results = [socialSkills, CI, weight, economy, work, personalBrand, first, house, sport, readPercantage, instaAlfara, englishPercentage, appCIPercentage, goalTrackerPercentage]
  
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

  const infoCI = await getRecords()
  
  const { strongRecords, aerobicRecords, powerRecords, totalCI } = infoCI
    
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
    total: Math.round(goal * 100) / 100,
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


  res.json({ allRecords, totalCI })

})


export default app

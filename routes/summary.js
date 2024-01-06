
import express from "express";
import collection from '../server.js'
import { uid } from 'uid';
const app = express();

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

app.get('/summary', async (req, res) => {
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, books } = user
  
  const readPercantage = { title: 'Lectura', percentage: calculateRead(books) }
  const englishPercentage = { title: 'Ingles', percentage: 0 }
  const appCIPercentage = { title: 'App Coeficiente Iron', percentage: calculateOthers(otherGoals, 'APP_CI') } 
  const goalTrackerPercentage = { title: 'App Goal Tracker', percentage: calculateOthers(otherGoals, 'GOAL_TRACKER') }
  
  
  const CI = { title: 'Coeficiente Iron (beta)', percentage: 50.58 }
  const weight = { title: 'Peso (beta)', percentage: 50.58 }
  const economy = { title: 'Economia (beta) ', percentage: 41 }
  
  
  // Son ToDo
  
  const playback = { title: 'PlayBack ',  percentage: calculateOthers(otherGoals, 'PLAYBACK') }
  const work = { title: 'Carrera Laboral', percentage: calculateOthers(otherGoals, 'WORK') }
  const instaAlfara = { title: 'Instagram Alfara', percentage: calculateOthers(otherGoals, 'INSTAALFARA') }
  const first = { title: 'First', percentage: calculateOthers(otherGoals, 'FIRST') }
  const sport = { title: 'Deporte', percentage: calculateOthers(otherGoals, 'SPORTS') }
  const house = { title: 'Cosas de Casa (beta)', percentage: calculateOthers(otherGoals, 'HOUSE') }
  


  const results = [CI, weight, economy, work, first, house, playback, sport, readPercantage, instaAlfara, englishPercentage, appCIPercentage, goalTrackerPercentage]
  
  const total = calculateTotal(results)


 
  res.json({ results, total })

})








export default app

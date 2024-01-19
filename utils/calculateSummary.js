import { getWeekNumber } from './dates.js'


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

function getWeekEnglishNumbers (englishRecords, week) {

  const weekFiltered = week ? week : getWeekNumber(new Date())

  const englishRecordsWithWeekNumber = englishRecords.map(record => {
    return {
      ...record,
      week: getWeekNumber(record.date)
    }
  })
  
  const englishRecordsByWeek = englishRecordsWithWeekNumber.filter(task => task.week === weekFiltered)
  
  const allTitles = [...new Set(englishRecordsWithWeekNumber.map(record => record.title))]
  
  const englishRecordsJoined = allTitles.map(title => {
  
    const onlyTitle = englishRecordsByWeek.filter(record => record.title === title )
    const current = onlyTitle.reduce((acc, record) => record.record + acc, 0 )
    
    return {
      title,
      record: current
    }
  })
  
  return englishRecordsJoined
}

function getTasksNumbers (otherGoals, week) {

  const weekFiltered = week ? week : getWeekNumber(new Date())

  const tasksCompleted = otherGoals.filter(task => task.completed)
   
  const tasksWithWeekNumber = tasksCompleted.map(task => {
    return {
    ...task,
    week: getWeekNumber(task.finishedAt)
    }
  })
  
  const tasksByWeek = tasksWithWeekNumber.filter(task => task.week === weekFiltered)
  
  return tasksByWeek

}


function buildEnglishComparative (englishRecords) {
  const currentWeekEnglishRecords = getWeekEnglishNumbers(englishRecords, getWeekNumber(new Date()))
  const lastWeekEnglishRecords = getWeekEnglishNumbers(englishRecords, getWeekNumber(new Date()) - 1 )
  
  const allTitles = [...new Set(englishRecords.map(record => record.title))]
  
  const buildComparative = allTitles.map(title => {
    const currentWeek = currentWeekEnglishRecords.filter(current => current.title === title)[0].record
    const lastWeek = lastWeekEnglishRecords.filter(current => current.title === title)[0].record
    
    return {
      title,
      currentWeek,
      lastWeek
    }
  
  })
  return buildComparative

}

function getBuildTasksComparative (otherGoals) {
  const currentWeekTasks = getTasksNumbers(otherGoals, getWeekNumber(new Date()))
  const lastWeekTasks = getTasksNumbers(otherGoals, getWeekNumber(new Date()) - 1)
  const allGoalNames = [...currentWeekTasks.map(task => task.goalName), ...lastWeekTasks.map(task => task.goalName)]
  const uniqueGoalNames = [...new Set(allGoalNames)]
  
  const buildTasksComparative = uniqueGoalNames.map(goalName => {
  
   const currentWeek = currentWeekTasks.filter(task => task.goalName === goalName).length
   const lastWeek = lastWeekTasks.filter(task => task.goalName === goalName).length
  
   return {
     title: goalName,
     currentWeek,
     lastWeek
   }
  })
  return buildTasksComparative

}


export { calculateOthers, calculateTotal, calculateEnglish, getWeekEnglishNumbers, getTasksNumbers, getBuildTasksComparative, buildEnglishComparative }

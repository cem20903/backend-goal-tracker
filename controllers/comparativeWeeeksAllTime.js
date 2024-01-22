
import collection from '../server.js'
import { booksPagesReadedByWeek } from "../utils/calculateBooks.js";
import { buildEnglishComparative, getBuildTasksComparative, getTasksNumbers, getWeekEnglishNumbers  } from "../utils/calculateSummary.js";
import { getWeekNumber } from '../utils/dates.js'


function bestOfAllTimeByGoalName (otherGoals, name) {

  const goalTrackerRecords = otherGoals.filter(goal => goal.goalName === name && goal.finishedAt !== null)
  const recordsWithWeek = goalTrackerRecords.map(goal => { return {...goal, week: getWeekNumber(goal.finishedAt)}})
  const mappedByWeek = [...new Set(recordsWithWeek.map(goal => goal.week))]

  const quantityByWeek = mappedByWeek.map(numberOfWeek => {
      const total = recordsWithWeek.filter(goal => goal.week === numberOfWeek)
      
      return {
        name: name,
        week: numberOfWeek,
        quantityByWeek: total.length
      }
    
    })  
    const sortedByHighest = quantityByWeek.sort((recordB, recordA) => recordA.quantityByWeek - recordB.quantityByWeek )[0]
  
  return sortedByHighest

}

function bestOfAllTimeByTitleName (englishRecords, name) {

  const filterByName = englishRecords.filter(record => record.title === name)
  const recordsWithWeek = filterByName.map(record => { return {...record, week: getWeekNumber(record.date)}})
  
  const weeks = [... new Set(recordsWithWeek.map(record => record.week))]
  
  const recordsByWeek = weeks.map(week => {
    // Ahora necesito sumarlos
    const recordsByEachWeek = recordsWithWeek.filter(record => record.week === week).reduce((acc, record) => acc + record.record, 0)
    
    return {
      title: name,
      week,
      quantityByWeek: recordsByEachWeek
    }
    
  }).sort((recordB, recordA) => recordA.quantityByWeek - recordB.quantityByWeek )[0]
  
  return recordsByWeek

}

async function comparativeWeeeksAllTime (req, res) {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, englishRecords, books } = user
  
  // Other Goals
  const names = [...new Set(otherGoals.map(goal => goal.goalName))]
  const bestByName = names.map(name => bestOfAllTimeByGoalName(otherGoals, name)).filter(record => record)
  // { otherGoals: bestByName }
  
  // English
  const titles = [...new Set(englishRecords.map(record => record.title))]
  const bestByTitle = titles.map(name => bestOfAllTimeByTitleName(englishRecords, name))
  
  const recordsWithWeek = books.map(record => { return {...record, week: getWeekNumber(record.date)}})
  const allWeeks = [...new Set(recordsWithWeek.map(record => record.week))]
  // books 
  
  const recordsByWeek = allWeeks.map(week => {
    const record = booksPagesReadedByWeek(books, week)
    
    return {
      week,
      record
    }
  }).sort((recordB, recordA) => recordA.record - recordB.record )[0]
  // booksPagesReadedByWeek
  
  
  const read = {
    title: 'Paginas Leidas',
    currentWeek: booksPagesReadedByWeek(books, getWeekNumber(new Date())),
    bestOfAllTime: recordsByWeek.record
  }
  

  const english = titles.map(title => {
  
  const currentWeekEnglishRecords = getWeekEnglishNumbers(englishRecords, getWeekNumber(new Date()))
  const filterByName = currentWeekEnglishRecords.filter(record => record.title === title.title)
  const totalThisWeek = filterByName.reduce((acc, record) =>  acc + record.record, 0)
    
    return {
      title,
      bestOfAllTime: bestByTitle.find(best => best.title === title).quantityByWeek,
      currentWeek: totalThisWeek
    }
  })
  
  const buildOtherGoals = names.map(name => {
  
  const goalsRecordsByName = bestByName.find(record => record.name === name)
  
  const currentWeek = otherGoals
    .map(goal => { return {...goal, week: getWeekNumber(goal.finishedAt)}})
    .filter(goal => goal.completed)
    .filter(goal => goal.goalName === name)
    .filter(goal => goal.week === getWeekNumber(new Date()))
  // && goal.week === getWeekNumber(new Date())
  
  return {
    name,
    bestOfAllTime: goalsRecordsByName ? goalsRecordsByName.quantityByWeek : 0 ,
    currentWeek: currentWeek.length
  }
  }) 
  
  
res.json({ english, otherGoals: buildOtherGoals, read: [read] })

//  res.json({ english: buildComparative, otherGoals: buildTasksComparative, read })

}



export default comparativeWeeeksAllTime

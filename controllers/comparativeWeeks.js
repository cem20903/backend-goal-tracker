
import collection from '../server.js'
import { booksPagesReadedByWeek } from "../utils/calculateBooks.js";
import { buildEnglishComparative, getBuildTasksComparative  } from "../utils/calculateSummary.js";
import { getWeekNumber } from '../utils/dates.js'
 
async function comparativeWeeks (req, res) {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals, englishRecords, books } = user
  
 const buildComparative = buildEnglishComparative(englishRecords)
 const buildTasksComparative = getBuildTasksComparative(otherGoals)
 
  const read = [{ 
      title: 'Paginas Leidas',
      currentWeek: booksPagesReadedByWeek(books, getWeekNumber(new Date())),
      lastWeek: booksPagesReadedByWeek(books, getWeekNumber(new Date()) - 1)
  }]
  
 res.json({ english: buildComparative, otherGoals: buildTasksComparative, read })
}

export default comparativeWeeks

export function calculateRead (books) {

  // Aqui no voy uno a uno, sumo todo los totales, luego los current y saco media
  // En el otro calculo cada media y luego calculo la media con eso
  const totalPagesToRead = books.reduce((acc, book) => acc + parseFloat(book.total), 0)
  const totalPagesReaded = books.reduce((acc, book) => acc + parseFloat(book.current), 0)
  
  return Math.round((totalPagesReaded * 100 / totalPagesToRead) * 100) / 100
  
}


function getWeekNumber(date) {
  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  target.setDate(target.getDate() + 4 - (target.getDay() || 7));
  const yearStart = new Date(target.getFullYear(), 0, 1);
  const weekNumber = Math.ceil(((target - yearStart) / 86400000 + 1) / 7);

  return weekNumber;
}

function addCurrentWeekAndFilterByYear (currentRecords) {
  return currentRecords.map(book => {
    return {
      ...book,
      week: getWeekNumber(book.date)
    }
  }).filter(book => book.date.getFullYear() === 2024)

}



export function calculatePagesReadCurrentWeek(books) {
  
  const bookTitles = [...new Set(books.map(book => book.title))]
  const currentWeek = getWeekNumber(new Date())
    
  const totalReaded = bookTitles.map(bookTitle => {
  
    
    const currentRecords = books.filter(book => book.title === bookTitle)
    const booksWithCorrectDate = addCurrentWeekAndFilterByYear(currentRecords)
    
    
  
  
  const booksReadedThisWeek = booksWithCorrectDate.filter(book => book.week === currentWeek).sort((bookA, bookB) => bookB.current - bookA.current)[0]
    
  const booksReadedLastWeek = booksWithCorrectDate.filter(book => book.week === currentWeek - 1).sort((bookA, bookB) => bookA.current - bookB.current)[0]
  
  const highestPagesReaded = booksWithCorrectDate.filter(book => book.week !== currentWeek).sort((bookA, bookB) => bookA.current - bookB.current)[0]
  
  const hasNotRegistry = !booksReadedLastWeek && !highestPagesReaded
  
  if(hasNotRegistry) {
  
    return {
      title: bookTitle,
      totalPagesReaded: booksReadedThisWeek ? booksReadedThisWeek.current : 0
    } 
    }
  

    
    return {
      title: bookTitle,
      totalPagesReaded: 0,
      default: true
    }
  
  })
  
  
  const sumTotalReadedThisWeek = totalReaded.reduce((acc, book) => acc + book.totalPagesReaded, 0)

  return sumTotalReadedThisWeek
}






export function calculateLastWeekPagesRead (books) {
  // Este solo esta funcionando por que no hay registros anteriores
  const buildPagesReadedLastWeek = addCurrentWeekAndFilterByYear(books)
  const lastWeek = getWeekNumber(new Date()) - 1 
  const removeRecordsAfterTheWeekINeedToCalcule = buildPagesReadedLastWeek.filter(book => book.week <= lastWeek)
  const highestPagesReaded = removeRecordsAfterTheWeekINeedToCalcule.filter(book => book.week !== lastWeek)
  const totalPagesReadedLastWeek = removeRecordsAfterTheWeekINeedToCalcule.reduce((acc, book) => acc + book.current, 0)
  
  return { totalPagesReadedLastWeek, highestPagesReaded }

}

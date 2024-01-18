import { getWeekNumber } from './dates.js'

export function calculateRead (books, allBooks) {

  // Aqui no voy uno a uno, sumo todo los totales, luego los current y saco media
  // En el otro calculo cada media y luego calculo la media con eso
  const totalPagesToRead = allBooks.reduce((acc, book) => acc + parseFloat(book.total), 0)
  
  // TODO -> Llevar a funcion, esta repetido
  const buildCorrectResponse = allBooks.map(book => {
    const booksById = books.filter(recordBook => recordBook.id === book.id)

    if(booksById.length > 0) {
      const bestRecordBook = booksById.sort((bookA, bookB) => bookB.current - bookA.current)[0]
      
      return bestRecordBook
    }
   
    

    return book
  })
  
  
  const totalPagesReaded = buildCorrectResponse.reduce((acc, book) => acc + parseFloat(book.current), 0)
  
  return Math.round((totalPagesReaded * 100 / totalPagesToRead) * 100) / 100
  
}


function addCurrentWeekAndFilterByYear (currentRecords) {
if(!currentRecords.length) {
  return []
}

  return currentRecords.map(book => {
    return {
      ...book,
      week: getWeekNumber(book.date)
    }
  }).filter(book => new Date(book.date).getFullYear() === 2024)

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
  
  
    return {
      title: bookTitle,
      totalPagesReaded: booksReadedThisWeek ? booksReadedThisWeek.current : 0,
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

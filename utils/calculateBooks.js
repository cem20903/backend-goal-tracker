export function calculateRead (books) {

  // Aqui no voy uno a uno, sumo todo los totales, luego los current y saco media
  // En el otro calculo cada media y luego calculo la media con eso
  const totalPagesToRead = books.reduce((acc, book) => acc + parseFloat(book.total), 0)
  const totalPagesReaded = books.reduce((acc, book) => acc + parseFloat(book.current), 0)
  
  return Math.round((totalPagesReaded * 100 / totalPagesToRead) * 100) / 100
  
}

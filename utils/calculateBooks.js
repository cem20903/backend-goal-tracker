import { getWeekNumber } from "./dates.js";

export function calculateRead(books, allBooks) {
	// Aqui no voy uno a uno, sumo todo los totales, luego los current y saco media
	// En el otro calculo cada media y luego calculo la media con eso
	const totalPagesToRead = allBooks.reduce(
		(acc, book) => acc + parseFloat(book.total),
		0
	);

	// TODO -> Llevar a funcion, esta repetido
	const buildCorrectResponse = allBooks.map((book) => {
		const booksById = books.filter((recordBook) => recordBook.id === book.id);

		if (booksById.length > 0) {
			const bestRecordBook = booksById.sort(
				(bookA, bookB) => bookB.current - bookA.current
			)[0];

			return bestRecordBook;
		}

		return book;
	});

	const totalPagesReaded = buildCorrectResponse.reduce(
		(acc, book) => acc + parseFloat(book.current),
		0
	);

	return Math.round(((totalPagesReaded * 100) / totalPagesToRead) * 100) / 100;
}

function addCurrentWeekAndFilterByYear(currentRecords) {
	if (!currentRecords.length) {
		return [];
	}

	return currentRecords
		.map((book) => {
			return {
				...book,
				week: getWeekNumber(book.date),
			};
		})
		.filter((book) => new Date(book.date).getFullYear() === 2024);
}

export function booksPagesReadedByWeek(books, week) {
	const buildPagesReadedLastWeek = addCurrentWeekAndFilterByYear(books);

	// Sacamos el numero de la semana pasada
	const lastWeek = week;

	// Registros de esta semana
	const currentWeeksBooks = buildPagesReadedLastWeek.filter(
		(book) => book.week === lastWeek
	);

	// Libros anteriores a esta semana
	const beforeRecordBooks = buildPagesReadedLastWeek.filter(
		(book) => book.week < lastWeek
	);

	// Ids de libros leidos esta semana
	const uniqueBookId = [...new Set(currentWeeksBooks.map((book) => book.id))];

	const calculate = uniqueBookId.map((id) => {
		const currentBook = currentWeeksBooks
			.filter((book) => book.id === id)
			.sort((bookA, bookB) => bookB.current - bookA.current)[0];

		// Registros anteriores por libro
		const booksById = beforeRecordBooks.filter((book) => book.id === id);
		const highestRecordBookById = booksById.sort(
			(bookA, bookB) => bookB.current - bookA.current
		)[0];

		const recordIfIreadedThisBookBefore = highestRecordBookById
			? highestRecordBookById.current
			: 0;
		const totalReaded = currentBook.current - recordIfIreadedThisBookBefore;

		return {
			title: currentBook.title,
			totalReaded,
			weekNumber: week,
		};
	});

	return calculate.reduce((acc, book) => acc + book.totalReaded, 0);
}

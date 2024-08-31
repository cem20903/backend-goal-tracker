import { august } from "../mock/diaryMocks.js";

function daysLeftUntilEndOfYear() {
	const today = new Date();
	const endOfYear = new Date(today.getFullYear(), 11, 31); // December is 11 because months are 0-indexed
	const difference = endOfYear - today; // Difference in milliseconds
	const daysLeft = Math.ceil(difference / (1000 * 60 * 60 * 24)); // Convert to days
	return daysLeft;
}

function calculatePagesToRead(booksToRead, books) {
	const buildCorrectResponse = booksToRead.map((book) => {
		const booksById = books.filter((recordBook) => recordBook.id === book.id);

		if (booksById.length > 0) {
			const bestRecordBook = booksById.sort(
				(bookA, bookB) => bookB.current - bookA.current
			)[0];

			return bestRecordBook;
		}

		return book;
	});

	const totalPagesToRead = booksToRead.reduce(
		(acc, book) => acc + parseFloat(book.total),
		0
	);

	const totalPagesReaded = buildCorrectResponse.reduce(
		(acc, book) => acc + parseFloat(book.current),
		0
	);

	const pagesPerRead = totalPagesToRead - totalPagesReaded;
	const days = daysLeftUntilEndOfYear();

	const pagesByDay = Math.floor((pagesPerRead / days) * 100) / 100;
	return pagesByDay;
}

const goalListen = 2585;
const goalStudy = 61;
const goalWrite = 7760;
const goalRead = 519;
const goalClasses = 99;

const GOALS = {
	Estudiar: 61,
	Escuchar: 2585,
	Leer: 519,
	Clases: 99,
	Escribir: 7760,
};

function calculateEnglishRemain(englishRecords) {
	const allTitles = [...new Set(englishRecords.map((record) => record.title))];

	const summary = allTitles.map((title) => {
		const onlyTitle = englishRecords.filter((record) => {
			return (
				record.title === title && new Date(record.date).getFullYear() === 2024
			);
		});

		const total = GOALS[title];
		const completed = onlyTitle.reduce((acc, record) => record.record + acc, 0);
		const perDay =
			Math.floor(((total - completed) / daysLeftUntilEndOfYear()) * 100) / 100;

		return {
			title,
			total,
			completed,
			perDay,
		};
	});

	return summary;
}

function calculateDiary(user) {
	const { booksToRead, books, englishRecords } = user;

	const pagesByDay = calculatePagesToRead(booksToRead, books);
	const englishThingsByDay = calculateEnglishRemain(englishRecords);

	const englishThingsFormated = englishThingsByDay.map((englishTask) => {
		return {
			title: `${englishTask.title}: ${englishTask.perDay}`,
			completed: false,
			goalName: "ENGLISH",
		};
	});

	const augustFully = august.map((day) => {
		const tasks = [...day.tasks, ...englishThingsFormated];

		const read = {
			title: `Leer ${pagesByDay} paginas`,
			completed: false,
			goalName: "Lectura",
		};

		tasks.push(read);
		return {
			...day,
			tasks,
		};
	});

	const onlyToday = augustFully.filter((taskWithDate) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		const currentDate = new Date(taskWithDate.date);
		currentDate.setHours(0, 0, 0, 0);

		return today.getTime() === currentDate.getTime();
	});

	const categories = [
		...new Set(onlyToday[0].tasks.map((task) => task.goalName)),
	];

	console.log(categories, "GOAL NAMES", onlyToday[0]);
	return { august: onlyToday, goalNames: categories };
}

export default calculateDiary;

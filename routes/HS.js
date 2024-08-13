import express from "express";
import collection from "../server.js";
import { calculateRead } from "../utils/calculateBooks.js";
import { uid } from "uid";
const app = express();

app.get("/hs-books-records", async (req, res) => {
	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { HSBooks, HSBooksToRead } = user;

	const buildCorrectResponse = HSBooksToRead.map((book) => {
		const booksById = HSBooks.filter((recordBook) => recordBook.id === book.id);

		if (booksById.length > 0) {
			const bestRecordBook = booksById.sort(
				(bookA, bookB) => bookB.current - bookA.current
			)[0];

			return bestRecordBook;
		}

		return book;
	});

	const totalPages = HSBooksToRead.map((book) => book.total).reduce(
		(acc, pages) => acc + pages,
		0
	);

	const totalCurrent = buildCorrectResponse
		.map((book) => book.current)
		.reduce((acc, pages) => acc + pages, 0);

	const average = Math.round(((totalCurrent * 100) / totalPages) * 100) / 100;

	res.json({ books: buildCorrectResponse, average });
});

app.get("/hs-records", async (req, res) => {
	let { HSRecords, HSRecordsTracking } = await collection.findOne({
		email: "cem20903@gmail.com",
	});

	const recordsWithUpdates = HSRecords.map((record) => {
		const totalRecords = HSRecordsTracking.filter(
			(trackRecord) => trackRecord.id === record.id
		);

		const sumTotal = totalRecords.reduce(
			(acc, record) => acc + record.record,
			0
		);

		const percentaje =
			Math.round(((sumTotal * 100) / record.record) * 100) / 100;

		return {
			...record,
			record: sumTotal,
			percentaje,
			total: record.record,
		};
	});

	const average =
		Math.round(
			(recordsWithUpdates.reduce((acc, record) => acc + record.percentaje, 0) /
				recordsWithUpdates.length) *
				100
		) / 100;

	res.json({ records: recordsWithUpdates, avg: average });
});

app.get("/hs-books", async (req, res) => {
	const { date } = req.query;

	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { HSBooks, HSBooksToRead } = user;

	const booksWithDate = HSBooks.filter((book) => {
		const booksDate = new Date(book.date);
		booksDate.setHours(0, 0, 0, 0);

		const dateFiltered = new Date(date);
		dateFiltered.setHours(0, 0, 0, 0);
		return booksDate.getTime() === dateFiltered.getTime();
	});

	const buildCorrectResponse = HSBooksToRead.map((book) => {
		const bookFounded = booksWithDate.find(
			(booksWithDate) => booksWithDate.id === book.id
		);

		if (bookFounded) {
			return bookFounded;
		}

		return book;
	});

	res.json({ books: buildCorrectResponse });
});

app.post("/hs-new-book", async (req, res) => {
	const { title, total, date } = req.body;

	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { HSBooksToRead } = user;

	const newBook = {
		title,
		total: parseFloat(total),
		current: 0,
		date: new Date(date),
		id: uid(),
	};

	const copyBooksToRead = [...HSBooksToRead];

	copyBooksToRead.push(newBook);

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, HSBooksToRead: copyBooksToRead }
	);

	res.json(newBook);
});

app.post("/add-hs-books-updated", async (req, res) => {
	const { booksUpdated } = req.body;

	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { HSBooks } = user;

	const booksUpdatedRecords = [...HSBooks, ...booksUpdated];

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, HSBooks: booksUpdatedRecords }
	);

	res.json({});
});

app.post("/set-hs-records", async (req, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	let { HSRecordsTracking, HSRecords } = user;

	let { currentRecords } = req.body;

	console.log(currentRecords, "ESTO QUE ONDA?");

	currentRecords = currentRecords.map((currentRecord) => {
		return {
			...currentRecord,
			date: new Date(currentRecord.date),
			record: currentRecord.record,
		};
	});

	currentRecords = HSRecords.map((baseRecord) => {
		const exist = currentRecords.find(
			(currentRecord) => currentRecord.title === baseRecord.title
		);

		if (exist) {
			return { ...exist };
		}

		return { ...baseRecord };
	});

	let currentHSRecords = [...HSRecordsTracking];

	let existNewRecord = false;

	const searchAndReplace = currentHSRecords.map((current) => {
		const newRecordFounded = currentRecords.find(
			(newRecord) =>
				current.title === newRecord.title && current.date === newRecord.date
		);

		if (newRecordFounded) {
			existNewRecord = true;
			return newRecordFounded;
		}

		return current;
	});

	if (!existNewRecord) {
		currentRecords.forEach((newRecord) => {
			searchAndReplace.push(newRecord);
		});
	}

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, HSRecordsTracking: searchAndReplace }
	);

	res.json({});
});

app.get("/hs-diary-tasks", async (req, res) => {
	const { HSBaseDiaryTasks } = await collection.findOne({
		email: "cem20903@gmail.com",
	});

	const currentDate = new Date().getDay();

	const isDayToGame = currentDate === 5 || currentDate === 4;

	if (isDayToGame) {
		HSBaseDiaryTasks.push({
			title: "Salida",
			completed: false,
			primary: true,
			id: "GO_GAME",
		});
	}

	res.json({ diaryTasks: HSBaseDiaryTasks });
});

app.post("/add-hs-tasks", async (req, res) => {
	console.log("/add-hs-tasks");

	let { tasks } = req.body;

	tasks = tasks.map((task) => {
		const date = new Date(task.date);
		date.setHours(0, 0, 0, 0);

		return {
			...task,
			date,
		};
	});

	let usuario = await collection.findOne({ email: "cem20903@gmail.com" });

	const { hsDiaryTasks } = usuario;

	if (hsDiaryTasks.length === 0) {
		await collection.replaceOne(
			{ email: "cem20903@gmail.com" },
			{ ...usuario, hsDiaryTasks: tasks }
		);
		return res.json({});
	}

	let existRecord = hsDiaryTasks.filter((task) => {
		return new Date(task.date).getTime() === new Date(tasks[0].date).getTime();
	});

	if (!existRecord) {
		const updatedTasks = [...hsDiaryTasks, ...tasks];
		await collection.replaceOne(
			{ email: "cem20903@gmail.com" },
			{ ...usuario, hsDiaryTasks: updatedTasks }
		);
		return res.json({});
	}

	let someChanged = false;

	let updateTasks = hsDiaryTasks.map((task) => {
		const exist = tasks.find(
			(newTask) =>
				newTask.title === task.title &&
				new Date(newTask.date).getTime() === new Date(task.date).getTime()
		);
		if (exist) {
			someChanged = true;
			return exist;
		}
		return task;
	});

	if (!someChanged) {
		tasks.map((task) => {
			updateTasks.push(task);
		});
	}
	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...usuario, hsDiaryTasks: updateTasks }
	);
	return res.json({});
});

// /get-all-hs-diary

app.get("/get-all-hs-diary", async (req, res) => {
	console.log("get all HS diary");
	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const tasksOrderedByDate = [...user.hsDiaryTasks].sort(
		(taskA, taskB) => new Date(taskA.date) - new Date(taskB.date)
	);

	const tasksFilterByCurrentMonth = tasksOrderedByDate.filter(
		(task) => new Date(task.date).getMonth() === new Date().getMonth()
	);

	res.json({ tasks: tasksFilterByCurrentMonth });
});

export default app;

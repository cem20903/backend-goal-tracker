import express from "express";
import collection from "../server.js";
import { calculateRead } from "../utils/calculateBooks.js";
import {
	calculateOthers,
	calculateTotal,
	calculateEnglish,
	getTasksNumbers,
} from "../utils/calculateSummary.js";
import comparativeWeeks from "../controllers/comparativeWeeks.js";
import comparativeWeeeksAllTime from "../controllers/comparativeWeeeksAllTime.js";
import {
	getInfoFitnessWorkout,
	getRecords,
} from "../services/fitnessWorkout.js";

import { uid } from "uid";

const app = express();

const goal = 4400;

const calculateEconomy = (current) => {
	return Math.round(((current * 100) / goal) * 100) / 100;
};

function calculateStrikesHS(HSRecords, HSRecordsTracking) {
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

	return average;
}

function calculateHSBooks(HSBooks, HSBooksToRead) {
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

	return average;
}

app.get("/info-weight", async (req, res) => {
	const { infoWeight } = await getInfoFitnessWorkout();
	res.json({ infoWeight });
});

app.get("/info-economy", async (req, res) => {
	const { currentSaves } = await collection.findOne({
		email: "cem20903@gmail.com",
	});

	const infoEconomy = {
		tableInfo: [
			{
				title: "Ahorros",
				total: goal,
				current: currentSaves,
				percentaje: Math.round(((currentSaves * 100) / goal) * 100) / 100,
			},
		],
		average: calculateEconomy(currentSaves),
	};
	res.json({ infoEconomy });
});

app.get("/info-debt", (req, res) => {
	const mock = [
		{
			title: "Deuda",
			total: "16934",
			current: "371,9",
			percentaje: 2,
		},
	];

	res.json({ infoDebt: mock });
});

app.get("/summary", async (req, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const {
		otherGoals,
		books,
		booksToRead,
		HSRecords,
		HSRecordsTracking,
		HSBooks,
		HSBooksToRead,
		currentSaves,
	} = user;

	const readPercantage = {
		title: "Lectura",
		percentage: calculateRead(books, booksToRead),
		name: "READ",
	};

	const appCIPercentage = {
		title: "App Coeficiente Iron",
		percentage: calculateOthers(otherGoals, "APP_CI"),
		name: "APP_CI",
	};

	const goalTrackerPercentage = {
		title: "App Goal Tracker",
		percentage: calculateOthers(otherGoals, "GOAL_TRACKER"),
		name: "GOAL_TRACKER",
	};

	const goalTrackerGenericPercentage = {
		title: "Goal Tracker - Generico",
		percentage: calculateOthers(otherGoals, "GOAL-TRACKER---GENERICO"),
		name: "GOAL-TRACKER---GENERICO",
	};

	const { percentajeWeight, percentajeCI } = await getInfoFitnessWorkout();

	const CI = {
		title: "Coeficiente Iron",
		percentage: percentajeCI,
		primary: true,
		name: "CI",
	};
	const weight = {
		title: "Peso",
		percentage: percentajeWeight,
		primary: true,
		name: "WEIGHT",
	};

	const economy = {
		title: "Economia (beta) ",
		percentage: calculateEconomy(currentSaves),
		name: "ECONOMY",
	};

	// Son ToDo
	const personalBrand = {
		title: "Marca Personal",
		percentage: calculateOthers(otherGoals, "PRO_WORK"),
		name: "PERSONAL_BRAND",
	};
	const work = {
		title: "Carrera Laboral",
		percentage: calculateOthers(otherGoals, "WORK"),
		name: "WORK",
	};
	const instaAlfara = {
		title: "Instagram Alfara",
		percentage: calculateOthers(otherGoals, "INSTAALFARA"),
		name: "INSTAGRAM_ALFARA",
	};
	// const first = {
	// 	title: "First",
	// 	percentage: calculateOthers(otherGoals, "FIRST"),
	// 	name: "FIRST",
	// };
	const sport = {
		title: "Deporte",
		percentage: calculateOthers(otherGoals, "SPORTS"),
		name: "SPORTS",
	};
	const house = {
		title: "Cosas de Casa",
		percentage: calculateOthers(otherGoals, "HOUSE"),
		name: "HOUSE",
	};

	const hsTotal = [
		calculateOthers(otherGoals, "HS"),
		calculateOthers(otherGoals, "HS_OTHERS"),
		calculateStrikesHS(HSRecords, HSRecordsTracking),
		calculateHSBooks(HSBooks, HSBooksToRead),
	];

	const hsAverage =
		Math.round(
			(hsTotal.reduce((acc, avg) => acc + avg, 0) / hsTotal.length) * 100
		) / 100;

	const socialSkills = {
		title: "Habilidades Sociales",
		percentage: hsAverage,
		primary: true,
		name: "HS",
	};

	const results = [
		socialSkills,
		CI,
		weight,
		economy,
		work,
		personalBrand,
		// first,
		house,
		sport,
		readPercantage,
		instaAlfara,
		// englishPercentage,
		appCIPercentage,
		// appCIUsers,
		goalTrackerPercentage,
		goalTrackerGenericPercentage,
	];

	const total = calculateTotal(results);

	res.json({ results, total });
});

app.post("/save-summary", async (req, res) => {
	const { currentSummary } = req.body;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { summary } = user;

	const average =
		currentSummary.reduce((acc, record) => acc + record.percentage, 0) /
		currentSummary.length;

	summary.push({ summary: currentSummary, date: new Date(), average });

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, summary }
	);

	res.json({});
});

app.get("/summary-by", async (_, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	const tasksByWeek = getTasksNumbers(otherGoals);

	const allTasksWithMonth = otherGoals
		.map((task) => {
			return {
				...task,
				month: new Date(task.finishedAt).getMonth(),
			};
		})
		.filter((task) => task.completed);

	res.json({
		tasksByWeek,
		allTasks: allTasksWithMonth,
	});
});

app.get("/comparative-weeks", comparativeWeeks);

app.get("/comparative-percentages", async (req, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });
	const { summary } = user;

	const titles = summary[summary.length - 1].summary.map((goal) => goal.title);

	res.json({ titles, summary });
});

app.get("/comparative-weeks-all-time", comparativeWeeeksAllTime);

app.get("/info-ci", async (req, res) => {
	const infoCI = await getRecords();

	const { strongRecords, aerobicRecords, powerRecords, totalCI } = infoCI;

	const names = {
		PRESS_BANCA: "Press banca",
		PRESS_MILITAR: "Press militar",
		PESO_MUERTO: "Peso muerto",
		DOMINADAS: "Dominadas",
		SENTADILLA: "Sentadilla",
	};

	const buildStrongRecords = strongRecords.map((strongRecord) => {
		const { exercise, goal, record, ci } = strongRecord;

		return {
			title: names[exercise],
			total: Math.round(goal * 100) / 100,
			current: record,
			percentaje: Math.round(ci * 100) / 100,
		};
	});

	const buildAerobicRecords = {
		title: "Correr",
		total: 5,
		current: aerobicRecords.record,
		percentaje: aerobicRecords.ci,
	};

	const buildPowerRecord = {
		title: "Sprint",
		total: 15,
		current: powerRecords.record,
		percentaje: Math.round(powerRecords.ci * 100) / 100,
	};

	const allRecords = [...buildStrongRecords];
	allRecords.push(buildPowerRecord);
	allRecords.push(buildAerobicRecords);

	res.json({
		allRecords,
		totalCI,
	});
});

// const mappedNames = {
// 	"Coeficiente Iron (beta)": "CI",
// 	"Peso (beta)": "WEIGHT",
// 	Peso: "WEIGHT",
// 	"Economia (beta) ": "ECONOMY",
// 	"Carrera Laboral": "WORK",
// 	First: "FIRST",
// 	"Cosas de Casa": "HOUSE",
// 	Lectura: "READ",
// 	"Instagram Alfara": "INSTAGRAM_ALFARA",
// 	"App Goal Tracker": "GOAL_TRACKER",
// 	"Coeficiente Iron": "CI",
// 	"Marca Personal": "PERSONAL_BRAND",
// 	"App Coeficiente Iron": "APP_CI",
// 	Deporte: "SPORTS",
// 	"Habilidades Sociales": "HS",
// 	Ingles: "ENGLISH",
// };

const listKW = [
	"aprender a programar",
	"estudiar programacion",
	"estudia programacion",
	"que estudiar para ser programador",
	"estudiar programacion informatica",
	"curso java script",
	"curso de java script",
	"trabajo de programador",
	"curso de programador informatico",
	"curso de programadores",
	"trabajo programador",
	"informatica programador",
	"programador trabajo",
	"trabajar de programador",
	"desarrollo front end",
	"desarrollo frontend",
	"programacion front end",
	"desarrollo web frontend",
	"desarrollador web frontend",
	"desarrollador web curso gratis",
	"tecnologias front end",
	"programador frontend",
	"desarrollador front end",
	"desarrollador frontend",
	"desarrolladores front end",
	"tecnologias front end",
];

app.get("/bulk-seo-text-and-others", async (req, res) => {
	const user = await collection.findOne({
		email: "cem20903@gmail.com",
	});

	listKW.forEach((keyword) => {
		const newTask = {
			title: `[Seo][Texto] ${keyword}`,
			goalName: "PRO_WORK",
			completed: false,
			id: uid(),
			finishedAt: null,
		};

		user.otherGoals.push(newTask);
	});

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, otherGoals: user.otherGoals }
	);

	res.json({});
});

export default app;

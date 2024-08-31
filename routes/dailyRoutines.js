import collection from "../server.js";
import calculateDiary from "../utils/calculateDiary.js";
import express from "express";
import { isToday } from "../utils/dates.js";

const app = express();

app.get("/get-all-diary-2", async (req, res) => {
	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const planificator = [...user.planificator];

	const currentDailyTasks = planificator.find((taskDates) =>
		isToday(taskDates.date)
	);
	if (currentDailyTasks) {
		const goalNames = [
			...new Set(currentDailyTasks.tasks.map((task) => task.goalName)),
		];

		res.json({ tasks: [currentDailyTasks], goalNames: goalNames });
		return;
	}
	const response = calculateDiary(user);
	res.json({ tasks: response.august, goalNames: response.goalNames });
});

app.get("/set-routine", async (req, res) => {
	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const response = calculateDiary(user);

	user.planificator.push(response.august[0]);

	await collection.replaceOne({ email: "cem20903@gmail.com" }, { ...user });

	res.json({ tasks: response.august, goalNames: response.goalNames });
});

app.post("/add-daily-task", async (req, res) => {
	const { task } = req.body;

	let user = await collection.findOne({ email: "cem20903@gmail.com" });

	const planificatorUpdate = user.planificator.map((taskDate) => {
		if (isToday(taskDate.date)) {
			const tasks = [...taskDate.tasks];
			tasks.push(task);
			return { ...taskDate, tasks };
		}
	});

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, planificator: planificatorUpdate }
	);

	res.json({});
});

export default app;

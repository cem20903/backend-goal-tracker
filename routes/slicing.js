import express from "express";
import collection from "../server.js";
import { uid } from "uid";
const app = express();

app.post("/slicing-create-new-task", async (req, res) => {
	const { title, goalName } = req.body;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });
	const { otherGoals } = user;

	otherGoals.push({
		title,
		goalName,
		completed: false,
		id: uid(),
		finishedAt: null,
	});

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, otherGoals }
	);

	const tasksByGoalName = otherGoals.filter(
		(task) => task.goalName === goalName
	);

	res.json(tasksByGoalName);
});

app.post("/slicing-create-new-tag-task", async (req, res) => {
	const { title, goalName, tagName } = req.body;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });
	const { otherGoals } = user;

	otherGoals.push({
		title,
		goalName,
		completed: false,
		id: uid(),
		finishedAt: null,
		tagName,
	});

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, otherGoals }
	);

	const tasksByGoalName = otherGoals.filter(
		(task) => task.goalName === goalName
	);

	res.json(tasksByGoalName);
});

app.get("/slicing-get-goal-tasks", async (req, res) => {
	const { goalName } = req.query;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	const tasksByGoalName = otherGoals.filter(
		(task) => task.goalName === goalName
	);

	res.json(tasksByGoalName);
});

app.get("/slicing-get-tag-goal-tasks", async (req, res) => {
	const { goalName } = req.query;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	const tasksByGoalName = otherGoals
		.filter((task) => task.goalName === goalName)
		.filter((task) => !task.completed);

	const allTags = [
		...new Set(
			tasksByGoalName.map((task) => task.tagName).filter((task) => !!task)
		),
	];

	const tasksSeparateByTags = allTags.map((tagName) => {
		const tasksByTag = tasksByGoalName.filter(
			(task) => task.tagName === tagName
		);

		return {
			tagName,
			tasks: tasksByTag,
		};
	});

	// RECUERDA NO GUARDAR SOLO LOS DE HOUSE QUE BORRARAS EL RESTO
	res.json({ allTags, tasksSeparateByTags });
});

app.delete("/slicing-delete-task", async (req, res) => {
	const { id, goalName } = req.query;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	const tasksWithTaskDeleted = otherGoals.filter((task) => task.id !== id);

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, otherGoals: tasksWithTaskDeleted }
	);

	const tasksByGoalName = tasksWithTaskDeleted.filter(
		(task) => task.goalName === goalName
	);

	res.json(tasksByGoalName);
});

app.post("/slicing-update-tasks", async (req, res) => {
	const { tasks, goalName } = req.body;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	const tasksByGoalName = otherGoals.filter(
		(task) => task.goalName !== goalName
	);

	const tasksWithDate = tasks.map((task) => {
		if (
			(task.completed && task.finishedAt === null) ||
			task.finishedAt === undefined
		) {
			return {
				...task,
				finishedAt: new Date(),
			};
		}

		return task;
	});

	const joinTasks = [...tasksByGoalName, ...tasksWithDate];

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, otherGoals: joinTasks }
	);

	res.json(tasksWithDate);
});

export default app;

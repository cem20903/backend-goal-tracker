import express from "express";
import collection from "../server.js";
import { uid } from "uid";

const app = express();

app.get("/backoffice/tasks", async (req, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	res.json({ otherGoals });
});

app.get("/backoffice/delete", async (req, res) => {
	const { id } = req.query;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	const filterBy = otherGoals.filter((goal) => goal.id !== id);

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, otherGoals: filterBy }
	);

	res.json({ id, filterBy: filterBy.length, otherGoals: otherGoals.length });
});

const task = {
	goalName: "HS_OTHERS",
	completed: false,
	finishedAt: null,
};

app.get("/add-bulk-tasks", async (req, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const { otherGoals } = user;

	// const total = 32;

	// const numbers = Array.from({ length: total }, (_, index) => index + 1);

	// const taskBuilded = numbers.map((number) => {
	// 	return {
	// 		...task,
	// 		title: `[${number}][${total}] Inteligencia emocional y persuasión`,
	// 		id: uid(),
	// 	};
	// });

	const PRO_WORKS_NOT_COMPLETED_TASKS = otherGoals.filter(
		(task) => !(task.goalName === "PRO_WORK" && !task.completed)
	);

	// const joinTasks = [...otherGoals, ...taskBuilded];

	// await collection.replaceOne(
	// 	{ email: "cem20903@gmail.com" },
	// 	{ ...user, otherGoals: PRO_WORKS_NOT_COMPLETED_TASKS }
	// );

	res.json({ PRO_WORKS_NOT_COMPLETED_TASKS });
});

app.get("/backoffice/section", async (req, res) => {
	const { name } = req.query;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const newSections = [...user.sections];

	const filterSections = newSections.filter(
		(section) => section.section === name
	);

	res.json({ sections: filterSections });
});

app.post("/backoffice/create-goal", async (req, res) => {
	const { title, section, type } = req.body;

	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const newSections = [...user.sections];

	const newGoal = {
		title,
		section,
		type,
		goalName: title.toUpperCase().split(" ").join("-"),
	};

	newSections.push(newGoal);

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, sections: newSections }
	);

	res.json({});
});

app.get("/get-task-planificator", async (_, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	res.json({ tasks: user.planificator });
});

app.post("/add-task-planificator", async (req, res) => {
	const { task } = req.body;
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	const copy = [...user.planificator];

	copy.push(task);

	await collection.replaceOne(
		{ email: "cem20903@gmail.com" },
		{ ...user, planificator: copy }
	);
});

export default app;

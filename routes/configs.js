import express from "express";
import collection from "../server.js";

import { uid } from "uid";

const app = express();

app.get("/initial-config", async (req, res) => {
	const user = await collection.findOne({ email: "cem20903@gmail.com" });

	await collection.replaceOne({ email: "cem20903@gmail.com" }, { ...user });
	res.json({ funciona: true });
});

// { path: "/hs", title: "Criticas" },
// { path: "/first", title: "Importantes" },
// { path: "/second", title: "Utiles" },
// { path: "/third", title: "Carrera Laboral" },
// { path: "/likeit", title: "Me gustan" },
// { path: "/house", title: "Casa" },
// { path: "/molonas", title: "Cosas Molonas" },
// { path: "/four", title: "Seguimiento Mensual / Semanal" },
// { path: "/diary", title: "Seguimiento de Habitos" },
// { path: "/panel", title: "Resumen" },
// { path: "/backoffice", title: "Backoffice" },

export default app;

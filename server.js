import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import bodyParser from "body-parser";
import connectDB from "./services/connectDB.js";

import path from "path";
import routes from "./routes/index.js";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

const collection = await connectDB();

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

app.use(express.static(__dirname + "/build"));

app.use("/", routes.books);
app.use("/", routes.english);
app.use("/", routes.goals);
app.use("/", routes.slicing);
app.use("/", routes.summary);
app.use("/", routes.backoffice);
app.use("/", routes.HS);
app.use("/", routes.configs);

app.route(["/mypanel"]).get((req, res) => {
	res.sendFile(path.join(`${__dirname}/dist/index.html`));
});

// Start the server on port configured in .env (recommend port 8000)
app.listen(process.env.PORT, () => {
	console.log(`Servidor en puerto ${process.env.PORT}`);
});

export default collection;

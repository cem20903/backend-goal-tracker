import express from "express";
import cors from 'cors';
import dotenv from "dotenv";

import bodyParser from 'body-parser'
import connectDB from "./services/connectDB.js";

import routes from './routes/index.js'

dotenv.config()
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())


const collection = await connectDB()


app.use('/', routes.books);
app.use('/', routes.english);
app.use('/', routes.goals);
app.use('/', routes.slicing);
app.use('/', routes.summary);


// Start the server on port configured in .env (recommend port 8000)
app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
});


export default collection

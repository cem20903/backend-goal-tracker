
import express from "express";
import collection from '../server.js'
import { formatDate } from "../utils.js";
const app = express();

const baseRecords = [{
  title: 'Estudiar',
  record: 61,
}, {
  title: 'Escuchar',
  record: 2585,

},{
  title: 'Leer',
  record: 519,

},{
  title: 'Escribir',
  record: 7760,

},{
  title: 'Clases',
  record: 99,

}]


app.get('/goals', (req, res) => {


const goals = [
  { title: 'recordsEnglish', data: baseRecords }
]

res.json(goals)

})

export default app

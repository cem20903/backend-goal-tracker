
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

app.get('/diary-tasks', (req, res) => {

const diaryTasks = [
  {
    title: 'Andar 8000 pasos',
    completed: false,
  },
  {
    title: 'Entrenamiento de Fuerza/Correr',
    completed: false,
  },
  {
    title: 'Comido menos de 2400 calorias',
    completed: false,
  },
  {
    title: 'Bajo en Hidratos',
    completed: false,
  },
  {
    title: 'Ceto',
    completed: false,
  },
  {
    title: '0 Alcohol',
    completed: false,
  },
]
 console.log('Llego aqui')
  res.json({ diaryTasks })

})


app.post('/add-tasks', async (req, res) => {

  let { tasks } = req.body
  
  console.log(tasks[0], 'LAS TAREAS ANTES')
  
 tasks = tasks.map(task => {
 
  const date = new Date(task.date)
  
  date.setHours(0, 0, 0, 0)
 
  return {
    ...task,
    date,
  }
 })
 
  console.log(tasks[0], 'LAS TAREAS')

  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { diaryTasks } = usuario
  
  

  if(diaryTasks.length === 0) {
    await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...usuario, diaryTasks: tasks })
    return res.json({})
  }
  
  let existRecord = diaryTasks.filter(task => {
  return new Date(task.date).getTime() === new Date(tasks[0].date).getTime()
  })
  
  
  
  if(!existRecord) {
    const updatedTasks = [...diaryTasks, ...tasks]
    await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...usuario, diaryTasks: updatedTasks })
    return res.json({})
  }
  

  let someChanged = false
  
  let updateTasks = diaryTasks.map(task => {
    const exist = tasks.find(newTask => newTask.title === task.title && new Date(newTask.date).getTime() === new Date(task.date).getTime())
    if(exist) {
      someChanged = true
      return exist
    }
    return task
  })
  
  if(!someChanged) {
  
  tasks.map(task => {
    updateTasks.push(task)
  })
  
  
  }
  
    await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...usuario, diaryTasks: updateTasks })
    return res.json({})

  
  

  })

export default app


import express from "express";
import collection from '../server.js'
import { uid } from 'uid';
const app = express();


app.post('/slicing-create-new-task', async (req, res) => {

  const { title, goalName } = req.body
  
  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
   const { otherGoals } = user
   
   otherGoals.push({ title, goalName, completed: false, id: uid(), finishedAt: null })

   await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, otherGoals })
   
   const tasksByGoalName = otherGoals.filter(task => task.goalName === goalName)
   
   res.json(tasksByGoalName)

})


app.get('/slicing-get-goal-tasks', async (req, res) => {

  const { goalName } = req.query

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });

  const { otherGoals } = user

  const tasksByGoalName = otherGoals.filter(task => task.goalName === goalName)

  res.json(tasksByGoalName)

})

// app.post('/slicing-create-new-goal', async (req, res) => {

//   let { task, name } = req.body

// })



export default app

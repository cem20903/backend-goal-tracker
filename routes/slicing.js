
import express from "express";
import collection from '../server.js'
import { formatDate } from "../utils.js";
const app = express();


app.post('/slicing-create-new-task', async (req, res) => {

  let { task, name } = req.body
  
  // task = { title: 'Bajar montaña', completed: true, finishedAt: new Date() }

  const usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals } = usuario

  const slicingToUpdate = otherGoals.find(goal => goal.name === name)
  
  const updateGoals = [...slicingToUpdate, task]
  
  const updateAllGoals = otherGoals.map(goal => {
    if(goal.name === name) {
      return updateGoals
    }
    return goal
  })
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...usuario, otherGoals: updateAllGoals })

})


app.post('/slicing-update-goal', async (req, res) => {

})

// app.post('/slicing-create-new-goal', async (req, res) => {

//   let { task, name } = req.body

// })

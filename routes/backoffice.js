
import express from "express";
import collection from '../server.js'

const app = express();


app.get('/backoffice/tasks', async (req, res) => {


  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals } = user
  
  res.json({otherGoals})
})

app.get('/backoffice/delete', async (req, res) => {

const { id } = req.query


  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const { otherGoals } = user
  
  
  const filterBy = otherGoals.filter(goal => goal.id !== id)
  
  
  await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...user, otherGoals: filterBy })
  
  res.json({ id, filterBy: filterBy.length, otherGoals: otherGoals.length })

})



export default app


import express from "express";
import collection from '../server.js'

const app = express();


app.get('/clean-books', async (req, res) => {

  const user = await collection.findOne({ email: 'cem20903@gmail.com' });
  

})



export default app

import express from "express";
import cors from 'cors';
import dotenv from "dotenv";

import bodyParser from 'body-parser'
import {MongoClient} from 'mongodb'
// Get environment variables
dotenv.config()

// Create the express server and configure it to use json
const app = express();

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(express.json());

// Configure cors policy
app.use(cors())

// Set up a API call with GET method



// 2023-10-02 --> YEAR-MM-DD

async function connectDB () {
  const mongoURL = process.env.BBDD

  // The MongoClient is the object that references the connection to our
  // datastore (Atlas, for example)
  const client = new MongoClient(mongoURL);

  // The connect() method does not attempt a connection; instead it instructs
  // the driver to connect using the settings provided when a connection
  // is required.
  await client.connect();

  // Provide the name of the database and collection you want to use.
  // If the database and/or collection do not exist, the driver and Atlas
  // will create them automatically when you first write data.
  const dbName = "goalTracker";
  const collectionName = "goalTracker";

  // Create references to the database and collection in order to run
  // operations on them.
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  return collection
}

const collection = await connectDB()

//  const cursor = await collection.find()
 


//  for await (const doc of cursor) {
//   console.dir(doc);
// }



  
const example = [
  { title: 'Inspired', total: 394, current: 200, date: '29-10-2023' },
  { title: 'El poder Del Ahora', total: 394, current: 221, date: '29-10-2023' },
  { title: 'Inspired', total: 394, current: 100, date: '28-10-2023' },
]  



function formatDate(currentDate) {
const date = new Date(currentDate)
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

app.get('/books', async (req, res) => {

  console.log('START GET BOOKS')

  const { date } = req.query
  

  console.log('Get Books')
  
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });

  console.log('Mando', usuario.books)

  res.json(usuario.books)
})

app.post('/new-book', async (req, res) => {

  console.log('STRAT ADD BOOK')
 
 const { title, total, date } = req.body
 
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfUser = {...usuario, books: [...usuario.books]}
  
  copyOfUser.books.push({ title, total, current: 0, date: formatDate(date) })
  
  const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, copyOfUser)
  
  
  // example.push({ title, total, current: 0, date: formatDate(date) })
  // if(bookWithThisDate) {  
  //   // Reemplazaremos el valor
  // } else {
    
  // }

  
  console.log('Add Book')
    
  res.json(result)
})

app.post('/books', (req, res) => {
  // Return some sample data as the response
  
  const frontend = {
    date: '01-01-2023',
    value: [
      { name: 'Inspired', total: 394, current: 250 },
      { name: 'El poder Del Ahora', total: 394, current: 299 }
    ]
  }
    
  // Recupero de la BBDD
  const copyOf = {...example}
  
  copyOf[frontend.date] = frontend.value
  
  
  // Devuelvo el objeto actualizado
  res.json(example);
});

// Start the server on port configured in .env (recommend port 8000)
app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
});

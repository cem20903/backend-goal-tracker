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

function formatDate(currentDate) {
const date = new Date(currentDate)
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

// aqui pido libros y deberia mostrar todos si no hay en el fecha actual
app.get('/books', async (req, res) => {

  console.log('START GET BOOKS')

  const { date } = req.query
  

  console.log('Get Books')
  
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  

  const copyOfBooks = [...usuario.books]

    
  const objetoUnico = {}; // Objeto auxiliar para realizar un seguimiento de títulos únicos
  const arraySinDuplicados = usuario.books.filter(obj => {
  const title = obj.title;
  if (!objetoUnico[title]) {
    objetoUnico[title] = true;
    return true; // Mantén el objeto si es la primera vez que se encuentra
  }
  return false; // Descarta el objeto si ya se encontró antes
});
  
  
  const booksFiltered = usuario.books.filter(book => {
    return book.date === formatDate(date)
  })
  

  const response = []
  
   copyOfBooks.forEach(book => {
    
   
    if(book.date === formatDate(date)) {
      response.push(book)
    }
  
  })
  
  // para mañana ERROR, mas adelante quiza
  
  const getBooksTodayFirstTime = formatDate(date) === formatDate(new Date()) && response.length === 0
  
  
  if(getBooksTodayFirstTime) {
    
  res.json(usuario.booksUpdated)
  
  return
  
  
  }
  console.log(usuario.booksUpdated.length, booksFiltered.length, 'LONGITUDES')
  if(usuario.booksUpdated.length > booksFiltered.length) {
    
    const buildBooks = usuario.booksUpdated.map(book => {
      
      const findBook = booksFiltered.find(currentBook => currentBook.title === book.title)
      
      if(findBook) {
        return findBook
      } else {
        return book
      }
    
    })
    console.log(buildBooks, 'DEVUELVO ESTO')
      res.json(buildBooks)
      return
    }
    

  console.log('AQUI ENTRA', booksFiltered)
  res.json(booksFiltered)
})

app.post('/new-book', async (req, res) => {
 
 const { title, total, date } = req.body
 
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  
  const newBook = { title, total, current: 0, date: formatDate(date) }
  
  const copyOfUser = {...usuario, books: [...usuario.books], booksUpdaded: [...usuario.booksUpdated, newBook]}
  copyOfUser.books.push(newBook)
  
  const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, copyOfUser)
      
  res.json(result)
})


app.post('/all-books', async (req, res) => {
  // Return some sample data as the response
  const { allBooks } = req.body
  
   
  let usuario = await collection.findOne({ email: 'cem20903@gmail.com' });
  
  const copyOfUser = {...usuario}
  
    
  const updateBooksFormated = allBooks.map(book => {
    return {...book, date: formatDate(book.date)}
  })
  
  
  let currentBooks = [...copyOfUser.books]
  
  
  // ACTUALIZO CON LAS FECHAS QUE YA EXISTEN
  currentBooks = currentBooks.map(currentBook => {
  
  const findBookWithSameDate = updateBooksFormated.find(newBook => {
    const { title, date } = newBook
    return currentBook.title === title && currentBook.date === date
  })
  
  if(findBookWithSameDate) {
    return findBookWithSameDate
  }
  
  return currentBook
  
  })
  
  
  updateBooksFormated.forEach(newBook => {
  
  const { title, date } = newBook
  

  const bookWithDifferentDate = currentBooks.find(currentBook => {
    return currentBook.title === title && currentBook.date === date
  })
  
  if(bookWithDifferentDate) {
    return
  } else {
    currentBooks.push(newBook)
  }
   
  
  
  })
  
  
  // AQUI QUIERO ACTUALIZAR booksUpdaded
  // updateBooksFormated --> Los libros que me manda el front
  

  
    
  const result = await collection.replaceOne({ email: 'cem20903@gmail.com' }, {...copyOfUser, books: currentBooks })

    
  // Recupero de la BBDD

  
  
  // Devuelvo el objeto actualizado
  res.json({});
});

// Start the server on port configured in .env (recommend port 8000)
app.listen(process.env.PORT, () => {
  console.log(`SERVER IS RUNNING AT PORT ${process.env.PORT}`);
});

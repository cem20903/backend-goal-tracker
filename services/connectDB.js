
import { MongoClient } from 'mongodb'

export default async function connectDB () {
  const mongoURL = process.env.BBDD
  const client = new MongoClient(mongoURL);
  await client.connect();
  const dbName = "goalTracker";
  const collectionName = "goalTracker";
  const database = client.db(dbName);
  const collection = database.collection(collectionName);
  return collection
}

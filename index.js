const express = require('express')
const app = express()
const { MongoClient, ServerApiVersion, ObjectId} = require('mongodb');

const cors = require('cors')
require('dotenv').config()
const port = 3000

// middleware
app.use(
  cors({
    origin: ["http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://pc-doctor-23d5f.web.app",
      "https://pc-doctor-23d5f.firebaseapp.com"
    ],
    credentials: true,
  })
);
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ts8x6gb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // service
    const servicesCollection = client.db('pc-doctor').collection('services')
    const bookingCollection = client.db('pc-doctor').collection('booking')
    const usersCollection = client.db('pc-doctor').collection('users')


    // services
    app.get('/allservices', async(req, res) =>{
      const resul = await servicesCollection.find().toArray();

      res.send(resul)
    })

    // Search contest based on Type/Tag
    app.get("/service/search/:text", async (req, res) => {
      const text = req.params.text;

      try {
        const searchResults = await servicesCollection
          .find({ service_name: { $regex: text, $options: "i" } })
         
          .toArray();
        res.json(searchResults);
      } catch (error) {
        res.status(500).json({ error: "Internal server error" });
      }
    });
    // single service
    app.get('/service/:id', async(req, res) =>{
    
      const resul = await servicesCollection.findOne({_id: new ObjectId(req.params.id)});

      res.send(resul)
    })
    
    app.post('/service', async (req, res) =>{
      const serviceData = req.body
        const result = await servicesCollection.insertOne(serviceData);
        res.send(result)
      })
      app.put('/updateservice/:id', async (req, res) => {
        const id = req.params.id;
        const serviceData = req.body;
        const query = { _id: new ObjectId(id) };
        const data = {
          $set:{
            ...serviceData
          }
        }
        const result = await servicesCollection.updateOne(query, data)
        res.send(result)
          })

          app.get("/topprovider3", async (req, res) => {
            try {
              const result = await usersCollection
                .find()
                .sort({ createCount: -1 })
                .limit(3)
                .toArray();
              res.send(result);
            } catch (error) {
              res.status(500).json({ error: "Failed to fetch and sort service" });
            }
          });
          // createCount
          app.patch('/createCount', async (req, res) => {
            const userEmail = req.body
            const query = { email: userEmail.email };
            const user = await usersCollection.findOne(query);
            let newCreateCount = parseFloat(user?.createCount);
            newCreateCount++;
            const data = {
              $set:{
                createCount:newCreateCount
              }
            }
            const result = await usersCollection.updateOne(query, data)
            console.log(result)
            res.send(result)
        })
          app.get("/populerservices6", async (req, res) => {
            try {
              const result = await servicesCollection
                .find()
                .sort({ bookingCount: -1 })
                .limit(6)
                .toArray();
              res.send(result);
            } catch (error) {
              res.status(500).json({ error: "Failed to fetch and sort data" });
            }
          });
          app.patch('/bookingCount/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const servic = await servicesCollection.findOne(query);
            let newBookingCount = parseFloat(servic?.bookingCount);
            newBookingCount++;
            const data = {
              $set:{
                bookingCount:newBookingCount
              }
            }
            const result = await servicesCollection.updateOne(query, data)
            console.log(result)
            res.send(result)
              })
      app.get('/manageservices/:email', async (req, res) => {
        const email = req.params.email
        const query = { 'providerEmail': email }
        const result = await servicesCollection.find(query).toArray()
        res.send(result)
      })
      app.delete('/deleteservice/:id', async(req, res)=>{
        const id = req.params.id;
        console.log(id)
        const query = {_id: new ObjectId(id)}
        const result = await servicesCollection.deleteOne(query);
        console.log(result)
        res.send(result)
      })
      // bookingServices
      app.post('/bookedservice', async (req, res) =>{
          const serviceData = req.body
          const result = await bookingCollection.insertOne(serviceData);
          res.send(result)
        })
        app.patch('/bookedservice/:id', async (req, res) => {
          const id = req.params.id;
          const status = req.body.status;
          const query = { _id: new ObjectId(id) };
          const data = {
            $set:{
              status:status
            }
          }
          const result = await bookingCollection.updateOne(query, data)
          console.log(result)
          res.send(result)
            })
        app.get('/mybookedservices/:email', async (req, res) => {
          const email = req.params.email
          const query = { 'userEmail': email }
          const result = await bookingCollection.find(query).toArray()
          res.send(result)
        })
        app.get('/servicestodo/:email', async (req, res) => {
          const email = req.params.email
          const query = { 'providerEmail': email }
          const result = await bookingCollection.find(query).toArray()
          res.send(result)
        })
    // user
    app.post('/signup', async (req, res) => {
      const userData = req.body
      const query = { email: userData.email };
      const existingUser = await usersCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exists", insertedId: null });
      }
      const result = await usersCollection.insertOne(userData)
      res.send(result)
    })

    
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
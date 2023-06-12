const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


//--------------
app.use(cors());
app.use(express.json());


//database

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.crdo9tm.mongodb.net/?retryWrites=true&w=majority`;

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
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const teacherCollection = client.db("SummerCamp").collection("instractor");
    const userCollection = client.db("SummerCamp").collection("users");

    const classCollection = client.db("SummerCamp").collection("classes");

    // All users  Api add to db
    app.post('/users', async(req, res) =>{
      const user = req.body;
      // console.log(user);
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

// add class to database
    app.post('/classes', async(req, res) =>{
      const user = req.body;
      const result = await classCollection.insertOne(user);
      res.send(result);
    })

    // get add classes
    app.get('/classes/allClasses', async(req, res) =>{
      const result = await classCollection.find().toArray();
      res.send(result);
    })

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.get('/classes', async(req, res) =>{
      const result = await classCollection.find().toArray();
      res.send(result);
    }) 


    //instructor from all users
    app.get('/instractor', async(req, res) =>{
      
      const query = {role: 'Instructor'};
      const result = await userCollection.find(query).toArray();
      res.send(result);
  })

// a single teacher added all class.
  app.get('/classes/:email', async(req, res) =>{
    const email = req.params.email;
    const query = {instructorEmail: email}
    const result = await classCollection.find(query).toArray();
    res.send(result);
  })

    // get admin or user
    app.get('/users/:email', async(req, res) =>{
      const email = req.params.email;
      const query = {email: email}
      const result = await userCollection.findOne(query);
      res.send(result)
    })

    app.delete('/users/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);

    })


    // Update user role
    app.patch('/users/admin/:id', async (req, res) =>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'admin'
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.patch('/users/instructor/:id', async (req, res) =>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          role: 'Instructor'
        },
      };
      const result = await userCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    // approve or denied class 
    app.patch('/classes/approve/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          status: 'Approved'
        },
      }
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);
    })

    app.patch('/classes/denied/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updateDoc = {
        $set: {
          status: 'Denied'
        },
      }
      const result = await classCollection.updateOne(filter, updateDoc);
      res.send(result);
    })


    // instructor api 
    app.get('/instractorHome', async(req, res) =>{
        const result = await teacherCollection.find().limit(6).toArray();
        res.send(result);
    })

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
    res.send('summer Camp running')
})


app.listen(port,()=>{
    console.log(`surver is running on port ${port}`)
})
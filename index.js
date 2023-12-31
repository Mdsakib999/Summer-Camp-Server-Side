const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const stripe = require('stripe')(process.env.PAYMENT_KEY);
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
    

    // const teacherCollection = client.db("SummerCamp").collection("instractor");

    const userCollection = client.db("SummerCamp").collection("users");

    const classCollection = client.db("SummerCamp").collection("classes");
    const selectedClassCollection = client.db("SummerCamp").collection("selectedClasses");
    const paymentCollection = client.db("SummerCamp").collection("payments");


    // All users  Api add to db
    app.post('/users', async(req, res) =>{
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if(existingUser){

        return res.send({ message: "user already existed" })
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    })

// add class to database
    app.post('/classes', async(req, res) =>{
      const user = req.body;
      const result = await classCollection.insertOne(user);
      res.send(result);
    })
    

    // add selected class
    app.post('/selectedClass', async(req, res) =>{
      const user = req.body;
      const result = await selectedClassCollection.insertOne(user);
      res.send(result);
    })

    // get add classes
    app.get('/classes/allClasses', async(req, res) =>{
      const query = {status: 'Approved'}
      const result = await classCollection.find(query).toArray();
      res.send(result);
    })


    app.get('/homeClasses', async(req, res) =>{
      const query = {status: 'Approved'}
      const result = await classCollection.find(query).limit(6).toArray();
      res.send(result);
    })

    app.get('/users', async(req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    })

    app.get('/studentSelectedClasses/:email', async(req, res) =>{
      const email = req.params.email;
    const query = {studentEmail: email}
    const result = await selectedClassCollection.find(query).toArray();
    res.send(result);
    })

    // student enrolled details
    app.get('/enrolledDetails/:email', async(req, res) =>{
      const email = req.params.email;
    const query = {email: email}
    const result = await paymentCollection.find(query).toArray();
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

  // instructor api 
  app.get('/instractorHome', async(req, res) =>{
    const query = {role: 'Instructor'};
    const result = await userCollection.find(query).limit(6).toArray();
    res.send(result);
})



// a single teacher added all class in his id.
  app.get('/classes/:email', async(req, res) =>{
    const email = req.params.email;
    const query = {instructorEmail: email}
    const result = await classCollection.find(query).toArray();
    res.send(result);
  })
  

  // single teacher all class in home page
  app.get('/teacherClass/:email', async(req, res) =>{
    const id = req.params.email;
    const user = await userCollection.findOne({_id: new ObjectId(id)})
    
    const query = {instructorEmail: user.email};
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


    app.get('/currentUser/:email', async(req,res) =>{
      const email = req.params.email;
      const query = {email: email}
      const result = await userCollection.findOne(query).toArray();
      res.send(result)
    })

    app.get('/allClasser/:email', async(req, res) =>{
      const email = req.params.email;
      const query = {email: email}
      const result = await userCollection.findOne(query);
      res.send(result)
    })

    // delete from all user
    app.delete('/users/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await userCollection.deleteOne(query);
      res.send(result);

    })


    // delete student selected class
    app.delete('/selectClass/:id', async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await selectedClassCollection.deleteOne(query);
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


    // payment  // const price = req.params.price

    app.post('/create-payment-intent', async(req, res) =>{
      const {price} = req.body
      const amount = price*100;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']

      });
      res.send({
        clientSecret: paymentIntent.client_secret
      })
    })


    app.post('/payments', async(req, res)=>{
      const payment = req.body;
      const result =await paymentCollection.insertOne(payment);
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
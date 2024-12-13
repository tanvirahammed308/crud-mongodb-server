const express = require('express')
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const  cors = require('cors')
const app = express()
const port =process.env.PORT ||  3000;


app.use(cors());
app.use(express.json())




// ---------------mongodb-----------------------------------------


 
const uri = `mongodb+srv://${process.env.USER_NAME}:${process.env.USER_PASS}@cluster0.op8slep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    const coffeeDB = client.db("coffeeDB");
    const coffeeCollection= coffeeDB.collection("coffees");
    
    const userCollection= coffeeDB.collection("users")

    app.get('/coffees', async(req, res) => {

      const cursor = coffeeCollection.find();
      const result=await cursor.toArray()
      res.send(result)
    })

    app.post('/coffees', async(req, res) => {
      const coffee=req.body;
       const updateCoffee = {
     name:coffee.name,
     amount:coffee.amount,
     price:coffee.price,
     photo:coffee.photo
    }

      const result = await coffeeCollection.insertOne(updateCoffee);
      res.send(result)
    })

    app.get('/coffees/:id', async(req, res) => {
      const id=req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.findOne(query);

      res.send(result)
    })

    

    app.delete('/coffees/:id', async(req, res) => {
      const id=req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffeeCollection.deleteOne(query);

      res.send(result)
    })



    app.put('/coffees/:id', async(req, res) => {
      const id=req.params.id;
      const coffee=req.body
      
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

      
      const updateCoffee = {
        $set: {
          name:coffee.name,
        amount:coffee.amount,
        price:coffee.price,
        photo:coffee.photo
         
        },
      };
    
      const result = await coffeeCollection.updateOne(filter, updateCoffee, options);



      res.send(result)
    });

    // ---------------------user api --------------------------

    app.get('/users', async(req, res) => {
      const cursor = userCollection.find();
      const result=await cursor.toArray()
  res.send(result)
})

app.post('/users', async(req, res) => {
  const user=req.body;
  console.log(user);
 const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({message:"user is already exist"})
      }

  
      const result = await userCollection.insertOne(user);
  res.send(result)
})

app.delete('/users/:id', async(req, res) => {
  const id=req.params.id;
    const query = { _id: new ObjectId(id) };
        const result = await userCollection.deleteOne(query);

  res.send(result)
})


app.patch('/users', async(req, res) => {
  const user=req.body;
      const filter = { email: user.email };

       const updateDoc = {
      $set: {
        lastSignInTime: user.lastSignInTime
      },
    };
    const result = await userCollection.updateOne(filter, updateDoc);


  res.send(result)
})






    // ------------------------------------user api end-----------------




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);





// -----------------mongodb-end----------------------------------





app.get('/', (req, res) => {
  res.send('welcome to coffee server')
})

app.listen(port, () => {
  console.log(`Coffee server  app is listening on port ${port}`)
})

const express = require('express')
require('dotenv').config()
var jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const cors = require('cors');
const port = process.env.PORT || 3000;
app.use(express.json());
app.use(cors());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.2m0rny5.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
const servicesCollection = client.db('dentalCare').collection('services');
const reviewsCollection = client.db('dentalCare').collection('reviews');
const contactsCollection = client.db('dentalCare').collection('contact');
const verifyJWT = (req, res, next) => {
  const authorization = req.headers.authorization
  if(!authorization) {
    res.status(401).send({error: true, message: 'Unauthorized access'})
  }
  const token = authorization.split(' ')[1]
  jwt.verify(token, process.env.token, (error, decode) => {
    if(error) {
      res.status(402).send({error: true, message: 'Unauthorized access'})
    }
    req.decode = decode
    next()
  })
}
async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
     client.connect();
    // add services
    app.post('/services', async(req, res) => {
      const query = req.body 
      const result = await servicesCollection.insertOne(query);
      res.send(result)
    })
    // get services from the database
    app.get('/services', async (req, res) => {
        const service = await servicesCollection.find().toArray()
        res.send(service);
    })
    // get details from the database services
    app.get('/services/:id', async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const service = await servicesCollection.findOne(query)
      res.send(service)
    })
    // add reviews 
    app.post('/reviews', async (req, res) => {
      const query = req.body
      const result = await reviewsCollection.insertOne(query)
      res.send(result)
    })
    // // get reviews
    // app.get('/reviews/:serviceId', async (req, res) => {
    //   const serviceId = req.params.serviceId 
    //   const cursor = {serviceId: (serviceId)}
    //   console.log(cursor)
    //   let query = {}
    //   if(req.query?.email) {
    //     query = {email: req.query.email}
    //   }
    //    const result = await reviewsCollection.find(query,cursor).toArray()
    //    res.send(result)
    // })
    // get all reviews
    app.get('/reviews',verifyJWT, async (req, res) => {
      let query = {}
      if(req.query?.email) {
        query = {email: req.query.email}
      }
      const result = await reviewsCollection.find(query).toArray()
       res.send(result)
    })
    // get single review
    app.get('/reviews', async (req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      
      console.log(query)
      const result = await reviewsCollection.findOne(query)
      res.send(result)
    })
    // reviews delete from reviews collection
    app.delete('/reviews/:id', async (req, res) => {
      const  id = req.params.id
      const query = {_id: new ObjectId(id)}
      const result = await reviewsCollection.deleteOne(query)
      res.send(result)
    })
    // update the review comments
    app.put('/reviews/:id', async(req, res) => {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updatedComment = req.body
      const update = {
        $set: {
          comment: updatedComment.comment
        }
      }
      const result = await reviewsCollection.updateOne(query, update, options)
      res.send(result)
    })
    // post contact us database
    app.post('/contact', async (req, res) => {
      const query = req.body
      const result = await contactsCollection.insertOne(query)
      res.send(result)
    })
    // jwt process
    app.post('/jwt', (req, res) => {
      const user = req.body 
      const token = jwt.sign(user, process.env.token,{
        expiresIn: '1h'
      })
      res.send({token})
    })
    // Send a ping to confirm a successful connection
     client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);







app.get('/', (req, res) => {
    res.send('Welcome the server running');
});

app.listen(port , () => {
    console.log(`Listen on ${port}`);
})
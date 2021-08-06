const express = require('express')
const app = express();
const cors = require('cors');
// const fs = require('fs-extra');
const bodyParser = require('body-parser');
// const MongoClient = require('mongodb').MongoClient;
const jwt = require('jsonwebtoken')
const {
  MongoClient
} = require('mongodb');
// const fileUpload =require('express-fileUpload');
const {
  ObjectId
} = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(bodyParser.json());

app.use(express.static('doctors')); //doctors folder e rakhbo tai ekhane doctors likhechi
// app.use(fileUpload());

app.get('/', (req, res) => {
  res.send('Hello World!')
})







const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.stbya.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
client.connect(err => {
  const userCollection = client.db(`${process.env.DB_NAME}`).collection("users");
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection("admin");


  //add user
  app.post("/addUser", (req, res) => {
    const newInfo = req.body;
    userCollection.insertOne(newInfo)
      .then(result => {
        res.send(result.insertedCount > 0)
      })
  })


  // get users
  app.get('/users', (req, res) => {
    userCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });




  //delete user
  app.delete('/deleteUser/:id', (req, res) => {
    const id = ObjectId(req.params.id);
    userCollection.deleteOne({
        _id: id
      })
      .then(documents => {
        console.log(documents);
        res.send(documents.deletedCount > 0);
      })
  })




  // get admin
  app.get('/admin', (req, res) => {
    adminCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  });

  //To see admin or not
  // app.post('/isAdmin', (req,res)=> {
  //   const email = req.body.email;
  //   adminCollection.find({ email : email })
  //   .toArray((err,doctors) =>{
  //     res.send(doctors.length > 0);
  //   })
  // })

  app.post("/login", async (req, res) => {
    try{
    const email = req.body.email;
    const password = req.body.password;
    // console.log(email,password);
    const user = await adminCollection.findOne({
      email: email
    });



    // console.log("user",user);
    // console.log("Emailll",email);
    // console.log("user[0]",user[0]);
    // console.log("user.password",user.password);
    console.log("user._id",user._id);
    // console.log(user.length);
    // if (user && user.length > 0) {
    if (user) {
      console.log("okkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk user is",user)
      const isValidPassword = await adminCollection.findOne({
        // password: user[0].password
        password:password,
      });
      if (isValidPassword) {
        console.log("valid pasa");
          //generate token
          const token = jwt.sign({
            email: user.email,
            userId: user._id,
          }, process.env.JWT_SECRET_KEY, {
              expiresIn: '1000'
              // expiresIn: '1h'
          })
console.log("token: " + token);
// sessionStorage.setItem(token);
// var getsession = window.sessionStorage.getItem(token);
// 	console.log(getsession);

          res.status(200).json({
            "access_token":token,
            "message": "Login successfull !"
          })
      } else {
        res.status(401).json({
          "error": "Authentication failed"
        })
      }
    } else {
      res.status(401).json({
        "error": "Authentication failed"
      })
    }
  }catch{
    res.status(401).json({
      "error": "Authentication failed"
    })
  }
    
  })





});


app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})
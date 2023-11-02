## server setup

```js
const express = require('express'); //import express
const app = express(); //invoke express in app
const PORT = 5000 || process.env.PORT;
const start = async () => {
  //make a start fn
  try {
    app.listen(PORT, () => console.log('app listening to port 5000'));
  } catch (error) {
    console.log(error);
  }
};
start();
```

## connectDB url

```js
/.env
MONGO_URL=...connection string from DBatlas

require('dotenv').config()//to access the env variables values
 //make a start fn
 const mongoose = require('mongoose')
 const connectDB = require('./db/connect')||mongoose.connect(url)
  try {
    await connectDB(preocess.env.MONGO_URL)// returns promise so need await
    app.listen(PORT, () => console.log('app listening to port 5000'));

```

## basic routes and middleware

```js
require('express-async-errors'); // trycatch can be avoided

//middleware
const notforundmiddleware = require('./middleware/notforundmiddleware');
const errorHandleMiddleware = require('./middleware/errorHandleMiddleware');
app.use(notforundmiddleware); //404
app.use(errorHandleMiddleware); //validation,duplicateentry,casterror-mongoose,express error

app.use(express.json()); //to read the json content from the body

//basic route with express-async-middleware
app.get('/', (req, res) => {
  res.send('hello 5001');
});
//basic route without express-async-middleware
app.get('/', (req, res) => {
  try {
    res.send('hello 5001');
  } catch (error) {
    console(error);
  }
});
```

## why we palce 404 before the errorhandle middleware

```js
app.get('/', (req, res) => {
  throw new error('hello there');
  res.send('hello 5001');
});

app.use(notforundmiddleware); //404
app.use(errorHandleMiddleware); //this error handles the  error send / we set error in the get router
```

## morgan

```js
app.use(morgan('tiny')); // will give the req details in cmdline
```

## user model and mongoose scheema

```js

const mongoose = require('mongoose')
const UserSchema =new  mongoose.Schema({
name:{
  type:String||number etc...
  required:[true,'please provide email']
  minlenght:3,
  maxlength:6
  enum:['admin','user']//Restricting Allowed Values:it restricts the "name" field to only accept values that are either "admin" or "user." Any other value would be considered invalid.
}
})
```

## use validator package or match in the schema for validation

```js
const UserSchema =new  mongoose.Schema({
name:{
  type:String||number etc...
  unique: true,

//with validator package
  validate:{
  validator:validator.isEmail
   message: 'Please Provide Valid Email' //alternative for match and require
  }

//without validator package
  required:[true,'please provide email']
 validate:{
  match: [/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'please provide required email'],
}
}
})

```

### auth route structure

- controller - authController - login,logout,register
- give the controller to the router

```js controller
const regisdter = async (req, res) => {
  res.senc('hello register');
};
module.export = { regisdter };
```

```js router
cosnt express= required('express')
const router = express.Router();
const {login,logout,register}=require('../controller/authControler')
router.post('/login',login)
router.post('/register',register)
router.get('/logout',logout)
module.exports = router
```

- app - first import the router before the import of the middleware
- use that imported route just before the 404&errorhandle middlewere

```js
const authroute = require('../route/authroute');
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
app.use('/api/v1/auth', authroute);
app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);
```

### test route in the thuder client

### register controller

- to create a register user give await inside the async fn in the controller and the json data from the body is converted into obj as we use app.use(express.json()); in the app

```js
app.use(express.json());
app.use('/api/v1/auth', authRouter);
const register = async () => {
  const user = await User.create(req.body); //creqte data
  res.status(StatusCodes.CREATED).json({ user });
};
```

## register unique email

- for unique email create unique key word in scheema
- if not throw new error badreq error401

## make first entry user as admin and other user as user -> role

```js
const register = async (req, res) => {
  //destrucrte these details from the input form
  const { name, email, password } = req.body;
  // detect the first occurence
  const isFirstUser = await User.countDocument({})===0
  //wether then first occurence is empty then admin
  const role = isFirstuser?"admin":"user"
  //create the user database
  const user = await User.create({ name, email, password,role})
```

## handle password

- before we save the document/data from server to DB we must hash the password

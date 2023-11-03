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

```js chatgpt genral hash and compare
const bcrypt = require('bcrypt');
const saltRounds = 10; // You can adjust the number of salt rounds as needed.

// Sample: Hash a password
const plainTextPassword = 'mySecretPassword';
bcrypt.hash(plainTextPassword, saltRounds, (err, hash) => {
  if (err) {
    console.error('Error hashing the password:', err);
  } else {
    // Store the 'hash' in your database.
    console.log('Hashed Password:', hash);

    // Sample: Compare a hashed password with a plaintext password
    const storedHash = hash; // Retrieve the hashed password from your database.

    const loginPassword = 'mySecretPassword'; // The plaintext password provided during login.

    bcrypt.compare(loginPassword, storedHash, (err, result) => {
      if (err) {
        console.error('Error comparing passwords:', err);
      } else {
        if (result) {
          console.log('Password matches. Authentication successful.');
        } else {
          console.log('Password does not match. Authentication failed.');
        }
      }
    });
  }
});
```

- hashing is the oneway strak once we hashed a password while registering then the only way to compare it by re-entering the same password while login and compare it

### jwt

- in response we send the token to the client and from the client the user will send back the token with barer in the head authorization
- after getting the token from the client server send back the respective client id data
- (jwt authorize)[https://www.section.io/engineering-education/how-to-build-authentication-api-with-jwt-token-in-nodejs/]

- create token in the register user
- use the created user credentials for the token

```js
const jwt = require('jsonwebtoken');
const register = async (req, res) => {
  const user = await User.create({ name, email, password, role });
  //chek unique emial in schema and fn
  //check role for first occurence 'admin'
  //hash password while registering, do the pre in mongoose in scheema
  //create token details from the user
  const tokenUser = { name: user.name, userId: user._id, role: user.role };
  //pass the jwtsecrect along with the created token details in register
  const token = jwt.sign(tokenuser, 'jwtSecret', { expiresIn: '1d' });
  res.status(200).json({ user: tokenUser, token });
};
```

### cookie

- we can store the jwt token in the cookies instead of storing that in the response and browsers local storage
- express has res.cookies() method to store the cookies in the local storage.

```js
  const oneDay = 1000 * 60 * 60 * 24;
res.cookie('token',token,{
  httponly:true//to secure from xss,crossbrowser attack
  expires: new Date(Date.now()+oneDay),
  //in production send the cookie through https
  //and normally in dev send the cookie through http only
  secure:process.env.NODE_ENV === 'production'
  signed:true,
})
```

- each and every time the requeat from the browser will get the res from the server by using cookies.
- ajax method isninvolved in the cookies process
- so without reloading the browser, client will get the cookies associated with jwt from the server

### refactor cookie

```js
attchcokies fn will attach the cookie with the jwt token and along with the res from the register
```

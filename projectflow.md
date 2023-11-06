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
- once we send the jwt token in the cookie with res, for each req to that specific route the browser brings back the cookies from the request

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

- In summary, app.use(cookieParser()); is used to parse and extract cookies from incoming requests on the server. To send cookies to the browser in the response, you use the res.cookie() method with the appropriate options, including the signed option if you want to use signed cookies. Once the browser stores the cookie, it will automatically include it in subsequent requests, and the server can then use cookieParser() with the provided secret key to verify and extract the cookies in each request.

### session storage cookies

A session is a mechanism for maintaining state and managing user data between multiple HTTP requests in a web application. It allows you to keep track of a user's interactions with your application across different pages and requests. Sessions are an essential concept for building stateful web applications.

Key characteristics of sessions include:

1. **Stateful**: Sessions make web applications stateful, meaning they can remember data about a user between different interactions or requests.

2. **Temporary**: Sessions are temporary and have a limited lifetime. They can expire after a certain period of inactivity or when the user logs out.

3. **Unique Identifier**: A session is usually associated with a unique identifier (session ID) that is generated and stored as a cookie in the user's browser. This ID is used to link subsequent requests to the same session.

4. **Data Storage**: User-specific data is stored on the server and associated with the session ID. This data can include user authentication information, user preferences, shopping cart contents, or any other information relevant to the user's session.

5. **Security**: Sessions can be more secure than storing data in cookies directly because sensitive information is stored on the server, and only a session ID is stored in the client's cookie.

Common use cases for sessions include:

- User authentication and authorization: Storing user credentials or tokens to maintain user sessions.
- Shopping carts: Keeping track of items a user has added to their cart while shopping.
- Personalization: Storing user-specific preferences and settings.
- Form data: Retaining user input data when moving between pages.
- Keeping track of user activity and interactions.

Sessions are implemented differently in various web technologies and frameworks. In server-side technologies like PHP or Express.js, sessions are typically managed using server-side storage, such as in-memory storage, databases, or other session management solutions. In client-side technologies, like single-page applications (SPAs), sessions may be managed differently, often relying on token-based authentication or custom state management solutions.

The goal of using sessions is to create a smooth and personalized user experience, as it allows the web application to remember user-specific data and interactions throughout the user's visit.

### refactor cookie

```js
attchcokies fn will attach the cookie with the jwt token and along with the res from the register
```

### signed and secured cookioes

- for safe cookie token pass the jwt.secret.signature in the cookieparser middleware

```js

app.use(cookieParser(process.env.JWT_SECRET)); //ccokie will be located in the req as signed cookies


 res.cookie('token', token, {
    httpOnly: true,
    expires: new Date(Date.now() + oneDay),
    secure: process.env.NODE_ENV === 'production', //if env is production returts true or false(in dev)
    signed: true //if teh signed value is true then we must sign it in the app middleware
  });
};
```

- when it comes to secure options it only allows the browsers to send through the https
- signed cookie will be visible but with the signature, so it can detect if the client modified the cookie
- if we didnot secure and signed the cookies then we can get the cookie from the req.cookies and if we secured and signed the cookies we get the cookies as req.cookies.signedcookies frorm the browser

### cookie lifecycle - once we send the jwt token in the cookie with res, for each req to that specific route the browser brings back the cookies from the request?

Yes, when you send a JWT token in a cookie as part of the response using `res.cookie()` or a similar method, the browser will automatically include that cookie in subsequent requests to the same domain and path. It's the browser's responsibility to manage and send cookies with each HTTP request to the same domain and path where the cookies are valid.

Here's a step-by-step breakdown of how this process works:

1. When the server sends a response that includes a JWT token in a cookie, the browser stores the cookie locally.

2. In subsequent requests to the same domain and path, the browser automatically attaches the relevant cookies to the request headers, including the JWT token stored in the cookie.

3. When the server receives a request, it can access the request headers, which include the cookies sent by the browser. This allows the server to retrieve the JWT token.

4. The server can then verify the JWT token, extract user information or permissions, and use it to authenticate and authorize the user for the requested route or resource.

This mechanism allows for user sessions and authentication to be maintained across multiple requests without the need for the user to reauthenticate on each request. The browser handles the cookie management, ensuring that the cookies are included in the request headers when appropriate.

It's essential to configure the cookie with the appropriate settings, such as domain, path, and expiration, to control the scope and lifetime of the cookie. Additionally, the JWT should be properly signed and secured to prevent tampering or unauthorized access.

### auth user setup

- authenticateUser middleware - for this check the signedcoookies in the rquest of the user router. to get the signed cookies confrim that u given the cookieparser middle are which helps to parse the cookie to the request

### login route and logout route

- login route
  check the email,password(400);
  check the existing email in db(401);
  use compare password method in user model

```js comparing the login password with hashed register password which is in DB
UserSchema.methods.comparePassword = async function (userpassword) {
  const isMatch = await bcrypt.compare(userpassword, this.password);
  return isMatch;
};
```

if it matched then give then return the tokenuser with user credentials and attach into the cookies with res of login and also return the response as tokenuser

inlogout

```js
const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now())
  });
  res.status(StatusCodes.OK).json({ msg: 'ok logged out' });
};

module.exports = { register, login, logout };
```

### middlewares in userRoutes

- authenticate user
  we use next() in the middleware to pass the credentials to the next controller/fn in the routes;
  in the req we check wether the token is signed;
  if signed then we verify the token with jwtverfy fn with jwtsecret and also destructure it and insert it with the req.user property nested obj property values and pass to the next fn/contorlller
  ```js
   const token = req.signedCookies.token;
    try {
    const { name, userId, role } = isTokenValid({ token });
    req.user = { name, userId, role };
  ```
- authpermissions

```js
const authPermission = (...roles) => {
  //here roles will act as a rest operator and it will return an array from a function
  return (req, res, next) => {
    // 403
    if (!roles.includes(req.user.role)) {
      throw new CustomError.UnauthorizedError('Unauthorized access to this user');
    }
    next();
  };
};
```

### authroutes and controllers

- getallusers

```js
const users = await User.find({ role: 'user' }).select('-password');
```

-getsingle user

```js
const user = await User.find({ _id: req.params.id }).select('-password');
const CustomError = require('../errors');
checkPermission(req.user, user[0]._id);
const checkPermission = (reqUser, resourceUserId) => {
  //if admin
  if (reqUser.role === 'admin') return;
  // if current user
  if (reqUser.userId === resourceUserId.toString()) return;
  //else
  throw new CustomError.UnauthorizedError('user not allowed to peek');
};
module.exports = checkPermission;
```

-showcurrent user

```js
res.status(StatusCodes.OK).json({ user: req.user });
```

-updateuser
update email and name

```js
const {email,name}=req.body
!email||!name? throw new Error(400): const user = await User.findOne({_id:req.body.userId})//this usderId we get from the create token obj from register
await.user.save();
//create updated tokken and attach the cookies
const tokenUser = createTokenUser(user)
attachcookiesTokenResoponse({res,user:tokenUser})

```

- updateuserPassword

```js
!oldpassword || !newpassword - check 400
check in DB findOne({_id:req.user.userId}) 404
compare the hashed registerd password with already existing oldpassword
 const isPasswordCorrect = await user.comparePassword(oldpassword);
check 401
user.password = newPassword
await user.save();
res.status(201).json(msg:'updated')
```

### create product routes and controller and model

creteproduct;

- link the product model with user model
- use middleware to wrap the token and give the uesr credentials
- create a user proberty to req body of the create product cont

getallproduct,getsingleproduct,updateproduct,deleteproduct,

imageUPload

```js
-app
const fileuploads = require('express-fileupload');
app.use(fileuploads())
- client
req.file=>key:image;value:file
localhost5000/api/v1/products/uploadImage
- shemamodel for product
image:{
  type:String,
  default:'public/upload/image.jpeg'
}
```

//1.self-invoked
require('dotenv').config();
require('express-async-errors');

//3.extra security package
const helmet = require('helmet');
const xss = require('xss-clean');
//4.app
const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const cors = require('cors');
//5.db
const connectDB = require('./db/connect');

const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');
const productRouter = require('./routes/productRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const orderRouter = require('./routes/orderRoutes');

const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
const Morgan = require('morgan');
const fileupload = require('express-fileupload');
//8.middleware- give access to json data in req.body
app.use(cors()); //if our clinet is on differnt port
app.use(Morgan('tiny'));
app.use(express.json()); //parse the json data
app.use(cookieParser(process.env.JWT_SECRET)); //ccokie will be located in the req as signed cookies
//if the client is inside the server use static to nsvigate
app.use(express.static('./public')); //once we upload to server we want that url to point to the public file
app.use(fileupload());
//9.routes
app.get('/api/v1', (req, res) => {
  // console.log('>>>>>>>>>>>>>>>>>>>>>>cookies', req.cookies);
  console.log('>>>>>>>>>>>>>>>>>>>>>>signedcookies', req.signedCookies);
  res.send('ecommerce cookie');
});
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

//10.Erro-middleware after routes
app.use(notFoundMiddleware); //404
app.use(errorHandlerMiddleware); //validation,duplicateentry,casterror-mongoose,express error
//6.port
const port = process.env.PORT || 5001;
//7.start-app-fn
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
    console.log('connectDB');
    app.listen(port, () => console.log(`server listening to port ${port}.........`));
  } catch (err) {
    console.log('express app error>>>>>>', err);
  }
};

start();

//if our react app is on the differnt domain i.e it is running in the port 3000 and our node app is on the port 5000 then the frontend has no access to node app to connect the both we need cors app.

//also if our client is on different domain and node is on different domain ,it is not possible for the cookies to transfer from one domain to another domain

//so for this cookies issue we can use proxy and add that proxy dependency in the frontend package at the end and give it as "proxy":"http//:localhost:5000"  so this must be the url and now the url from the frontend must be directed to the backend url

//##file upload(copy paste folder to server) 1.require fileupload, 2.make the folder public and give the foldername and the file name. in the image value of the product schema and give the type as string.

// ##file upload(upload to localhost server from local folder through postman) another way of file upload is in the postman 1.set the upload route to post, 2.go to the body and select the form-data,3.select the key as image as we specified it as image in the controller,4.select the text to file near it,5.select the file send the req and consolelog req.files in the uploadimage controller

// ##file upload(setup the public path) --after uploading the  image in the public path import the path module and already we imported the express-fileipload which should be imported before uploading the image and join the path with the public folder path

//=========================================

// ## connecting the react and node - same port and different port proxy and networking

// ## for the cookie we can only send them back to the same domain i.e 5000 to 5000 if it is on the different domain then use "proxy" in the client so that  it will send back to the server. while using the proxy set only the url to be directed in the fetch apis and other than directly settiong the url as the localhost//port:5000 like that

//## also we have redirects in the redirects were we will give the /api/* + to the link_ form_the_live_server
